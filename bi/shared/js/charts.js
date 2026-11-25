/* Rihab BI — charts.
   Dependency-free SVG and HTML charts in the Noor palette. Every builder returns
   { html, table }: the chart, and the same numbers as a table (each panel can switch to it, and
   export it). Marks follow one spec: thin bars with rounded ends, 2px lines, 2px surface gaps,
   hairline grids, values in text colours, a legend for two or more series. Time and value axes
   run right to left in Arabic; the district map is geographic and never mirrors.
   Hover and keyboard focus show the same tooltip (data-tipj, rendered by app.js). */
(function () {
  "use strict";
  const F = () => window.RuhFmt;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* validated categorical order (adjacent pairs pass CVD and normal-vision floors on white):
     1 Grove (residents) · 2 Fajr (visitors) · 3 clay · 4 Madani rose · 5 lamp gold · 6 violet · 7 olive · 8 plum */
  const PAL = window.RIHAB_BI_CITY.palette;
  const S = PAL.S;
  const AUD = { resident: S[0], visitor: S[1] };
  const SEQ = PAL.SEQ;
  const SEQ_B = PAL.SEQ_B;
  const DIV = PAL.DIV;
  const NOOR = PAL.brand;
  const hex2 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = hex2(a), y = hex2(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  function ramp(t, r = SEQ) {
    t = Math.max(0, Math.min(1, isFinite(t) ? t : 0));
    const p = t * (r.length - 1), i = Math.min(r.length - 2, Math.floor(p));
    return mix(r[i], r[i + 1], p - i);
  }
  const inkOn = (bg) => { const [r, g, b] = hex2(bg); return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? "#1B2027" : "#FFFFFF"; };
  const tip = (title, rows) => ' data-tipj="' + esc(JSON.stringify({ t: title, r: rows || [] })) + '" tabindex="0"';
  const rtl = () => F().rtl;
  /* on a phone every chart gets the compact canvas, so its text stays readable */
  const narrow = (o) => !!(o && o.narrow) || (typeof window !== "undefined" && window.innerWidth < 760);
  function nice(max) {
    if (!(max > 0)) return 1;
    const e = Math.pow(10, Math.floor(Math.log10(max))), m = max / e;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e;
  }
  /* an axis top whose four steps are round numbers (0 / 1K / 2K / 3K / 4K) */
  const niceTop = (max) => nice((max > 0 ? max : 1) / 4) * 4;
  const legend = (items, kind) => '<div class="legend">' + items.map((it) => '<span class="lg"><i class="key ' + (kind || "box") + '" style="--c:' + it.color + '"></i>' + esc(it.name) + "</span>").join("") + "</div>";
  const tbl = (cols, rows) => ({ cols, rows });

  /* ── sparkline (stat tiles) ── */
  function spark(vals, color, w = 132, h = 34) {
    const n = vals.length;
    if (n < 2) return "";
    const mx = Math.max(...vals), mn = Math.min(...vals), sp = mx - mn || 1;
    const X = (i) => { const x = 3 + (i / (n - 1)) * (w - 6); return rtl() ? w - x : x; }, Y = (v) => 4 + (1 - (v - mn) / sp) * (h - 8);
    const d = vals.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("");
    return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true"><path d="' + d + 'L' + X(n - 1).toFixed(1) + " " + h + "L" + X(0).toFixed(1) + " " + h + 'Z" fill="' + color + '" opacity=".1"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="' + X(n - 1).toFixed(1) + '" cy="' + Y(vals[n - 1]).toFixed(1) + '" r="3.5" fill="' + color + '" stroke="#fff" stroke-width="2"/></svg>';
  }

  /* ── trend: lines or stacked areas over time, with a crosshair tooltip per date ──
     series [{ name, color, values }], labels [text], opts { stack, area, prev:{name, values}, fmt, h, bands:[{from,to,name}] } */
  function trend(series, labels, opts = {}) {
    const W = narrow(opts) ? 380 : 720, H = opts.h || (narrow(opts) ? 240 : 260), pt = 16, pb = 30, pa = 52, pz = 14, n = labels.length, fmt = opts.fmt || F().compact;
    const R = rtl(), x0 = R ? pz : pa, x1 = R ? W - pa : W - pz;
    const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
    const X = (i) => (R ? x1 - i * step : x0 + i * step);
    const stacked = !!opts.stack;
    const cum = series.map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) { let s = 0; series.forEach((se, k) => { s += se.values[i] || 0; cum[k][i] = s; }); }
    let mx = 0;
    for (let i = 0; i < n; i++) {
      mx = Math.max(mx, stacked ? cum[series.length - 1][i] : Math.max(...series.map((se) => se.values[i] || 0)));
      if (opts.prev) mx = Math.max(mx, opts.prev.values[i] || 0);
    }
    const top = niceTop(mx * 1.05), Y = (v) => pt + (1 - v / top) * (H - pt - pb);
    let g = "";
    for (let t = 0; t <= 4; t++) {
      const v = (top / 4) * t, y = Y(v);
      g += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="' + (t ? "gl" : "base") + '"/>';
      g += '<text x="' + (R ? x1 + 8 : x0 - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="' + (R ? "start" : "end") + '" class="tick">' + esc(fmt(v)) + "</text>";
    }
    const placed = [];
    (opts.bands || []).forEach((b) => {
      if (b.to < 0 || b.from > n - 1) return;
      const a = X(Math.max(0, b.from)), c = X(Math.min(n - 1, b.to)), mid = (a + c) / 2;
      g += '<rect x="' + Math.min(a, c).toFixed(1) + '" y="' + pt + '" width="' + Math.max(3, Math.abs(c - a)).toFixed(1) + '" height="' + (H - pt - pb) + '" class="band"/>';
      const half = b.name.length * 3.2 + 6;
      if (placed.some((p) => Math.abs(p - mid) < half + 34)) return;
      placed.push(mid);
      g += '<text x="' + Math.max(x0 + half, Math.min(x1 - half, mid)).toFixed(1) + '" y="' + (pt + 12) + '" text-anchor="middle" class="band-l">' + esc(b.name) + "</text>";
    });
    const every = Math.max(1, Math.ceil(n / (opts.xTicks || (narrow(opts) ? 4 : 7))));
    labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) g += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 9) + '" text-anchor="middle" class="tick">' + esc(l) + "</text>"; });
    const path = (vals) => vals.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("");
    let marks = "";
    if (opts.prev) marks += '<path d="' + path(opts.prev.values) + '" class="prev-line"/>';
    series.forEach((se, k) => {
      const vals = stacked ? cum[k] : se.values;
      const low = stacked && k ? cum[k - 1] : null;
      if (stacked || opts.area) {
        const base = low ? low.map((v, i) => "L" + X(n - 1 - i).toFixed(1) + " " + Y(low[n - 1 - i]).toFixed(1)).join("") : "L" + X(n - 1).toFixed(1) + " " + Y(0) + "L" + X(0).toFixed(1) + " " + Y(0);
        marks += '<path d="' + path(vals) + base + 'Z" fill="' + se.color + '" opacity="' + (stacked ? 0.2 : 0.1) + '"/>';
      }
      marks += '<path d="' + path(vals) + '" fill="none" stroke="' + se.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    });
    let hits = "";
    for (let i = 0; i < n; i++) {
      const rows = series.map((se) => [se.color, se.name, fmt(se.values[i] || 0)]);
      if (stacked && series.length > 1) rows.push([null, F().t("المجموع", "Total"), fmt(cum[series.length - 1][i])]);
      if (opts.prev) rows.push(["#9A9890", opts.prev.name, fmt(opts.prev.values[i] || 0)]);
      const cx = X(i), w = Math.max(6, step || 40);
      hits += '<g class="xcol"><rect x="' + (cx - w / 2).toFixed(1) + '" y="' + pt + '" width="' + w.toFixed(1) + '" height="' + (H - pt - pb) + '" class="hit"' + tip(labels[i], rows) + '/><line x1="' + cx.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y1="' + pt + '" y2="' + (H - pb) + '" class="guide"/>' +
        series.map((se, k) => '<circle cx="' + cx.toFixed(1) + '" cy="' + Y(stacked ? cum[k][i] : se.values[i] || 0).toFixed(1) + '" r="4" fill="' + se.color + '" class="dot"/>').join("") + "</g>";
    }
    const lg = series.length > 1 || opts.prev ? legend(series.map((s) => ({ name: s.name, color: s.color })).concat(opts.prev ? [{ name: opts.prev.name, color: "#9A9890" }] : []), stacked ? "box" : "line") : "";
    const html = '<div class="chart">' + lg + '<svg class="svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "") + '" dir="ltr">' + g + marks + hits + "</svg></div>";
    const cols = [F().t("الفترة", "Period")].concat(series.map((s) => s.name), opts.prev ? [opts.prev.name] : []);
    const rows = labels.map((l, i) => [l].concat(series.map((s) => s.values[i] || 0), opts.prev ? [opts.prev.values[i] || 0] : []));
    return { html, table: tbl(cols, rows) };
  }

  /* ── horizontal bars: ranked rows; parts split a bar into a stack ──
     rows [{ label, value, sub, parts:[{name,color,value}], attrs, note }] */
  function hbars(rows, opts = {}) {
    const fmt = opts.fmt || F().num, mx = opts.max || Math.max(1e-9, ...rows.map((r) => r.value));
    const color = opts.color || S[0];
    const html = '<div class="hbars' + (opts.compact ? " compact" : "") + '">' + (opts.legend ? legend(opts.legend) : "") + rows.map((r, i) => {
      const w = Math.max(0.6, (r.value / mx) * 100);
      const parts = r.parts ? r.parts.map((p) => '<i class="seg" style="width:' + ((p.value / (r.value || 1)) * 100).toFixed(2) + "%;background:" + p.color + '"' + tip(r.label, [[p.color, p.name, fmt(p.value)], [null, F().t("المجموع", "Total"), fmt(r.value)]]) + "></i>").join("") : "";
      return '<div class="hb' + (r.attrs ? " clickable" : "") + '"' + (r.attrs || "") + '><div class="hb-l"><span class="hb-n">' + (opts.rank ? '<b class="rk">' + F().num(i + 1) + "</b>" : "") + esc(r.label) + "</span>" + (r.sub ? '<small>' + esc(r.sub) + "</small>" : "") + '</div><div class="hb-t"><div class="hb-b" style="width:' + w.toFixed(2) + "%;" + (parts ? "" : "background:" + (r.color || color)) + '"' + (parts ? "" : tip(r.label, [[r.color || color, opts.name || "", fmt(r.value)]].concat(r.note ? [[null, r.note[0], r.note[1]]] : []))) + ">" + parts + '</div><span class="hb-v">' + esc(fmt(r.value)) + (r.tail ? '<small>' + esc(r.tail) + "</small>" : "") + "</span></div></div>";
    }).join("") + "</div>";
    const cols = [opts.labelCol || F().t("البند", "Item")].concat(rows[0] && rows[0].parts ? rows[0].parts.map((p) => p.name) : [], [opts.name || F().t("القيمة", "Value")]);
    return { html, table: tbl(cols, rows.map((r) => [r.label].concat(r.parts ? r.parts.map((p) => p.value) : [], [r.value]))) };
  }

  /* ── vertical columns: categories × up to three series ── */
  function columns(cats, series, opts = {}) {
    const fmt = opts.fmt || F().compact, H = opts.h || 190;
    const mx = niceTop(Math.max(1e-9, ...cats.map((_, i) => opts.stack ? series.reduce((s, se) => s + (se.values[i] || 0), 0) : Math.max(...series.map((se) => se.values[i] || 0)))) * 1.05);
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => '<div class="cl-grid" style="bottom:' + t * 100 + '%"><span>' + esc(fmt(mx * t)) + "</span></div>").join("");
    const body = cats.map((c, i) => {
      const bars = opts.stack
        ? '<div class="cl-stack">' + series.map((se) => '<i style="height:' + ((se.values[i] || 0) / mx * 100).toFixed(2) + "%;background:" + se.color + '"' + tip(c, series.map((s) => [s.color, s.name, fmt(s.values[i] || 0)])) + "></i>").reverse().join("") + "</div>"
        : series.map((se) => '<i class="cl-bar" style="height:' + Math.max(0.5, (se.values[i] || 0) / mx * 100).toFixed(2) + "%;background:" + se.color + '"' + tip(c, series.map((s) => [s.color, s.name, fmt(s.values[i] || 0)])) + "></i>").join("");
      return '<div class="cl-col"><div class="cl-bars">' + bars + '</div><div class="cl-x">' + esc(c) + "</div></div>";
    }).join("");
    const html = '<div class="chart">' + (series.length > 1 ? legend(series.map((s) => ({ name: s.name, color: s.color }))) : "") + '<div class="columns" style="--h:' + H + 'px"><div class="cl-plot">' + ticks + '<div class="cl-row">' + body + "</div></div></div></div>";
    return { html, table: tbl([opts.labelCol || F().t("الفئة", "Category")].concat(series.map((s) => s.name)), cats.map((c, i) => [c].concat(series.map((s) => s.values[i] || 0)))) };
  }

  /* ── donut: part-to-whole for six parts or fewer ── */
  function donut(segs, opts = {}) {
    const fmt = opts.fmt || F().num, total = segs.reduce((s, x) => s + x.value, 0) || 1;
    const R = 78, r = 52, cx = 90, cy = 90;
    let a = -Math.PI / 2, arcs = "";
    segs.forEach((s) => {
      const da = (s.value / total) * Math.PI * 2;
      if (da <= 0) return;
      const a2 = a + da, large = da > Math.PI ? 1 : 0;
      const p = (rad, ang) => [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)].map((v) => v.toFixed(2)).join(" ");
      const d = da >= Math.PI * 2 - 1e-6
        ? "M" + p(R, a) + "A" + R + " " + R + " 0 1 1 " + p(R, a + Math.PI) + "A" + R + " " + R + " 0 1 1 " + p(R, a) + "M" + p(r, a) + "A" + r + " " + r + " 0 1 0 " + p(r, a + Math.PI) + "A" + r + " " + r + " 0 1 0 " + p(r, a) + "Z"
        : "M" + p(R, a) + "A" + R + " " + R + " 0 " + large + " 1 " + p(R, a2) + "L" + p(r, a2) + "A" + r + " " + r + " 0 " + large + " 0 " + p(r, a) + "Z";
      arcs += '<path d="' + d + '" fill="' + s.color + '" class="arc"' + tip(s.name, [[s.color, fmt(s.value), F().pct(s.value / total)]]) + "/>";
      a = a2;
    });
    const cv = String(opts.center || F().compact(total));
    const center = '<text x="90" y="86" text-anchor="middle" class="d-v" style="font-size:' + (cv.length > 9 ? 15 : cv.length > 6 ? 18 : 21) + 'px">' + esc(cv) + '</text><text x="90" y="106" text-anchor="middle" class="d-l">' + esc(opts.centerLabel || F().t("المجموع", "Total")) + "</text>";
    const list = '<ul class="d-list">' + segs.map((s) => '<li><i class="key box" style="--c:' + s.color + '"></i><span>' + esc(s.name) + "</span><b>" + esc(F().pct(s.value / total)) + "</b><small>" + esc(fmt(s.value)) + "</small></li>").join("") + "</ul>";
    const html = '<div class="donut"><svg viewBox="0 0 180 180" class="d-svg" role="img" aria-label="' + esc(opts.aria || "") + '">' + arcs + center + "</svg>" + list + "</div>";
    return { html, table: tbl([F().t("الجزء", "Part"), F().t("القيمة", "Value"), F().t("الحصة", "Share")], segs.map((s) => [s.name, s.value, F().pct(s.value / total)])) };
  }

  /* ── funnel: ordered stages, the conversion from each step to the next ── */
  function funnel(stages, opts = {}) {
    const fmt = opts.fmt || F().num, mx = Math.max(1e-9, ...stages.map((s) => s.value)), n = stages.length;
    const html = '<div class="funnel">' + stages.map((s, i) => {
      const w = Math.max(4, (s.value / mx) * 100), col = opts.colors ? opts.colors[i] : ramp(0.38 + (0.62 * i) / Math.max(1, n - 1));
      const conv = i ? s.value / (stages[i - 1].value || 1) : null;
      return '<div class="fn-row"><div class="fn-l"><b>' + esc(s.name) + "</b>" + (s.sub ? "<small>" + esc(s.sub) + "</small>" : "") + '</div><div class="fn-t"><div class="fn-b" style="width:' + w.toFixed(2) + "%;background:" + col + '"' + tip(s.name, [[col, fmt(s.value), i ? F().t("من المرحلة السابقة ", "from the previous step ") + F().pct(conv) : ""]]) + '></div></div><div class="fn-v"><b>' + esc(fmt(s.value)) + "</b>" + (i ? '<small class="fn-c">' + esc(F().pct(conv)) + "</small>" : "<small>&nbsp;</small>") + "</div></div>";
    }).join("") + "</div>";
    return { html, table: tbl([F().t("المرحلة", "Step"), F().t("العدد", "Count"), F().t("التحويل من السابقة", "Conversion from previous")], stages.map((s, i) => [s.name, s.value, i ? F().pct(s.value / (stages[i - 1].value || 1)) : "—"])) };
  }

  /* ── sankey: three columns of nodes, flows as bands (mirrors in Arabic) ── */
  function sankey(cols, links, opts = {}) {
    const W = narrow(opts) ? 520 : 720, H = opts.h || 330, nw = 12, gap = 10, R = rtl(), fmt = opts.fmt || F().compact;
    const side = narrow(opts) ? 112 : 130;
    const colX = cols.map((_, i) => side + i * ((W - side * 2) / (cols.length - 1)));
    const X = (x) => (R ? W - x : x);
    const nodes = {};
    cols.forEach((col, ci) => {
      const tot = col.reduce((s, n) => s + n.value, 0), avail = H - 20 - gap * (col.length - 1);
      let y = 10;
      col.forEach((nd) => { const h = Math.max(2, (nd.value / tot) * avail); nodes[nd.id] = { ...nd, ci, x: colX[ci], y, h, out: 0, in: 0 }; y += h + gap; });
    });
    const scale = (id) => nodes[id].h / nodes[id].value;
    let paths = "";
    links.forEach((l) => {
      const a = nodes[l.from], b = nodes[l.to];
      if (!a || !b || l.value <= 0) return;
      const h1 = l.value * scale(l.from), h2 = l.value * scale(l.to);
      const y1 = a.y + a.out + h1 / 2, y2 = b.y + b.in + h2 / 2;
      a.out += h1; b.in += h2;
      const xa = X(a.x + (R ? -nw / 2 : nw / 2)), xb = X(b.x + (R ? nw / 2 : -nw / 2)), mxp = (xa + xb) / 2;
      paths += '<path d="M' + xa.toFixed(1) + " " + y1.toFixed(1) + "C" + mxp.toFixed(1) + " " + y1.toFixed(1) + " " + mxp.toFixed(1) + " " + y2.toFixed(1) + " " + xb.toFixed(1) + " " + y2.toFixed(1) + '" class="sk-link" stroke-width="' + Math.max(1, (h1 + h2) / 2).toFixed(1) + '"' + tip(a.name + " ← " + b.name, [[null, fmt(l.value), F().pct(l.value / a.value) + F().t(" من ", " of ") + a.name]]) + "/>";
    });
    let nd = "";
    Object.values(nodes).forEach((n) => {
      const x = X(n.x) - nw / 2;
      nd += '<rect x="' + x.toFixed(1) + '" y="' + n.y.toFixed(1) + '" width="' + nw + '" height="' + n.h.toFixed(1) + '" rx="3" fill="' + (n.color || NOOR) + '"' + tip(n.name, [[n.color || NOOR, fmt(n.value), ""]]) + "/>";
      const tx = n.ci === 0 ? X(n.x) + (R ? 10 : -10) : n.ci === cols.length - 1 ? X(n.x) + (R ? -10 : 10) : X(n.x) + (R ? -10 : 10);
      const anchor = n.ci === 0 ? (R ? "start" : "end") : (R ? "end" : "start");
      nd += '<text x="' + tx.toFixed(1) + '" y="' + (n.y + n.h / 2 + 4).toFixed(1) + '" text-anchor="' + anchor + '" class="sk-l">' + esc(n.name) + ' <tspan class="sk-v">' + esc(fmt(n.value)) + "</tspan></text>";
    });
    const html = '<div class="chart"><svg class="svg" viewBox="0 0 ' + W + " " + H + '" dir="ltr" role="img" aria-label="' + esc(opts.aria || "") + '">' + paths + nd + "</svg></div>";
    return { html, table: tbl([F().t("من", "From"), F().t("إلى", "To"), F().t("العدد", "Count")], links.map((l) => [nodes[l.from] ? nodes[l.from].name : l.from, nodes[l.to] ? nodes[l.to].name : l.to, l.value])) };
  }

  /* ── heatmap grid (weekday × hour, or any matrix) ── */
  function heatmap(matrix, rowLabels, colLabels, opts = {}) {
    matrix = matrix.map((r) => Array.from(r));
    const fmt = opts.fmt || F().num, flat = matrix.flat(), mx = Math.max(1e-9, ...flat), mn = opts.zero ? 0 : Math.min(...flat);
    const every = opts.colEvery || 1;
    const head = '<div class="hm-row hm-head' + (opts.rotate ? " rot" : "") + '"><span></span>' + colLabels.map((c, i) => "<span>" + (i % every === 0 ? esc(c) : "") + "</span>").join("") + "</div>";
    const body = matrix.map((row, ri) => '<div class="hm-row"><span class="hm-rl">' + esc(rowLabels[ri]) + "</span>" + row.map((v, ci) => {
      const t = (v - mn) / (mx - mn || 1), bg = ramp(t, opts.ramp || SEQ);
      return '<i style="background:' + bg + '"' + tip(rowLabels[ri] + " · " + colLabels[ci], [[bg, fmt(v), opts.unit || ""]]) + "></i>";
    }).join("") + "</div>").join("");
    const scale = '<div class="hm-scale"><span>' + esc(F().t("أقل", "Less")) + '</span><i style="background:linear-gradient(' + (rtl() ? "270deg" : "90deg") + "," + (opts.ramp || SEQ).join(",") + ')"></i><span>' + esc(F().t("أكثر", "More")) + "</span></div>";
    const html = '<div class="heatmap" style="--cols:' + colLabels.length + ";--rl:" + (opts.rowLabel || 78) + 'px">' + head + body + scale + "</div>";
    return { html, table: tbl([""].concat(colLabels), matrix.map((r, i) => [rowLabels[i]].concat(r.map((v) => Math.round(v))))) };
  }

  /* ── cohort retention: weekly cohorts × weeks since joining ── */
  function cohort(rows, opts = {}) {
    const maxW = Math.max(...rows.map((r) => r.weeks.length));
    const head = "<tr><th>" + esc(F().t("الأسبوع", "Cohort")) + "</th><th>" + esc(F().t("مستخدمون جدد", "New users")) + "</th>" + Array.from({ length: maxW }, (_, w) => "<th>" + esc(F().t("أ", "W") + F().num(w)) + "</th>").join("") + "</tr>";
    const body = rows.map((r) => "<tr><th>" + esc(r.label) + "</th><td class=\"num\">" + esc(F().compact(r.size)) + "</td>" + Array.from({ length: maxW }, (_, w) => {
      if (w >= r.weeks.length) return '<td class="empty"></td>';
      const v = r.weeks[w], bg = w === 0 ? "#EEEDE8" : ramp(Math.min(1, v / 0.6));
      return '<td style="background:' + bg + ";color:" + inkOn(bg) + '"' + tip(r.label + " · " + F().t("الأسبوع ", "Week ") + F().num(w), [[bg, F().pct(v), F().t("عادوا للتطبيق", "came back")]]) + ">" + esc(F().pct(v, 0)) + "</td>";
    }).join("") + "</tr>").join("");
    const html = '<div class="cohort-wrap"><table class="cohort"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
    const wk = Array.from({ length: maxW }, (_, w) => w);
    const cols = [F().t("الأسبوع", "Cohort"), F().t("مستخدمون جدد", "New users")].concat(wk.map((w) => F().t("أ", "W") + w));
    return { html, table: tbl(cols, rows.map((r) => [r.label, Math.round(r.size)].concat(wk.map((w) => (w < r.weeks.length ? F().pct(r.weeks[w]) : ""))))) };
  }

  /* ── calendar heatmap: one cell per day, weeks as columns ── */
  function calendar(days, opts = {}) {
    const fmt = opts.fmt || F().num, vals = days.map((d) => d.value), mx = Math.max(1e-9, ...vals), mn = Math.min(...vals);
    const first = days[0].dow, cells = [];
    for (let i = 0; i < first; i++) cells.push('<i class="pad"></i>');
    days.forEach((d) => {
      const bg = ramp((d.value - mn) / (mx - mn || 1), opts.ramp || SEQ);
      cells.push('<i style="background:' + bg + '"' + tip(d.label, [[bg, fmt(d.value), d.note || ""]]) + "></i>");
    });
    const wk = F().weekdays();
    const cell = days.length <= 35 ? 22 : days.length <= 100 ? 16 : 12;
    const html = '<div class="calendar" style="--cs:' + cell + 'px"><div class="cal-days">' + wk.map((w, i) => "<span>" + (i % 2 ? "" : esc(w)) + "</span>").join("") + '</div><div class="cal-grid">' + cells.join("") + '</div></div><div class="hm-scale"><span>' + esc(F().t("أقل", "Less")) + '</span><i style="background:linear-gradient(' + (rtl() ? "270deg" : "90deg") + "," + (opts.ramp || SEQ).join(",") + ')"></i><span>' + esc(F().t("أكثر", "More")) + "</span></div>";
    return { html, table: tbl([F().t("اليوم", "Day"), opts.name || F().t("القيمة", "Value")], days.map((d) => [d.label, d.value])) };
  }

  /* ── district map: Voronoi cells of the 15 home areas inside the city outline ──
     sites [{ id, name, x, y, value, label }], opts { ramp, diverging, fmt, selected, landmarks:[{name,x,y}], center } */
  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function clip(poly, a, b, c) {   /* keep the side where a·x + b·y <= c */
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length], fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
      if (fp <= 0) out.push(p);
      if (fp * fq < 0) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  }
  let OUTLINE = null;
  function outline(points) {
    if (OUTLINE) return OUTLINE;
    const h = hull(points), cx = h.reduce((s, p) => s + p[0], 0) / h.length, cy = h.reduce((s, p) => s + p[1], 0) / h.length;
    /* grow the hull, then round it with a few smoothing passes */
    let poly = h.map((p) => { const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy) || 1; return [p[0] + (dx / L) * 0.07, p[1] + (dy / L) * 0.07]; });
    for (let k = 0; k < 3; k++) {
      const next = [];
      poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; next.push([p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25], [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]); });
      poly = next;
    }
    OUTLINE = poly;
    return poly;
  }
  function polyStats(pts) {   /* area and centroid of a polygon */
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], cr = p[0] * q[1] - q[0] * p[1];
      a += cr; cx += (p[0] + q[0]) * cr; cy += (p[1] + q[1]) * cr;
    }
    a /= 2;
    return { area: Math.abs(a), x: cx / (6 * a), y: cy / (6 * a) };
  }
  function districtMap(sites, opts = {}) {
    const fmt = opts.fmt || F().num, all = opts.allPoints;
    const poly = outline(all);
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const W = narrow(opts) ? 440 : 720, H = Math.round(W * (maxY - minY) / (maxX - minX)), pad = 8;
    const sx = (x) => pad + ((x - minX) / (maxX - minX)) * (W - pad * 2), sy = (y) => pad + ((y - minY) / (maxY - minY)) * (H - pad * 2);
    const vals = sites.map((s) => s.value), mx = Math.max(...vals.map(Math.abs), 1e-9), mn = Math.min(...vals);
    const lo = opts.zero ? 0 : mn * 0.85;
    const color = (v) => (opts.diverging ? ramp(0.5 + Math.max(-1, Math.min(1, v / (opts.divMax || mx))) / 2, DIV) : ramp(0.08 + 0.92 * ((v - lo) / (mx - lo || 1)), opts.ramp || SEQ));
    let cells = "", labels = "";
    const center = opts.center ? [sx(opts.center.x), sy(opts.center.y)] : null;
    sites.forEach((s, i) => {
      let cell = poly;
      sites.forEach((o, j) => {
        if (i === j) return;
        const a = o.x - s.x, b = o.y - s.y, c = (o.x * o.x + o.y * o.y - s.x * s.x - s.y * s.y) / 2;
        cell = clip(cell, a, b, c);
      });
      if (cell.length < 3) return;
      const px = cell.map((p) => [sx(p[0]), sy(p[1])]);
      const d = "M" + px.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
      const fill = color(s.value), sel = opts.selected === s.id;
      cells += '<path d="' + d + '" fill="' + fill + '" class="cell' + (sel ? " sel" : "") + (opts.dim && !sel ? " dim" : "") + '" data-set-area="' + esc(s.id) + '"' + tip(s.name, [[fill, s.label != null ? s.label : fmt(s.value), s.note || ""]].concat(s.extra || [])) + "/>";
      /* labels sit in the middle of the cell, sized to it; the smallest cells keep only the tooltip */
      const st = polyStats(px), ink = inkOn(fill), k = W / 720;
      let lx = st.x, ly = st.y;
      if (center && Math.hypot(lx - center[0], ly - center[1]) < 22 * k + 8) ly = center[1] + 24 * k + 6;
      const big = st.area > 5200 * k * k, mid = st.area > 2300 * k * k;
      if (!mid) return;
      labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly - (big ? 2 : -3)).toFixed(1) + '" text-anchor="middle" class="m-n' + (big ? "" : " sm") + '" fill="' + ink + '">' + esc(s.short || s.name) + "</text>";
      if (big) labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 13).toFixed(1) + '" text-anchor="middle" class="m-v" fill="' + ink + '">' + esc(s.label != null ? s.label : fmt(s.value)) + "</text>";
    });
    let marks = "";
    (opts.landmarks || []).forEach((l) => { marks += '<circle cx="' + sx(l.x).toFixed(1) + '" cy="' + sy(l.y).toFixed(1) + '" r="4.5" class="lm"' + tip(l.name, l.rows || []) + "/>"; });
    if (center) marks += '<g class="mosque"' + tip(opts.center.name, []) + '><circle cx="' + center[0].toFixed(1) + '" cy="' + center[1].toFixed(1) + '" r="8" fill="#F3D79E" stroke="' + NOOR + '" stroke-width="2"/><circle cx="' + center[0].toFixed(1) + '" cy="' + center[1].toFixed(1) + '" r="2.6" fill="' + NOOR + '"/></g>';
    const grad = '<i style="background:linear-gradient(' + (rtl() ? "270deg" : "90deg") + "," + (opts.diverging ? DIV : opts.ramp || SEQ).join(",") + ')"></i>';
    const scale = opts.diverging
      ? '<div class="hm-scale"><span>' + esc(F().t("تراجع", "Decline")) + "</span>" + grad + "<span>" + esc(F().t("نمو", "Growth")) + "</span></div>"
      : '<div class="hm-scale"><span>' + esc(fmt(opts.zero ? 0 : mn)) + "</span>" + grad + "<span>" + esc(fmt(mx)) + "</span></div>";
    const html = '<div class="map-wrap"><svg class="svg map" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(opts.aria || "") + '"><path d="M' + poly.map((p) => sx(p[0]).toFixed(1) + " " + sy(p[1]).toFixed(1)).join("L") + 'Z" class="outline"/>' + cells + labels + marks + "</svg>" + scale + "</div>";
    return { html, table: tbl([F().t("المنطقة", "Area"), opts.name || F().t("القيمة", "Value")], sites.slice().sort((a, b) => b.value - a.value).map((s) => [s.name, s.label != null ? s.label : s.value])) };
  }

  /* ── bubble: two measures and a size; quadrant lines at the medians ── */
  function bubble(points, opts = {}) {
    const W = narrow(opts) ? 440 : opts.wide ? 1080 : 720, H = opts.h || 340, pl = 56, pr = 18, pt = 28, pb = 40, R = rtl();
    const fx = opts.fx || F().compact, fy = opts.fy || F().pct;
    const xmax = nice(Math.max(...points.map((p) => p.x)) * 1.08), ymax = opts.ymax || nice(Math.max(...points.map((p) => p.y)) * 1.1), ymin = opts.ymin || 0, xmin = opts.xmin || 0;
    const smax = Math.max(...points.map((p) => p.s), 1e-9);
    const x0 = R ? pr : pl, x1 = R ? W - pl : W - pr;
    const X = (v) => { const t = (Math.max(xmin, v) - xmin) / (xmax - xmin); return R ? x1 - t * (x1 - x0) : x0 + t * (x1 - x0); }, Y = (v) => pt + (1 - (Math.max(ymin, v) - ymin) / (ymax - ymin)) * (H - pt - pb);
    let g = "";
    for (let t = 0; t <= 4; t++) {
      const yv = ymin + ((ymax - ymin) / 4) * t, xv = xmin + ((xmax - xmin) / 4) * t, y = Y(yv), x = X(xv);
      g += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="' + (t ? "gl" : "base") + '"/><text x="' + (R ? x1 + 8 : x0 - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="' + (R ? "start" : "end") + '" class="tick">' + esc(fy(yv)) + "</text>";
      g += '<text x="' + x.toFixed(1) + '" y="' + (H - 20) + '" text-anchor="middle" class="tick">' + esc(fx(xv)) + "</text>";
    }
    g += '<text x="' + ((x0 + x1) / 2) + '" y="' + (H - 3) + '" text-anchor="middle" class="axis-t">' + esc(opts.xName || "") + "</text>";
    g += '<text x="' + (R ? W - 4 : 4) + '" y="12" text-anchor="' + (R ? "end" : "start") + '" class="axis-t">' + esc(opts.yName || "") + "</text>";
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const mxv = med(points.map((p) => p.x)), myv = med(points.map((p) => p.y));
    g += '<line x1="' + X(mxv).toFixed(1) + '" x2="' + X(mxv).toFixed(1) + '" y1="' + pt + '" y2="' + (H - pb) + '" class="quad"/><line x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(myv).toFixed(1) + '" y2="' + Y(myv).toFixed(1) + '" class="quad"/>';
    if (opts.quads) {
      const q = opts.quads;
      g += '<text x="' + (R ? x0 + 6 : x1 - 6) + '" y="' + (pt + 14) + '" text-anchor="' + (R ? "start" : "end") + '" class="quad-l">' + esc(q[0]) + "</text>";
      g += '<text x="' + (R ? x1 - 6 : x0 + 6) + '" y="' + (pt + 14) + '" text-anchor="' + (R ? "end" : "start") + '" class="quad-l">' + esc(q[1]) + "</text>";
      g += '<text x="' + (R ? x0 + 6 : x1 - 6) + '" y="' + (H - pb - 8) + '" text-anchor="' + (R ? "start" : "end") + '" class="quad-l">' + esc(q[2]) + "</text>";
    }
    const sorted = points.slice().sort((a, b) => b.s - a.s);
    const labelled = new Set(sorted.slice(0, opts.labels ?? 5).map((p) => p.name)), taken = [];
    let dots = "", lbl = "";
    sorted.forEach((p) => {
      const r = 4 + Math.sqrt(p.s / smax) * (opts.rmax || 20), cx = X(p.x), cy = Y(p.y), col = p.color || S[0];
      dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '" fill-opacity=".55" stroke="#fff" stroke-width="2" class="bub"' + tip(p.name, [[col, fx(p.x), opts.xName || ""], [null, fy(p.y), opts.yName || ""], [null, F().num(p.s), opts.sName || ""]]) + "/>";
      /* a label is placed only where it does not collide with one already placed */
      const ly = cy - r - 5, half = (p.short || p.name).length * 3.1 + 4;
      if (labelled.has(p.name) && !taken.some((q) => Math.abs(q[0] - cx) < q[2] + half && Math.abs(q[1] - ly) < 14)) {
        taken.push([cx, ly, half]);
        lbl += '<text x="' + Math.max(half, Math.min(W - half, cx)).toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" class="bub-l">' + esc(p.short || p.name) + "</text>";
      }
    });
    const html = '<div class="chart">' + (opts.legend ? legend(opts.legend) : "") + '<svg class="svg" viewBox="0 0 ' + W + " " + H + '" dir="ltr" role="img" aria-label="' + esc(opts.aria || "") + '">' + g + dots + lbl + "</svg></div>";
    return { html, table: tbl([F().t("البند", "Item"), opts.xName || "x", opts.yName || "y", opts.sName || F().t("الحجم", "Size")], points.map((p) => [p.name, Math.round(p.x), fy(p.y), Math.round(p.s)])) };
  }

  /* ── butterfly: two audiences side by side, one band per row (e.g. age) ── */
  function butterfly(rows, left, right, opts = {}) {
    const fmt = opts.fmt || F().pct, mx = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1e-9);
    const html = '<div class="chart">' + legend([{ name: left.name, color: left.color }, { name: right.name, color: right.color }]) + '<div class="bfly">' + rows.map((r) =>
      '<div class="bf-row"><div class="bf-side bf-a"><span class="bf-v">' + esc(fmt(r.a)) + '</span><i style="width:' + (r.a / mx * 100).toFixed(2) + "%;background:" + left.color + '"' + tip(r.label, [[left.color, left.name, fmt(r.a)]]) + '></i></div><div class="bf-l">' + esc(r.label) + '</div><div class="bf-side bf-b"><i style="width:' + (r.b / mx * 100).toFixed(2) + "%;background:" + right.color + '"' + tip(r.label, [[right.color, right.name, fmt(r.b)]]) + '></i><span class="bf-v">' + esc(fmt(r.b)) + "</span></div></div>").join("") + "</div></div>";
    return { html, table: tbl([F().t("الفئة", "Group"), left.name, right.name], rows.map((r) => [r.label, fmt(r.a), fmt(r.b)])) };
  }

  /* ── treemap (squarified): part-to-whole for many parts ── */
  function treemap(items, opts = {}) {
    const fmt = opts.fmt || F().sar, total = items.reduce((s, x) => s + x.value, 0) || 1;
    const W = 100, H = 100, area = W * H;
    const nodes = items.filter((x) => x.value > 0).sort((a, b) => b.value - a.value).map((x) => ({ ...x, a: (x.value / total) * area }));
    const out = [];
    function worst(row, w) { const s = row.reduce((t, r) => t + r.a, 0), mx = Math.max(...row.map((r) => r.a)), mn = Math.min(...row.map((r) => r.a)); return Math.max((w * w * mx) / (s * s), (s * s) / (w * w * mn)); }
    function layout(list, x, y, w, h) {
      if (!list.length) return;
      const short = Math.min(w, h);
      let row = [list[0]], i = 1;
      while (i < list.length && worst(row.concat([list[i]]), short) <= worst(row, short)) { row.push(list[i]); i++; }
      const s = row.reduce((t, r) => t + r.a, 0);
      if (w >= h) { const cw = s / h; let cy = y; row.forEach((r) => { const rh = r.a / cw; out.push({ ...r, x, y: cy, w: cw, h: rh }); cy += rh; }); layout(list.slice(i), x + cw, y, w - cw, h); }
      else { const rh = s / w; let cx = x; row.forEach((r) => { const rw = r.a / rh; out.push({ ...r, x: cx, y, w: rw, h: rh }); cx += rw; }); layout(list.slice(i), x, y + rh, w, h - rh); }
    }
    layout(nodes, 0, 0, W, H);
    const R = rtl();
    const html = '<div class="chart">' + (opts.legend ? legend(opts.legend) : "") + '<div class="treemap" style="--h:' + (opts.h || 300) + 'px">' + out.map((r) => {
      const big = r.w * r.h > 90;
      return '<div class="tm" style="' + (R ? "right" : "left") + ":" + r.x.toFixed(3) + "%;top:" + r.y.toFixed(3) + "%;width:" + r.w.toFixed(3) + "%;height:" + r.h.toFixed(3) + "%;background:" + r.color + ";color:" + inkOn(r.color) + '"' + tip(r.name, [[r.color, fmt(r.value), F().pct(r.value / total)]].concat(r.rows || [])) + ">" + (big ? "<b>" + esc(r.name) + "</b><span>" + esc(fmt(r.value)) + "</span>" : "") + "</div>";
    }).join("") + "</div></div>";
    return { html, table: tbl([F().t("البند", "Item"), opts.name || F().t("القيمة", "Value"), F().t("الحصة", "Share")], nodes.map((r) => [r.name, Math.round(r.value), F().pct(r.value / total)])) };
  }

  /* ── waterfall: from the previous period to this one, step by step ── */
  function waterfall(steps, opts = {}) {
    const fmt = opts.fmt || F().sar, H = opts.h || 220;
    let run = 0;
    const bars = steps.map((s) => {
      if (s.total) { run = s.value; return { ...s, lo: 0, hi: s.value }; }
      const lo = Math.min(run, run + s.value), hi = Math.max(run, run + s.value); run += s.value; return { ...s, lo, hi };
    });
    /* the changes are small next to the totals, so the axis starts just below the lowest level
       the bridge reaches; the total bars carry a break mark to show it */
    const levels = bars.flatMap((b) => (b.total ? [b.value] : [b.lo, b.hi]));
    const top = Math.max(...levels), low = Math.min(...levels), spread = Math.max(top - low, top * 0.04);
    const floor = Math.max(0, low - spread * 0.9), span = top + spread * 0.25 - floor;
    const pos = (v) => ((v - floor) / span) * 100;
    const html = '<div class="waterfall" style="--h:' + H + 'px">' + bars.map((b) => {
      const col = b.total ? NOOR : b.value >= 0 ? DIV[5] : DIV[1];
      const sign = b.total ? "" : b.value >= 0 ? "+" : "−";
      const bottom = b.total ? 0 : pos(b.lo), height = b.total ? pos(b.hi) : Math.max(0.8, pos(b.hi) - pos(b.lo));
      return '<div class="wf-col"><div class="wf-plot"><i style="bottom:' + bottom.toFixed(2) + "%;height:" + height.toFixed(2) + "%;background:" + col + '"' + tip(b.name, [[col, sign + fmt(Math.abs(b.value)), ""]]) + ">" + (b.total && floor > 0 ? '<b class="wf-break" aria-hidden="true"></b>' : "") + '</i><span class="wf-v" style="bottom:calc(' + pos(b.hi).toFixed(2) + '% + 4px)">' + esc(sign + F().compact(Math.abs(b.value))) + '</span></div><div class="wf-x">' + esc(b.name) + "</div></div>";
    }).join("") + "</div>" + (floor > 0 ? '<div class="wf-note">' + esc(F().t("يبدأ المحور من ", "The axis starts at ") + fmt(floor)) + "</div>" : "");
    return { html, table: tbl([F().t("الخطوة", "Step"), F().t("القيمة", "Value")], steps.map((s) => [s.name, Math.round(s.value)])) };
  }

  /* ── bullet: actual against target ── */
  function bullet(rows, opts = {}) {
    const fmt = opts.fmt || F().sar, mx = Math.max(...rows.flatMap((r) => [r.actual, r.target]), 1e-9) * 1.08;
    const html = '<div class="bullets">' + legend([{ name: F().t("الفعلي", "Actual"), color: NOOR }, { name: F().t("المستهدف", "Target"), color: "#C49516" }]) + rows.map((r) => {
      const ok = r.actual >= r.target;
      return '<div class="bl-row"><div class="bl-l">' + esc(r.label) + '</div><div class="bl-t"' + tip(r.label, [[NOOR, F().t("الفعلي", "Actual"), fmt(r.actual)], ["#C49516", F().t("المستهدف", "Target"), fmt(r.target)], [null, F().t("الفرق", "Variance"), F().pct(r.actual / r.target - 1, 1, true)]]) + '><i class="bl-b" style="width:' + (r.actual / mx * 100).toFixed(2) + '%"></i><i class="bl-m" style="' + (rtl() ? "right" : "left") + ":" + (r.target / mx * 100).toFixed(2) + '%"></i></div><div class="bl-v"><b>' + esc(F().compact(r.actual)) + '</b><small class="' + (ok ? "up" : "down") + '">' + (ok ? "▲ " : "▼ ") + esc(F().pct(Math.abs(r.actual / r.target - 1), 1)) + "</small></div></div>";
    }).join("") + "</div>";
    return { html, table: tbl([F().t("الشهر", "Month"), F().t("الفعلي", "Actual"), F().t("المستهدف", "Target")], rows.map((r) => [r.label, Math.round(r.actual), Math.round(r.target)])) };
  }

  /* ── gauge: one score on its scale, with bands ── */
  function gauge(value, opts = {}) {
    const min = opts.min ?? 0, max = opts.max ?? 1, t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const cx = 120, cy = 112, R = 92, r = 70;
    const pt = (rad, f) => [cx - rad * Math.cos(Math.PI * f), cy - rad * Math.sin(Math.PI * f)];
    const arc = (f0, f1, col) => { const a = pt(R, f0), b = pt(R, f1), c = pt(r, f1), d = pt(r, f0); return '<path d="M' + a.join(" ") + "A" + R + " " + R + " 0 0 1 " + b.join(" ") + "L" + c.join(" ") + "A" + r + " " + r + " 0 0 0 " + d.join(" ") + 'Z" fill="' + col + '"/>'; };
    const bands = (opts.bands || []).map((b) => arc((b[0] - min) / (max - min), (b[1] - min) / (max - min), b[2])).join("");
    const needle = pt(R + 4, t), base = pt(r - 8, t);
    const html = '<div class="gauge"><svg viewBox="0 0 240 132" role="img" aria-label="' + esc(opts.aria || "") + '">' + arc(0, 1, "#ECEBE6") + bands + arc(0, t, opts.color || S[0]) +
      '<line x1="' + base[0].toFixed(1) + '" y1="' + base[1].toFixed(1) + '" x2="' + needle[0].toFixed(1) + '" y2="' + needle[1].toFixed(1) + '" stroke="' + NOOR + '" stroke-width="3" stroke-linecap="round"/>' +
      '<text x="120" y="104" text-anchor="middle" class="g-v">' + esc(opts.label || F().num(value)) + '</text><text x="' + (cx - R) + '" y="128" text-anchor="middle" class="tick">' + esc(opts.minLabel || F().num(min)) + '</text><text x="' + (cx + R) + '" y="128" text-anchor="middle" class="tick">' + esc(opts.maxLabel || F().num(max)) + "</text></svg>" + (opts.caption ? '<div class="g-c">' + esc(opts.caption) + "</div>" : "") + "</div>";
    return { html, table: tbl([F().t("المؤشر", "Measure"), F().t("القيمة", "Value")], [[opts.aria || "", opts.label || value]]) };
  }

  /* ── dot plot: one value per row against a threshold (e.g. wait time vs the 10-minute goal) ── */
  function dotplot(rows, opts = {}) {
    const fmt = opts.fmt || F().num, mx = nice(Math.max(...rows.map((r) => r.value), opts.threshold || 0) * 1.1), side = rtl() ? "right" : "left";
    const html = '<div class="dotplot">' + rows.map((r) => {
      const over = opts.threshold != null && (opts.higherIsBetter ? r.value < opts.threshold : r.value > opts.threshold);
      const col = over ? "#d03b3b" : S[0];
      return '<div class="dp-row"><div class="dp-l">' + esc(r.label) + '</div><div class="dp-t"><i class="dp-line" style="width:' + (r.value / mx * 100).toFixed(2) + '%"></i>' + (opts.threshold != null ? '<i class="dp-th" style="' + side + ":" + (opts.threshold / mx * 100).toFixed(2) + '%"></i>' : "") + '<i class="dp-dot" style="' + side + ":" + (r.value / mx * 100).toFixed(2) + "%;background:" + col + '"' + tip(r.label, [[col, fmt(r.value), r.note || ""]]) + '></i></div><div class="dp-v">' + esc(fmt(r.value)) + (over ? ' <span class="flag">' + esc(opts.flag || "") + "</span>" : "") + "</div></div>";
    }).join("") + (opts.threshold != null ? '<div class="dp-key"><i class="dp-th-k"></i>' + esc(opts.thresholdName || "") + "</div>" : "") + "</div>";
    return { html, table: tbl([F().t("البند", "Item"), opts.name || F().t("القيمة", "Value")], rows.map((r) => [r.label, fmt(r.value)])) };
  }

  /* ── meter: a share of a capacity (e.g. how full an activity is) ── */
  function meter(v, opts = {}) {
    const t = Math.max(0, Math.min(1, v)), col = t >= (opts.warn || 0.9) ? "#ec835a" : S[0];
    return '<span class="meter"><i style="width:' + (t * 100).toFixed(1) + "%;background:" + col + '"></i></span>';
  }

  /* ── small multiples: a grid of sparklines with their totals ── */
  function multiples(items, opts = {}) {
    const html = '<div class="multiples">' + items.map((it) => '<div class="mu"' + (it.attrs || "") + '><div class="mu-h"><span>' + esc(it.name) + '</span><b>' + esc((opts.fmt || F().compact)(it.value)) + "</b></div>" + spark(it.values, it.color || S[0], 160, 38) + (it.sub ? "<small>" + esc(it.sub) + "</small>" : "") + "</div>").join("") + "</div>";
    return { html, table: tbl([F().t("البند", "Item"), opts.name || F().t("القيمة", "Value")], items.map((it) => [it.name, Math.round(it.value)])) };
  }

  /* ── data table with an optional inline bar column ── */
  function table(cols, rows, opts = {}) {
    const barCol = opts.barCol, mx = barCol != null ? Math.max(...rows.map((r) => r.raw ? r.raw[barCol] : 0), 1e-9) : 0;
    const html = '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + cols.map((c, i) => '<th class="' + (opts.num && opts.num.includes(i) ? "num" : "") + '">' + esc(c) + "</th>").join("") + "</tr></thead><tbody>" + rows.map((r) => "<tr" + (r.attrs || "") + ">" + r.cells.map((c, i) => {
      const num = opts.num && opts.num.includes(i);
      const bar = barCol === i && r.raw ? '<span class="cell-bar"><i style="width:' + (r.raw[barCol] / mx * 100).toFixed(1) + '%"></i></span>' : "";
      return '<td class="' + (num ? "num" : "") + '">' + (r.html && r.html[i] != null ? r.html[i] : esc(c)) + bar + "</td>";
    }).join("") + "</tr>").join("") + "</tbody></table></div>";
    return { html, table: tbl(cols, rows.map((r) => r.cells)) };
  }

  window.RuhCharts = { S, AUD, SEQ, SEQ_B, DIV, NOOR, ramp, mix, inkOn, tip, esc, legend, spark, trend, hbars, columns, donut, funnel, sankey, heatmap, cohort, calendar, districtMap, bubble, butterfly, treemap, waterfall, bullet, gauge, dotplot, meter, multiples, table };
})();
