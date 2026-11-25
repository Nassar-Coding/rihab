/* Rihab BI — a city's dashboards: the Rihab BI sign-in and city picker are at the BI root (../); the sidebar, the filter
   bar, deep links (#/page?period=…&area=…), tooltips, table switches, CSV export and print.
   Arabic is read right to left and English left to right; the language is kept on the device. */
(function () {
  "use strict";
  const B = window.RuhBI, { M, CH, esc, state, store, t, L, icon, wordmark } = B;
  const P = window.RuhPages;
  const RC = B.RC, CX = B.CX;
  const DEMO_EMAIL = "bi@rihab.app", DEMO_PASS = "demo";
  /* the Rihab BI sign-in (../), kept on this device until sign-out */
  const session = () => { try { const s = JSON.parse(localStorage.getItem(B.SESSION_KEY) || "null"); return s && s.uid ? s : null; } catch (e) { return null; } };
  const toRihab = (path) => { try { location.replace(new URL("../" + (path || ""), location.href).href); } catch (e) { location.replace("../"); } };
  /* the same dashboard and filters in the other city (areas are each city's own) */
  function cityHref(id) {
    const q = new URLSearchParams();
    if (state.period !== "30d") q.set("period", state.period);
    if (state.category !== "all") q.set("category", state.category);
    if (state.audience !== "all") q.set("audience", state.audience);
    return "../" + id + "/#/" + state.page + (q.toString() ? "?" + q : "");
  }
  function citySwitch() {
    const cities = [["makkah", t("مكة", "Makkah")], ["madinah", t("المدينة", "Madinah")]];
    return '<div class="city-sw" role="group" aria-label="' + esc(t("المدينة المعروضة", "City shown")) + '">' + cities.map(([id, n]) => (id === RC.id
      ? '<span class="on" aria-current="page">' + esc(n) + "</span>"
      : '<a href="' + cityHref(id) + '" data-city-switch="' + id + '">' + esc(n) + "</a>")).join("") + '</div><a class="city-all" href="../" data-city-picker>' + esc(t("كل المدن في رحاب", "All cities in Rihab")) + "</a>";
  }

  const PAGES = [
    { id: "overview", icon: "overview", ar: "الملخص التنفيذي", en: "Executive overview", dar: "صورة شاملة عن المستخدمين والتفاعل والسوق والإيرادات.", den: "One view of users, engagement, the Market and revenue.", group: 0 },
    { id: "audiences", icon: "users", ar: "السكان والزوار", en: "Residents and visitors", dar: "من يستخدم " + RC.terms.app.ar + "، ومن أين، ومتى.", den: "Who uses " + RC.terms.app.en + ", from where, and when.", group: 1 },
    { id: "engagement", icon: "route", ar: "التفاعل والرحلات", en: "Engagement and journeys", dar: "كيف يتنقل الناس في التطبيق من المشاهدة إلى الإجراء.", den: "How people move through the app, from viewing to acting.", group: 1 },
    { id: "community", icon: "chat", ar: "المجتمع", en: "Community", dar: "المشاركات والأسئلة والإجابات في مجتمعات " + RC.terms.city.ar + ".", den: "Posts, questions and answers across " + RC.terms.cityPoss.en + " communities.", group: 1 },
    { id: "experiences", icon: "ticket", ar: "التجارب والأنشطة", en: "Experiences and activities", dar: "أداء التجارب والفعاليات والأنشطة والمجموعات المتكررة.", den: "How experiences, events, activities and recurring groups perform.", group: 2 },
    { id: "market", icon: "bag", ar: "السوق", en: "The Market", dar: "التجارب والخدمات والمنتجات التي تُطلب من السوق.", den: "Experiences, services and products requested in the Market.", group: 2 },
    { id: "city", icon: "building", ar: RC.terms.opps.ar, en: RC.terms.opps.en, dar: "الاهتمام بالسكن والفرص التجارية، دون أي قيم مالية.", den: "Interest in homes and business opportunities, with no money values.", group: 2, na: ["category"] },
    { id: "centers", icon: "info", ar: "مراكز الزوار وجودة الخدمة", en: "Visitor Centers and service", dar: "الخدمة والانتظار والرضا في مراكز الزوار، وجودة الخدمة الرقمية.", den: "Service, waiting and satisfaction at Visitor Centers, and digital service quality.", group: 3, na: ["category"] },
    { id: "partners", icon: "handshake", ar: "الشركاء والمشغلون", en: "Partners and operators", dar: "أداء المزودين والمنشآت والعروض.", den: "How providers, venues and offers perform.", group: 3 },
    { id: "commercial", icon: "coins", ar: "الأداء التجاري", en: "Commercial performance", dar: "الإيرادات وقنواتها مقابل المستهدف — أرقام تجريبية.", den: "Revenue and its channels against target — demo figures.", group: 3 },
    { id: "geography", icon: "map", ar: "الأحياء والخريطة", en: "Districts and map", dar: "النشاط في مناطق " + RC.terms.city.ar + " السكنية.", den: "Activity across " + RC.terms.cityPoss.en + " home areas.", group: 4 },
    { id: "reports", icon: "file", ar: "التقارير", en: "Reports", dar: "تنزيل بيانات اللوحات بالفلاتر الحالية.", den: "Download dashboard data with the current filters.", group: 4 },
  ];
  const GROUPS = [["نظرة عامة", "Overview"], ["الناس والتفاعل", "People and engagement"], ["المحتوى والسوق", "Content and the Market"], ["التشغيل والتجارة", "Operations and commerce"], ["المكان والتقارير", "Place and reports"]];
  const PAGE = Object.fromEntries(PAGES.map((p) => [p.id, p]));

  /* ── deep links ── */
  function readHash() {
    const h = location.hash.replace(/^#\/?/, ""), [page, qs] = h.split("?");
    if (PAGE[page]) state.page = page;
    const q = new URLSearchParams(qs || "");
    if (M.PERIOD[q.get("period")]) state.period = q.get("period");
    if (q.get("area") && (q.get("area") === "all" || M.ZI[q.get("area")] != null && q.get("area") !== "cw")) state.area = q.get("area");
    if (q.get("category") && (q.get("category") === "all" || M.CATS.some((c) => c.id === q.get("category")))) state.category = q.get("category");
    if (["all", "resident", "visitor"].includes(q.get("audience"))) state.audience = q.get("audience");
  }
  function writeHash(push) {
    const q = new URLSearchParams();
    if (state.period !== "30d") q.set("period", state.period);
    if (state.area !== "all") q.set("area", state.area);
    if (state.category !== "all") q.set("category", state.category);
    if (state.audience !== "all") q.set("audience", state.audience);
    const h = "#/" + state.page + (q.toString() ? "?" + q : "");
    if (location.hash !== h) history[push ? "pushState" : "replaceState"](null, "", h);
  }

  /* ── entry ── */
  const motes = () => '<div class="motes" aria-hidden="true">' + Array.from({ length: 28 }, (_, i) => '<i style="left:' + ((i * 37) % 100) + "%;top:" + (58 + ((i * 53) % 40)) + "%;width:" + (1 + (i % 3)) + "px;height:" + (1 + (i % 3)) + "px;animation-delay:" + ((i * 211) % 1800) + 'ms"></i>').join("") + "</div>";
  function welcome() {
    return '<main class="entry">' + motes() + '<div class="entry-in">' + wordmark(56, true) + '<div class="entry-k">' + esc(t("منصة ذكاء الأعمال", "Business Intelligence Platform")) + '</div><p class="entry-p">' + esc(t("لوحات تنفيذية لفهم سكان المدينة وزوارها، والتفاعل، والسوق، والمجتمع، والأحياء.", "Executive dashboards on Madinah's residents and visitors, engagement, the Market, the community and the districts.")) + '</p><button type="button" class="entry-cta" data-go="language">' + esc(t("ابدأ", "Start")) + '</button><small class="entry-note" data-demo>' + esc(t("نموذج عرض — بيانات محاكاة على محتوى التطبيق الفعلي", "Demo — simulated data on the app's real content")) + "</small></div></main>";
  }
  function language() {
    return '<main class="entry">' + motes() + '<div class="entry-in">' + wordmark(34, true, false) + '<div class="lang-h"><b>اختر لغتك</b><span>·</span><span dir="ltr">Choose your language</span></div><div class="lang-opts">' +
      '<button type="button" class="lang-opt' + (state.lang === "ar" ? " on" : "") + '" data-start-lang="ar" dir="rtl" lang="ar">' + icon("globe", 20) + "<span><b>العربية</b><small>المنصة كاملة بالعربية، من اليمين إلى اليسار</small></span></button>" +
      '<button type="button" class="lang-opt' + (state.lang === "en" ? " on" : "") + '" data-start-lang="en" dir="ltr" lang="en">' + icon("globe", 20) + "<span><b>English</b><small>The same platform, read left to right</small></span></button></div><small class=\"entry-note\">يمكنك تغييرها لاحقًا · You can change it later</small></div></main>";
  }
  function login() {
    return '<main class="entry">' + motes() + '<form class="login" id="login" novalidate>' + wordmark(30, false) + '<div class="login-k">' + esc(t("منصة ذكاء الأعمال", "Business Intelligence Platform")) + "</div><h1>" + esc(t("تسجيل الدخول", "Sign in")) + "</h1><p>" + esc(t("استخدم حساب العرض التجريبي للدخول إلى اللوحات.", "Use the demo account to open the dashboards.")) + '</p><label>' + esc(t("البريد الإلكتروني", "Email")) + '<input id="email" type="email" dir="ltr" autocomplete="username" value="' + DEMO_EMAIL + '" required></label><label>' + esc(t("كلمة المرور", "Password")) + '<input id="pass" type="password" dir="ltr" autocomplete="current-password" value="' + DEMO_PASS + '" required></label><div class="login-err" id="login-err" role="alert" hidden></div><button class="entry-cta wide" type="submit">' + esc(t("دخول", "Sign in")) + '</button><button class="btn ghost wide" type="button" data-demo-login>' + esc(t("الدخول بحساب العرض", "Use the demo account")) + '</button><div class="login-lang"><button type="button" data-lang="ar" class="' + (state.lang === "ar" ? "on" : "") + '">العربية</button><button type="button" data-lang="en" class="' + (state.lang === "en" ? "on" : "") + '">English</button></div><small class="login-note" data-demo>' + esc(t("دخول تجريبي فقط: لا يوجد نظام حسابات فعلي، ولا تُرسل أي بيانات.", "Demo sign-in only: there is no live account system and nothing is sent.")) + "</small></form></main>";
  }

  /* ── the shell ── */
  function selectHtml(id, label, value, options, na) {
    return '<label class="flt' + (na ? " na" : "") + '"><span>' + esc(label) + '</span><select data-filter="' + id + '"' + (na ? ' aria-describedby="na-' + id + '"' : "") + ">" + options.map((o) => '<option value="' + esc(o[0]) + '"' + (o[0] === value ? " selected" : "") + ">" + esc(o[1]) + "</option>").join("") + "</select>" + (na ? '<small id="na-' + id + '">' + esc(t("لا ينطبق هنا", "Not used here")) + "</small>" : "") + "</label>";
  }
  function filters() {
    const pg = PAGE[state.page], na = (k) => (pg.na || []).includes(k);
    const r = M.range(state.period);
    const cmp = r.p.prevName ? L(r.p.prevName) : B.date(r.p0, { day: "numeric", month: "short" }) + " – " + B.date(r.p1, { day: "numeric", month: "short", year: "numeric" });
    const aud = '<div class="flt"><span>' + esc(t("الجمهور", "Audience")) + '</span><div class="seg" role="radiogroup" aria-label="' + esc(t("الجمهور", "Audience")) + '">' + [["all", t("الجميع", "Everyone")], ["resident", t("السكان", "Residents")], ["visitor", t("الزوار", "Visitors")]].map((o) => '<button type="button" role="radio" aria-checked="' + (state.audience === o[0]) + '" data-audience="' + o[0] + '">' + (o[0] !== "all" ? '<i class="key box" style="--c:' + CH.AUD[o[0]] + '"></i>' : "") + esc(o[1]) + "</button>").join("") + "</div></div>";
    const dirty = state.period !== "30d" || state.area !== "all" || state.category !== "all" || state.audience !== "all";
    return '<section class="filters" aria-label="' + esc(t("الفلاتر", "Filters")) + '">' +
      selectHtml("period", t("الفترة", "Period"), state.period, M.PERIODS.map((p) => [p.id, L(p.name)])) +
      selectHtml("area", t("المنطقة", "Area"), state.area, [["all", CX("all")]].concat(M.ZONES.slice(0, M.HOMEZ).map((z) => [z.id, L(z.name)]))) +
      selectHtml("category", t("الفئة", "Category"), state.category, [["all", t("كل الفئات", "All categories")]].concat(M.CATS.map((c) => [c.id, L(c.name)])), na("category")) + aud +
      '<div class="flt-meta"><span>' + esc(B.date(r.d0, { day: "numeric", month: "short" }) + " – " + B.date(r.d1, { day: "numeric", month: "short", year: "numeric" })) + '</span><small>' + esc(t("مقارنة مع ", "Compared with ") + cmp) + "</small>" + (dirty ? '<button type="button" class="link" data-reset>' + icon("reset", 14) + esc(t("إعادة الضبط", "Reset")) + "</button>" : "") + "</div></section>";
  }
  function nav() {
    return GROUPS.map((g, gi) => '<div class="nav-g"><div class="nav-gt">' + esc(t(g[0], g[1])) + "</div>" + PAGES.filter((p) => p.group === gi).map((p) => '<a href="#/' + p.id + '" class="nav-i' + (state.page === p.id ? " on" : "") + '" data-page="' + p.id + '"' + (state.page === p.id ? ' aria-current="page"' : "") + ">" + icon(p.icon, 18) + "<span>" + esc(t(p.ar, p.en)) + "</span></a>").join("") + "</div>").join("");
  }
  function pageBody() {
    try {
      return P[state.page]();
    } catch (err) {
      console.error("Rihab BI: could not render", state.page, err);
      return '<div class="state-view" role="alert"><div class="state-icon bad">' + icon("alert", 24) + '</div><div class="state-title">' + esc(t("تعذّر عرض هذه اللوحة", "This dashboard could not be shown")) + '</div><div class="state-body">' + esc(t("لم تتأثر الفلاتر. جرّب العودة إلى الملخص التنفيذي.", "Your filters are unchanged. Try the executive overview.")) + '</div><button type="button" class="btn" data-page="overview">' + esc(t("الملخص التنفيذي", "Executive overview")) + "</button></div>";
    }
  }
  function shell() {
    const pg = PAGE[state.page];
    const asOf = M.DAYS - 1;
    const langSw = '<div class="lang-sw" role="group" aria-label="' + esc(t("اللغة", "Language")) + '"><button type="button" data-lang="ar" class="' + (state.lang === "ar" ? "on" : "") + '" lang="ar">ع</button><button type="button" data-lang="en" class="' + (state.lang === "en" ? "on" : "") + '" lang="en">EN</button></div>';
    const user = '<details class="user"><summary aria-label="' + esc(t("الحساب", "Account")) + '"><span class="avatar">' + esc(t("م", "A")) + '</span></summary><div class="user-m"><b>' + esc(t("محلل الأعمال", "Business analyst")) + '</b><small dir="ltr">' + esc((session() || {}).email || DEMO_EMAIL) + '</small><button type="button" data-lang="' + (state.lang === "ar" ? "en" : "ar") + '" lang="' + (state.lang === "ar" ? "en" : "ar") + '">' + icon("globe", 16) + "<span>" + (state.lang === "ar" ? "English" : "العربية") + '</span></button><button type="button" data-logout>' + icon("logout", 16) + "<span>" + esc(t("تسجيل الخروج", "Sign out")) + "</span></button></div></details>";
    return '<div class="shell' + (state.navOpen ? " nav-open" : "") + '"><aside class="side" id="side"><div class="side-brand">' + wordmark(26, true) + '<div class="side-k">' + esc(t("منصة ذكاء الأعمال", "Business Intelligence")) + '</div>' + citySwitch() + '</div><nav aria-label="' + esc(t("اللوحات", "Dashboards")) + '">' + nav() + '</nav><div class="side-f"><span data-demo>' + esc(t("بيانات محاكاة لأغراض العرض، مبنية على محتوى التطبيق الفعلي. لا تتضمن بيانات أشخاص.", "Simulated data for demonstration, built on the app's real content. No personal data.")) + "</span><span>" + esc(t("البيانات حتى ", "Data to ") + B.dateLong(asOf)) + "</span></div></aside>" +
      '<div class="scrim" data-nav-close></div><div class="main"><header class="top"><button type="button" class="icon-btn menu" data-nav-open aria-label="' + esc(t("القائمة", "Menu")) + '">' + icon("menu", 20) + '</button><div class="top-t"><h1>' + esc(t(pg.ar, pg.en)) + '</h1><p>' + esc(t(pg.dar, pg.den)) + '</p></div><div class="top-a"><span class="asof" title="' + esc(B.hijri(asOf)) + '">' + icon("clock", 14) + esc(B.dateLong(asOf)) + '</span><button type="button" class="btn ask-btn" data-ask>' + icon("ask", 16) + "<span>" + esc(t("اسأل البيانات", "Ask the data")) + "</span></button>" + langSw + user + "</div></header>" +
      filters() + '<div id="page" class="page">' + pageBody() + '</div><footer class="foot"><span>' + esc(t("رحاب · " + RC.terms.app.ar + " · منصة ذكاء الأعمال", "Rihab · " + RC.terms.app.en + " · Business Intelligence")) + '</span><span data-demo>' + esc(t("كل الأرقام محاكاة لأغراض العرض، والأسماء والمناطق والفئات من محتوى التطبيق.", "All figures are simulated for the demo; names, areas and categories come from the app's content.")) + "</span></footer></div>" +
      (window.RuhAsk ? window.RuhAsk.drawer() : "") + '<div id="tip" class="tip" role="tooltip" hidden></div></div>';
  }

  /* ── rendering ── */
  let busy = false;
  function render() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.title = t(RC.terms.app.ar + " — ذكاء الأعمال · رحاب", RC.terms.app.en + " — Business Intelligence · Rihab");
    const root = document.getElementById("app");
    for (const k of Object.keys(B.TABLES)) delete B.TABLES[k];
    root.innerHTML = state.flow === "welcome" ? welcome() : state.flow === "language" ? language() : state.flow === "login" ? login() : shell();
    if (state.flow === "app") { writeHash(false); if (window.RuhAsk) window.RuhAsk.mounted(); }
    busy = false;
    document.body.classList.remove("updating");
  }
  /* changes keep the frame: the page dims briefly, then redraws in place */
  function update(fn, push) {
    if (busy) return;
    busy = true;
    document.body.classList.add("updating");
    const y = window.scrollY;
    /* a new dashboard is a new history entry; a filter change replaces the current one */
    setTimeout(() => { fn(); if (push) writeHash(true); render(); window.scrollTo({ top: push ? 0 : y }); }, 120);
  }
  B.render = render; B.update = update; B.PAGES = PAGES;

  function setLang(l) { state.lang = l; store.set(localStorage, B.LANG_KEY, JSON.stringify(l)); render(); }
  function enter() { store.set(sessionStorage, B.SESSION_KEY, "1"); state.flow = "app"; render(); window.scrollTo({ top: 0 }); }

  /* file names use the panel or report id, so they are the same in both languages */
  function csv(id, tb) {
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const body = "﻿" + [tb.cols].concat(tb.rows).map((r) => r.map(q).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
    a.download = "Rihab_" + RC.id + "_BI_" + state.page + "_" + id + "_" + state.period + "_" + state.lang + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ── events (delegated, so they survive every redraw) ── */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("button, a, [data-set-area], [data-nav-close]");
    if (!el) { if (!e.target.closest(".user")) document.querySelectorAll("details.user[open]").forEach((d) => d.removeAttribute("open")); return; }
    const d = el.dataset;
    if (d.go) { state.flow = d.go; render(); return; }
    if (d.startLang) {
      state.lang = d.startLang; store.set(localStorage, B.LANG_KEY, JSON.stringify(state.lang));
      document.querySelectorAll("[data-start-lang]").forEach((b) => b.classList.toggle("on", b === el));
      setTimeout(() => { state.flow = "login"; render(); }, 200);
      return;
    }
    if (d.lang) { setLang(d.lang); return; }
    if (d.demoLogin !== undefined) { enter(); return; }
    if (d.logout !== undefined) { store.set(localStorage, B.SESSION_KEY, null); toRihab(); return; }
    if (d.page) { e.preventDefault(); state.navOpen = false; if (d.page !== state.page) update(() => { state.page = d.page; }, true); else render(); return; }
    if (d.navOpen !== undefined) { state.navOpen = true; render(); return; }
    if (d.navClose !== undefined) { state.navOpen = false; render(); return; }
    if (d.audience) { update(() => { state.audience = d.audience; }); return; }
    if (d.setArea) { update(() => { state.area = state.area === d.setArea ? "all" : d.setArea; }); return; }
    if (d.mapMetric) { update(() => { state.mapMetric = d.mapMetric; }); return; }
    if (d.reset !== undefined) { update(() => { state.period = "30d"; state.area = "all"; state.category = "all"; state.audience = "all"; }); return; }
    if (d.toggleTable) { state.tables[d.toggleTable] = !state.tables[d.toggleTable]; const y = window.scrollY; render(); window.scrollTo({ top: y }); return; }
    if (d.csv) { const tb = B.TABLES[d.csv]; if (tb) csv(d.csv, tb.table); return; }
    if (d.report) { const rp = P.reportList().find((x) => x.id === d.report); if (rp) csv(rp.id, rp.table()); return; }
    if (d.print !== undefined) { window.print(); return; }
    if (d.ask !== undefined && window.RuhAsk) { window.RuhAsk.open(); return; }
  });
  document.addEventListener("change", (e) => {
    const s = e.target.closest("[data-filter]");
    if (s) { const k = s.dataset.filter, v = s.value; update(() => { state[k] = v; }); }
  });
  document.addEventListener("submit", (e) => {
    if (e.target.id !== "login") return;
    e.preventDefault();
    const em = document.getElementById("email").value.trim().toLowerCase(), pw = document.getElementById("pass").value;
    if (em === DEMO_EMAIL && pw === DEMO_PASS) { enter(); return; }
    const err = document.getElementById("login-err");
    err.hidden = false;
    err.textContent = t("استخدم حساب العرض: " + DEMO_EMAIL + " وكلمة المرور demo", "Use the demo account: " + DEMO_EMAIL + " with the password demo");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (state.askOpen && window.RuhAsk) window.RuhAsk.close(); else if (state.navOpen) { state.navOpen = false; render(); } hideTip(); }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("tr[data-set-area], path[data-set-area]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });
  window.addEventListener("popstate", () => { if (state.flow === "app") { readHash(); render(); } });
  /* charts are drawn for the width they get: redraw when the window crosses the phone breakpoint */
  let wasNarrow = innerWidth < 760;
  window.addEventListener("resize", () => { const n = innerWidth < 760; if (n !== wasNarrow && state.flow === "app") { wasNarrow = n; const y = scrollY; render(); scrollTo({ top: y }); } });

  /* ── tooltip: hover and keyboard focus show the same card ── */
  function showTip(el, x, y) {
    const tip = document.getElementById("tip");
    if (!tip) return;
    let data;
    try { data = JSON.parse(el.getAttribute("data-tipj")); } catch (err) { return; }
    tip.textContent = "";
    const h = document.createElement("div"); h.className = "tip-t"; h.textContent = data.t || ""; tip.appendChild(h);
    (data.r || []).forEach((row) => {
      const r = document.createElement("div"); r.className = "tip-r";
      if (row[0]) { const k = document.createElement("i"); k.className = "key line"; k.style.setProperty("--c", row[0]); r.appendChild(k); }
      const v = document.createElement("b"); v.textContent = row[1] || ""; r.appendChild(v);
      if (row[2]) { const l = document.createElement("span"); l.textContent = row[2]; r.appendChild(l); }
      tip.appendChild(r);
    });
    tip.hidden = false;
    const w = tip.offsetWidth, hh = tip.offsetHeight, gap = 14;
    let left = x + gap, top = y + gap;
    if (left + w > innerWidth - 8) left = x - w - gap;
    if (top + hh > innerHeight - 8) top = y - hh - gap;
    tip.style.left = Math.max(8, left) + "px"; tip.style.top = Math.max(8, top) + "px";
  }
  function hideTip() { const tip = document.getElementById("tip"); if (tip) tip.hidden = true; }
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest("[data-tipj]");
    if (el) showTip(el, e.clientX, e.clientY); else hideTip();
  });
  document.addEventListener("focusin", (e) => { const el = e.target.closest && e.target.closest("[data-tipj]"); if (el) { const b = el.getBoundingClientRect(); showTip(el, b.left + b.width / 2, b.top + b.height / 2); } });
  document.addEventListener("focusout", hideTip);
  /* scrolling hides a hover tooltip; a focused mark keeps its tooltip and it follows the mark */
  window.addEventListener("scroll", () => {
    const el = document.activeElement;
    if (el && el.matches && el.matches("[data-tipj]")) { const b = el.getBoundingClientRect(); showTip(el, b.left + b.width / 2, b.top + b.height / 2); } else hideTip();
  }, { passive: true });

  /* ── start ── */
  readHash();
  if (!session()) { toRihab(); return; }
  state.flow = "app";
  render();
})();
