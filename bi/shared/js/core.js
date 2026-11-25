/* Rihab BI — shared state, language, formatting and the building blocks every dashboard
   uses: filters, stat tiles, panels, insights and period helpers. */
(function () {
  "use strict";
  const M = window.RuhModel, CH = window.RuhCharts, esc = CH.esc;

  const LANG_KEY = "rihab.lang", SESSION_KEY = "rihab.bi.session.v1";   /* the language is Rihab's; the session is the Rihab BI sign-in */
  const store = {
    get: (s, k) => { try { return s.getItem(k); } catch (e) { return null; } },
    set: (s, k, v) => { try { v == null ? s.removeItem(k) : s.setItem(k, v); } catch (e) { /* private mode: keep going */ } },
  };
  const state = {
    flow: "app", lang: String(store.get(localStorage, LANG_KEY) || "").replace(/"/g, "") === "en" ? "en" : "ar",
    page: "overview", period: "30d", area: "all", category: "all", audience: "all",
    mapMetric: "users", askOpen: false, navOpen: false, tables: {},
  };

  /* ── language ── */
  const t = (ar, en) => (state.lang === "ar" ? ar : en);
  const L = (pair) => (pair ? (state.lang === "ar" ? pair.ar : pair.en) : "");
  /* the city this page shows (bi/<city>/city.js) and its words */
  const RC = window.RIHAB_BI_CITY;
  const CX = (k) => L(RC.terms[k]);
  const LOC = { ar: "ar-SA-u-ca-gregory-nu-arab", en: "en-GB" };
  const nfCache = {};
  const nf = (opts) => { const k = state.lang + JSON.stringify(opts); return nfCache[k] || (nfCache[k] = new Intl.NumberFormat(state.lang === "ar" ? "ar-SA-u-nu-arab" : "en-US", opts)); };
  const num = (v, d = 0) => nf({ maximumFractionDigits: d, minimumFractionDigits: d }).format(Number.isFinite(v) ? v : 0);
  function compact(v) {
    const a = Math.abs(v);
    if (a < 1000) return num(v, a < 10 && a % 1 ? 1 : 0);
    return nf({ notation: "compact", maximumFractionDigits: a < 1e4 || (a >= 1e6 && a < 1e7) ? 1 : 0 }).format(v);
  }
  /* signs come from the locale, so Arabic places them correctly */
  const pct = (v, d = 1, signed = false) => nf({ style: "percent", maximumFractionDigits: d, minimumFractionDigits: d, signDisplay: signed ? "exceptZero" : "auto" }).format(Number.isFinite(v) ? v : 0);
  const sar = (v) => (state.lang === "ar" ? compact(v) + " ر.س" : "SAR " + compact(v));
  const sarFull = (v) => (state.lang === "ar" ? num(v) + " ر.س" : "SAR " + num(v));
  const dfCache = {};
  const df = (opts) => { const k = state.lang + JSON.stringify(opts); return dfCache[k] || (dfCache[k] = new Intl.DateTimeFormat(LOC[state.lang], { timeZone: "UTC", ...opts })); };
  const dayDate = (d) => new Date(M.START + d * 864e5);
  const date = (d, o) => df(o || { day: "numeric", month: "short" }).format(dayDate(d));
  const dateLong = (d) => df({ day: "numeric", month: "long", year: "numeric" }).format(dayDate(d));
  const hijri = (d) => new Intl.DateTimeFormat(state.lang === "ar" ? "ar-SA-u-ca-islamic-umalqura-nu-arab" : "en-u-ca-islamic-umalqura", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(dayDate(d));
  const weekdays = () => [0, 1, 2, 3, 4, 5, 6].map((i) => df({ weekday: "short" }).format(new Date(Date.UTC(2026, 9, 25 + i))));
  const hours = () => Array.from({ length: 24 }, (_, h) => (state.lang === "ar" ? num(h) : String(h).padStart(2, "0")));
  window.RuhFmt = { t, num, compact, pct, sar, date, weekdays, get rtl() { return state.lang === "ar"; }, get lang() { return state.lang; } };

  /* ── filters ── */
  const filt = () => ({ period: state.period, area: state.area, category: state.category, audience: state.audience });
  const zoneName = (id) => L(M.ZONES[M.ZI[id]].name);
  const catName = (id) => L(M.CATS.find((c) => c.id === id).name);
  const audName = (a) => (a === "resident" ? t("السكان", "Residents") : a === "visitor" ? t("الزوار", "Visitors") : t("الجميع", "Everyone"));
  const AUD_SERIES = () => [{ key: 0, id: "resident", name: t("السكان", "Residents"), color: CH.AUD.resident }, { key: 1, id: "visitor", name: t("الزوار", "Visitors"), color: CH.AUD.visitor }]
    .filter((a) => state.audience === "all" || state.audience === a.id);

  /* period context: the window, its comparison window and its buckets */
  function ctx() {
    const r = M.range(state.period), f = filt();
    const B = M.buckets(r.d0, r.d1, r.gran);
    const prevName = r.p.prevName ? L(r.p.prevName) : t("الفترة السابقة", "Previous period");
    const vsText = r.p.prevName ? prevName : t("الفترة السابقة", "the previous period");
    return { r, f, B, cur: M.cubeAgg(f, r.d0, r.d1), prev: M.cubeAgg(f, r.p0, r.p1), prevName, vsText, days: r.d1 - r.d0 + 1 };
  }
  function blabel(b, gran) {
    if (gran === "month") return df({ month: "short", year: "2-digit" }).format(dayDate(b.a));
    return date(gran === "week" ? b.a : b.a);
  }
  /* sum a per-day array (indexed from d0) into the buckets */
  const bsum = (arr, B, d0) => B.map((b) => { let s = 0; for (let d = b.a; d <= b.b; d++) s += arr[d - d0] || 0; return s; });
  const bavg = (arr, B, d0) => bsum(arr, B, d0).map((v, i) => v / (B[i].b - B[i].a + 1));
  const addArr = (a, b) => a.map((v, i) => v + (b[i] || 0));
  /* season bands that fall inside the trend's buckets */
  function bands(B) {
    const out = [], names = { ramadan: [t("رمضان", "Ramadan")], eidFitr: [t("عيد الفطر", "Eid al-Fitr")], hajjDays: [t("الحج", "Hajj")], national: [t("اليوم الوطني", "National Day")], founding: [t("يوم التأسيس", "Founding Day")] };
    Object.keys(names).forEach((k) => M.SEASONS[k].forEach(([a, b]) => {
      const i0 = B.findIndex((x) => x.b >= a), i1 = B.length - 1 - B.slice().reverse().findIndex((x) => x.a <= b);
      if (i0 < 0 || i1 < 0 || i1 < i0 || B[i0].a > b) return;
      out.push({ from: i0, to: i1, name: names[k][0] });
    }));
    return out;
  }
  const delta = (cur, prev) => (prev > 0 ? cur / prev - 1 : cur > 0 ? null : 0);

  /* ── building blocks ── */
  const DEMO = () => '<span class="demo-tag" data-demo>' + esc(t("بيانات تجريبية", "Demo data")) + "</span>";
  const MONEY = () => '<span class="demo-tag money" data-demo>' + esc(t("أرقام مالية تجريبية", "Demo figures")) + "</span>";
  function deltaBadge(d, opts = {}) {
    if (d === null) return '<span class="delta new">' + esc(t("جديد", "New")) + "</span>";
    const good = opts.inverse ? d < 0 : d > 0, flat = Math.abs(d) < 0.005;
    const cls = flat ? "flat" : good ? "up" : "down";
    const arrow = flat ? "■" : d > 0 ? "▲" : "▼";
    return '<span class="delta ' + cls + '" title="' + esc(t("مقارنة بـ", "Compared with ") + (opts.vs || "")) + '"><span aria-hidden="true">' + arrow + "</span> " + esc(pct(Math.abs(d), 1)) + "</span>";
  }
  /* a stat tile: label, value, change against the comparison window, optional sparkline */
  function kpi(o) {
    return '<div class="kpi' + (o.hero ? " hero" : "") + '"' + (o.id ? ' data-kpi="' + o.id + '"' : "") + (o.raw != null ? ' data-v="' + o.raw + '"' : "") + '><div class="kpi-l">' + esc(o.label) + (o.demo ? ' <span class="dot-demo" title="' + esc(t("رقم تجريبي", "Demo figure")) + '">●</span>' : "") + "</div>" +
      '<div class="kpi-v">' + esc(o.value) + "</div>" +
      '<div class="kpi-f">' + (o.delta !== undefined ? deltaBadge(o.delta, { inverse: o.inverse, vs: o.vs }) : "") + (o.foot ? '<span class="kpi-s">' + esc(o.foot) + "</span>" : "") + "</div>" +
      (o.spark ? '<div class="kpi-sp">' + CH.spark(o.spark, o.color || CH.S[0]) + "</div>" : "") + "</div>";
  }
  /* stat tiles fill whole rows: 8 → 4 + 4, 6 → 6 (3 + 3 on smaller screens), 5 → 5 */
  const kpis = (list) => '<section class="kpis n' + list.length + '" aria-label="' + esc(t("المؤشرات الرئيسية", "Key figures")) + '">' + list.join("") + "</section>";
  let panelSeq = 0;
  /* a panel: title, subtitle, badges, the chart and its table twin (switch and CSV export) */
  function panel(o) {
    const id = o.id || "p" + (++panelSeq);
    const chart = o.chart || { html: o.html || "", table: null };
    const showTable = !!state.tables[id];
    if (chart.table) TABLES[id] = { title: o.title, table: chart.table };
    const tools = chart.table ? '<div class="p-tools"><button type="button" class="ghost sm" data-toggle-table="' + id + '" aria-pressed="' + showTable + '">' + icon(showTable ? "chart" : "table", 15) + "<span>" + esc(showTable ? t("الرسم", "Chart") : t("جدول", "Table")) + '</span></button><button type="button" class="ghost sm" data-csv="' + id + '" title="' + esc(t("تنزيل CSV", "Download CSV")) + '">' + icon("download", 15) + '<span class="sr">CSV</span></button></div>' : "";
    const tableHtml = chart.table ? '<div class="p-table"' + (showTable ? "" : " hidden") + ">" + tableView(chart.table) + "</div>" : "";
    return '<section class="panel span-' + (o.span || 1) + (o.cls ? " " + o.cls : "") + '" id="' + id + '"><header class="p-h"><div><h3>' + esc(o.title) + (o.demo ? " " + (o.demo === "money" ? MONEY() : DEMO()) : "") + "</h3>" + (o.sub ? "<p>" + esc(o.sub) + "</p>" : "") + "</div>" + tools + "</header>" +
      (o.controls || "") + '<div class="p-body"' + (showTable && chart.table ? " hidden" : "") + ">" + chart.html + "</div>" + tableHtml + (o.note ? '<footer class="p-note">' + esc(o.note) + "</footer>" : "") + "</section>";
  }
  const TABLES = {};
  function tableView(tb) {
    const fmtCell = (v) => (typeof v === "number" ? num(v, Math.abs(v) < 10 && v % 1 ? 1 : 0) : v);
    /* record ids are codes, the same in both languages */
    const idCol = tb.cols.map((c) => c === "المعرّف" || c === "ID");
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + tb.cols.map((c) => "<th>" + esc(c) + "</th>").join("") + "</tr></thead><tbody>" +
      tb.rows.map((r) => "<tr>" + r.map((v, i) => (idCol[i] ? '<td class="code" dir="ltr" translate="no">' : '<td class="' + (typeof v === "number" ? "num" : "") + '">') + esc(fmtCell(v)) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";
  }
  function insights(items) {
    return '<ul class="insights">' + items.filter(Boolean).map((it) => '<li><span class="ins-i">' + icon(it.icon || "spark", 16) + "</span><div><b>" + esc(it.title) + "</b><p>" + esc(it.text) + "</p></div></li>").join("") + "</ul>";
  }
  const grid = (...panels) => '<div class="grid">' + panels.join("") + "</div>";
  /* panels stacked in one grid column, beside a tall panel */
  const stack = (...panels) => '<div class="stack">' + panels.join("") + "</div>";
  const empty = (msg) => '<div class="state-view" role="status"><div class="state-icon">' + icon("compass", 24) + '</div><div class="state-title">' + esc(msg) + '</div><div class="state-body">' + esc(t("جرّب توسيع الفلاتر أو إعادتها إلى الوضع الافتراضي.", "Try widening the filters or resetting them.")) + '</div><button type="button" class="btn" data-reset>' + icon("reset", 16) + "<span>" + esc(t("إعادة ضبط الفلاتر", "Reset filters")) + "</span></button></div>";

  /* ── icons (inline, stroke-based) ── */
  const ICONS = {
    overview: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z", users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4M6 15V9a4 4 0 0 1 4-4h6M18 9v6a4 4 0 0 1-4 4H8", ticket: "M2 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zM13 5v2M13 17v2M13 11v2",
    bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0", building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4",
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 16v-4M12 8h.01", handshake: "m11 17 2 2a1 1 0 1 0 3-3M14 14l2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4M21 3l1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8",
    coins: "M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82", map: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0zM15 5.764v15M9 3.236v15",
    file: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4M8 13h8M8 17h5", table: "M12 3v18M3 9h18M3 15h18M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2", chart: "M3 3v18h18M7 16l4-6 4 4 5-7",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", reset: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5", spark: "M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z",
    compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z", menu: "M4 6h16M4 12h16M4 18h16", close: "M18 6 6 18M6 6l12 12", globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9", ask: "M12 3a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1-4.5-1.2L3 21l1.2-4.5A9 9 0 0 1 12 3zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
    alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", check: "M20 6 9 17l-5-5", clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2",
    up: "M7 17 17 7M7 7h10v10", print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z", send: "m22 2-7 20-4-9-9-4zM22 2 11 13", pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  };
  const icon = (n, s = 18) => '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICONS[n] || ICONS.info) + '"/></svg>';

  /* the city's wordmark, as in its app */
  function wordmark(size, light, latin = true) {
    return RC.wordmark(size, light, latin);
  }

  window.RuhBI = { M, CH, esc, state, store, LANG_KEY, SESSION_KEY, RC, CX, t, L, num, compact, pct, sar, sarFull, date, dateLong, hijri, weekdays, hours, filt, zoneName, catName, audName, AUD_SERIES,
    ctx, blabel, bsum, bavg, addArr, bands, delta, DEMO, MONEY, deltaBadge, kpi, kpis, panel, TABLES, tableView, insights, grid, stack, empty, icon, wordmark };
})();
