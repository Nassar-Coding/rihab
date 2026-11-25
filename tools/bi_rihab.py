"""Rihab BI: turn the Ruh Al Madinah BI code (bi/shared) into one code base for two cities.
Everything city-specific — names, identity, palette, the simulation's parameters, the
Visitor Centers, the assistant's area aliases — comes from window.RIHAB_BI_CITY
(bi/<city>/city.js). The Rihab BI sign-in and city picker live at the BI root; a city page
without a Rihab BI session goes there, and signing out returns there."""
import re, sys
ROOT = sys.argv[1]

def patch(rel, pairs):
    p = f"{ROOT}/{rel}"
    s = open(p, encoding="utf-8").read()
    for a, b, *n in pairs:
        cnt = n[0] if n else 1
        got = s.count(a) if isinstance(a, str) else len(re.findall(a, s))
        if got != cnt:
            raise SystemExit(f"{rel}: expected {cnt}× got {got}: {str(a)[:110]!r}")
        s = s.replace(a, b) if isinstance(a, str) else re.sub(a, b, s)
    open(p, "w", encoding="utf-8").write(s)
    print("patched", rel)

R = re.compile

# ── model ──
patch("js/model.js", [
    ("/* Ruh Al Madinah BI — the data model.", "/* Rihab BI — the data model (one city: window.RIHAB_BI_CITY)."),
    ("the weekend (Friday and Saturday) and the Madinah weather shape the series. */", "the weekend (Friday and Saturday) and the city's weather shape the series. The city's own\n   behaviour (seasons, landmarks, areas, Visitor Centers) comes from its city.js. */"),
    ("  const C = window.RUH_CONTENT;\n", "  const C = window.RUH_CONTENT;\n  const RC = window.RIHAB_BI_CITY, CM = RC.model;\n"),
    ('{ id: "cw", name: { ar: "على مستوى المدينة", en: "City-wide" }, x: null', '{ id: "cw", name: RC.terms.cityWide, x: null'),
    ('a record the app places only "in Madinah" counts city-wide */', 'a record the app places only in the city as a whole counts city-wide */'),
    ("/* ── the calendar: Madinah's seasons ── */", "/* ── the calendar: the city's seasons ── */"),
    ("""      if (f.ramadan) s *= f.last10 ? 2.25 : 1.7;
      if (f.eidFitr) s *= 1.45;
      if (f.preHajj) s *= 1.35;
      if (f.hajjDays) s *= 0.8;
      if (f.postHajj) s *= 1.55;""", """      const V = CM.visitorSeason;
      if (f.ramadan) s *= f.last10 ? V.last10 : V.ramadan;
      if (f.eidFitr) s *= V.eidFitr;
      if (f.preHajj) s *= V.preHajj;
      if (f.hajjDays) s *= V.hajjDays;
      if (f.postHajj) s *= V.postHajj;"""),
    ("      if (f.eidFitr || f.hajjDays) s *= 1.28;\n      if (f.summer) s *= 0.87;", "      if (f.eidFitr) s *= 1.28; else if (f.hajjDays) s *= CM.residentHajj;\n      if (f.summer) s *= 0.87;"),
    ("  const TEMP = [1.35, 1.35, 1.15, 1.0, 0.85, 0.65, 0.6, 0.6, 0.85, 1.0, 1.15, 1.35];", "  const TEMP = CM.temp;"),
    (R(r"  const ZONE_AFF_V = \{[^\n]*\};\n  const ZONE_AFF_R = \{[^\n]*\};"), "  const ZONE_AFF_V = CM.zoneAffV;\n  const ZONE_AFF_R = CM.zoneAffR;"),
    ('  const LANDMARK = { "PLC-040": 2.4, "PLC-060": 1.6, "PLC-076": 1.3 };', "  const LANDMARK = CM.landmark;"),
    ('const marketKind = o.id === "ACT-002" ||', "const marketKind = o.id === CM.hosted ||"),
    ("    const inSeason = MONTH[d] >= 5 && MONTH[d] <= 8;   /* fresh dates: summer only, as the app says */",
     "    const SP = CM.seasonalProduct, inSeason = !SP || (MONTH[d] >= SP.fromMonth && MONTH[d] <= SP.toMonth);   /* a seasonal product sells only in its season, as the app says */"),
    ('      if (pr.id === "PRD-03" && !inSeason) continue;', "      if (SP && pr.id === SP.id && !inSeason) continue;"),
    ("const CITY_PREF = { rent: [1.3, 0.35], sale: [0.9, 0.12], furnished: [0.55, 1.25],",
     "const CITY_PREF = { rent: [1.3, 0.35], sale: [0.9, 0.12], own: [0.9, 0.12], furnished: [0.55, 1.25], stay: [0.55, 1.25], commercial: [0.6, 0.18],"),
    ("/* Live in Madinah: area chip taps */", "/* Live in the city: area chip taps */"),
    (R(r"  const CHIP_PREF = \[\n    \{[^\n]*\},\n    \{[^\n]*\},\n  \];"), "  const CHIP_PREF = CM.chipPref;"),
    ('"old-madinah": "heritage", craft:', '"old-madinah": "heritage", "makkah-old": "heritage", craft:'),
    ('"visitor-service": "volunteer",', '"visitor-service": "volunteer", "haram-service": "volunteer",'),
    (R(r"  const CENTERS = \[\n(    \{[^\n]*\},\n)+  \]\.map"), "  const CENTERS = CM.centers.map"),
    ('{ id: "ziyarah", name: { ar: "معالم الزيارة ومواعيدها", en: "Ziyarah sites and times" },', '{ id: "ziyarah", name: CM.vcZiyarah,'),
    ('{ id: "app", name: { ar: "مساعدة في تطبيق روح المدينة", en: "Help with the Ruh Al Madinah app" },', '{ id: "app", name: { ar: "مساعدة في تطبيق " + RC.terms.app.ar, en: "Help with the " + RC.terms.app.en + " app" },'),
])

# ── charts: the city's palette ──
patch("js/charts.js", [
    ("/* Ruh Al Madinah BI — charts.", "/* Rihab BI — charts."),
    (R(r'  const S = \[[^\n]*\];\n'), '  const PAL = window.RIHAB_BI_CITY.palette;\n  const S = PAL.S;\n'),
    (R(r'  const SEQ = \[[^\n]*\];\n  const SEQ_B = \[[^\n]*\];\n  const DIV = \[[^\n]*\];\n  const NOOR = "#172A46";'), '  const SEQ = PAL.SEQ;\n  const SEQ_B = PAL.SEQ_B;\n  const DIV = PAL.DIV;\n  const NOOR = PAL.brand;'),
])

# ── core: keys shared with Rihab, the city's terms and wordmark ──
patch("js/core.js", [
    ("/* Ruh Al Madinah BI — shared state", "/* Rihab BI — shared state"),
    ('const LANG_KEY = "ruhalmadinah-bi-lang", SESSION_KEY = "ruhalmadinah-bi-session";', 'const LANG_KEY = "rihab.lang", SESSION_KEY = "rihab.bi.session.v1";   /* the language is Rihab\'s; the session is the Rihab BI sign-in */'),
    ('flow: "welcome", lang: store.get(localStorage, LANG_KEY) === "en" ? "en" : "ar",', 'flow: "app", lang: String(store.get(localStorage, LANG_KEY) || "").replace(/"/g, "") === "en" ? "en" : "ar",'),
    ("  const L = (pair) => (pair ? (state.lang === \"ar\" ? pair.ar : pair.en) : \"\");\n",
     "  const L = (pair) => (pair ? (state.lang === \"ar\" ? pair.ar : pair.en) : \"\");\n  /* the city this page shows (bi/<city>/city.js) and its words */\n  const RC = window.RIHAB_BI_CITY;\n  const CX = (k) => L(RC.terms[k]);\n"),
    (R(r"  /\* the typographic wordmark «روح المدينة» with its point of light, as in the app \*/\n  function wordmark\(size, light, latin = true\) \{\n    return [^\n]*\n"),
     "  /* the city's wordmark, as in its app */\n  function wordmark(size, light, latin = true) {\n    return RC.wordmark(size, light, latin);\n"),
    ("  window.RuhBI = { M, CH, esc, state, store, LANG_KEY, SESSION_KEY, t, L,", "  window.RuhBI = { M, CH, esc, state, store, LANG_KEY, SESSION_KEY, RC, CX, t, L,"),
])

# ── app: the Rihab hand-off, city names, the city switch ──
patch("js/app.js", [
    ("/* Ruh Al Madinah BI — the shell: entry (welcome → language → demo sign-in), the sidebar,",
     "/* Rihab BI — a city's dashboards: the Rihab BI sign-in and city picker are at the BI root (../); the sidebar,"),
    ('  const DEMO_EMAIL = "analyst@ruhalmadinah.demo", DEMO_PASS = "demo";\n',
     '  const RC = B.RC, CX = B.CX;\n  const DEMO_EMAIL = "bi@rihab.app", DEMO_PASS = "demo";\n'
     '  /* the Rihab BI sign-in (../), kept on this device until sign-out */\n'
     '  const session = () => { try { const s = JSON.parse(localStorage.getItem(B.SESSION_KEY) || "null"); return s && s.uid ? s : null; } catch (e) { return null; } };\n'
     '  const toRihab = (path) => { try { location.replace(new URL("../" + (path || ""), location.href).href); } catch (e) { location.replace("../"); } };\n'
     '  /* the same dashboard and filters in the other city (areas are each city\'s own) */\n'
     '  function cityHref(id) {\n'
     '    const q = new URLSearchParams();\n'
     '    if (state.period !== "30d") q.set("period", state.period);\n'
     '    if (state.category !== "all") q.set("category", state.category);\n'
     '    if (state.audience !== "all") q.set("audience", state.audience);\n'
     '    return "../" + id + "/#/" + state.page + (q.toString() ? "?" + q : "");\n'
     '  }\n'
     '  function citySwitch() {\n'
     '    const cities = [["makkah", t("مكة", "Makkah")], ["madinah", t("المدينة", "Madinah")]];\n'
     '    return \'<div class="city-sw" role="group" aria-label="\' + esc(t("المدينة المعروضة", "City shown")) + \'">\' + cities.map(([id, n]) => (id === RC.id\n'
     '      ? \'<span class="on" aria-current="page">\' + esc(n) + "</span>"\n'
     '      : \'<a href="\' + cityHref(id) + \'" data-city-switch="\' + id + \'">\' + esc(n) + "</a>")).join("") + \'</div><a class="city-all" href="../" data-city-picker>\' + esc(t("كل المدن في رحاب", "All cities in Rihab")) + "</a>";\n'
     '  }\n'),
    ('dar: "من يستخدم روح المدينة، ومن أين، ومتى.", den: "Who uses Ruh Al Madinah, from where, and when.",',
     'dar: "من يستخدم " + RC.terms.app.ar + "، ومن أين، ومتى.", den: "Who uses " + RC.terms.app.en + ", from where, and when.",'),
    ('dar: "المشاركات والأسئلة والإجابات في مجتمعات المدينة.", den: "Posts, questions and answers across Madinah\'s communities.",',
     'dar: "المشاركات والأسئلة والإجابات في مجتمعات " + RC.terms.city.ar + ".", den: "Posts, questions and answers across " + RC.terms.cityPoss.en + " communities.",'),
    ('{ id: "city", icon: "building", ar: "فرص المدينة", en: "City Opportunities",', '{ id: "city", icon: "building", ar: RC.terms.opps.ar, en: RC.terms.opps.en,'),
    ('dar: "النشاط في مناطق المدينة الخمس عشرة.", den: "Activity across Madinah\'s fifteen home areas.",',
     'dar: "النشاط في مناطق " + RC.terms.city.ar + " السكنية.", den: "Activity across " + RC.terms.cityPoss.en + " home areas.",'),
    ('[["all", t("كل المدينة", "All of Madinah")]]', '[["all", CX("all")]]'),
    ('esc(t("روح المدينة · منصة ذكاء الأعمال · نموذج عرض", "Ruh Al Madinah · Business Intelligence · demo"))',
     'esc(t("رحاب · " + RC.terms.app.ar + " · منصة ذكاء الأعمال", "Rihab · " + RC.terms.app.en + " · Business Intelligence"))'),
    ('document.title = t("روح المدينة — منصة ذكاء الأعمال", "Ruh Al Madinah — Business Intelligence");',
     'document.title = t(RC.terms.app.ar + " — ذكاء الأعمال · رحاب", RC.terms.app.en + " — Business Intelligence · Rihab");'),
    ('a.download = "RuhAlMadinah_BI_" + state.page', 'a.download = "Rihab_" + RC.id + "_BI_" + state.page'),
    ("'<div class=\"side-k\">' + esc(t(\"منصة ذكاء الأعمال\", \"Business Intelligence\")) + '</div></div><nav aria-label",
     "'<div class=\"side-k\">' + esc(t(\"منصة ذكاء الأعمال\", \"Business Intelligence\")) + '</div>' + citySwitch() + '</div><nav aria-label"),
    ('function setLang(l) { state.lang = l; store.set(localStorage, B.LANG_KEY, l); render(); }', 'function setLang(l) { state.lang = l; store.set(localStorage, B.LANG_KEY, JSON.stringify(l)); render(); }'),
    ('state.lang = d.startLang; store.set(localStorage, B.LANG_KEY, state.lang);', 'state.lang = d.startLang; store.set(localStorage, B.LANG_KEY, JSON.stringify(state.lang));'),
    ('if (d.logout !== undefined) { store.set(sessionStorage, B.SESSION_KEY, null); state.flow = "login"; state.askOpen = false; render(); return; }',
     'if (d.logout !== undefined) { store.set(localStorage, B.SESSION_KEY, null); toRihab(); return; }'),
    ('  if (store.get(sessionStorage, B.SESSION_KEY) === "1") state.flow = "app";\n', '  if (!session()) { toRihab(); return; }\n  state.flow = "app";\n'),
])

# ── dashboards ──
patch("js/pages-a.js", [
    ("/* Ruh Al Madinah BI — dashboards, part 1", "/* Rihab BI — dashboards, part 1"),
    ("  const X = M.XM, MM = M.M;\n", "  const X = M.XM, MM = M.M;\n  const RC = B.RC, CX = B.CX, CT = RC.terms;\n"),
    ('const MOSQUE = () => ({ name: t("المسجد النبوي", "The Prophet\'s Mosque"), x: 0.488, y: 0.507 });', 'const MOSQUE = () => ({ name: CX("Mosque"), x: RC.mosqueAt.x, y: RC.mosqueAt.y });'),
    ('sub: t("السكان والزوار، مع مواسم المدينة", "Residents and visitors, with Madinah\'s seasons")', 'sub: t("السكان والزوار، مع مواسم " + CT.city.ar, "Residents and visitors, with " + CT.cityPoss.en + " seasons")'),
    ('foot: t("زاروا المدينة من قبل باستخدام التطبيق", "Visited Madinah with the app before")', 'foot: t("زاروا " + CT.city.ar + " من قبل باستخدام التطبيق", "Visited " + CT.city.en + " with the app before")'),
    ('title: t("مواسم المدينة — آخر ١٢ شهرًا", "Madinah\'s seasons — last 12 months")', 'title: t("مواسم " + CT.city.ar + " — آخر ١٢ شهرًا", CT.cityPoss.en + " seasons — last 12 months")'),
    ('sub: t("الجلسات حسب اليوم والساعة (توقيت المدينة)", "Sessions by weekday and hour (Madinah time)")', 'sub: t("الجلسات حسب اليوم والساعة (توقيت " + CT.city.ar + ")", "Sessions by weekday and hour (" + CT.city.en + " time)")'),
    ('esc(t("فرص المدينة دليل تعريفي:', 'esc(t(CT.opps.ar + " دليل تعريفي:'),
    ('"City Opportunities is an information directory:', 'CT.opps.en + " is an information directory:'),
    ('empty(t("افتُتح قسم فرص المدينة في ١ مايو ٢٠٢٦؛ لا توجد بيانات لهذه الفترة.", "City Opportunities opened on 1 May 2026; there is no data for this period."))',
     'empty(t("افتُتح قسم " + CT.opps.ar + " في ١ مايو ٢٠٢٦؛ لا توجد بيانات لهذه الفترة.", CT.opps.en + " opened on 1 May 2026; there is no data for this period."))'),
    ('{ name: t("زيارات «استثمر في المدينة»", "Invest in Madinah visits"), value: secV }', '{ name: t("زيارات «" + CT.invest.ar + "»", CT.invest.en + " visits"), value: secV }'),
    ('title: t("عِش في المدينة — طلبات التفاصيل", "Live in Madinah — details requests"), sub: t("المساكن الخمسة التجريبية في التطبيق", "The app\'s five demo homes")',
     'title: t(CT.live.ar + " — طلبات التفاصيل", CT.live.en + " — details requests"), sub: t("المساكن المعروضة في التطبيق", "The homes listed in the app")'),
    ('sub: t("اختيار المنطقة في «عِش في المدينة» · ● منطقة فيها إعلان تجريبي", "Area chosen in Live in Madinah · ● area with a demo listing")',
     'sub: t("اختيار المنطقة في «" + CT.live.ar + "» · ● منطقة فيها إعلان", "Area chosen in " + CT.live.en + " · ● area with a listing")'),
    ('panel({ id: "ci-funnel", title: t("استثمر في المدينة", "Invest in Madinah"),', 'panel({ id: "ci-funnel", title: CX("invest"),'),
])
patch("js/pages-b.js", [
    ("/* Ruh Al Madinah BI — dashboards, part 2", "/* Rihab BI — dashboards, part 2"),
    ("  const X = M.XM, MM = M.M, P = window.RuhPages;\n", "  const X = M.XM, MM = M.M, P = window.RuhPages;\n  const RC = B.RC, CX = B.CX, CT = RC.terms;\n"),
    ('لا تتضمن فرص المدينة أي قيم مالية.", "Every money value on this dashboard is a simulated demo figure in Saudi riyals, not real revenue. City Opportunities carries no money values.")',
     'لا يتضمن قسم " + CT.opps.ar + " أي قيم مالية.", "Every money value on this dashboard is a simulated demo figure in Saudi riyals, not real revenue. " + CT.opps.en + " carries no money values.")'),
    ('kpi({ label: t("نشاط على مستوى المدينة", "City-wide activity"), value: pct(cw / (totalU || 1)), foot: t("أماكن يحددها التطبيق بالمدينة فقط", "Places the app locates only as Madinah") })',
     'kpi({ label: t("نشاط " + CT.cityWide.ar, "City-wide activity"), value: pct(cw / (totalU || 1)), foot: t("أماكن يحددها التطبيق ب" + CT.city.ar + " فقط", "Places the app locates only as " + CT.city.en) })'),
    ('note: t("خريطة تخطيطية: مناطق السكن الـ١٥ في التطبيق ومواقعها نسبةً إلى المسجد النبوي، وكل حي آخر يتبع أقرب منطقة. ليست بمقياس رسم.", "A schematic map: the app\'s 15 home areas at their positions relative to the Prophet\'s Mosque; every other district joins its nearest area. Not to scale.")',
     'note: t("خريطة تخطيطية: مناطق السكن في التطبيق ومواقعها نسبةً إلى " + CT.mosque.ar + "، وكل حي آخر يتبع أقرب منطقة. ليست بمقياس رسم.", "A schematic map: the app\'s home areas at their positions relative to " + CT.mosque.en + "; every other district joins its nearest area. Not to scale.")'),
    ('{ icon: "map", title: t("قلب المدينة", "The heart of the city"), text: t("المنطقة المركزية حول المسجد النبوي تستقبل ", "The Central Area around the Prophet\'s Mosque draws ") + pct(Z[M.ZI.central].users',
     '{ icon: "map", title: t("قلب " + CT.city.ar, "The heart of the city"), text: t(CT.heart.ar + " تستقبل ", CT.heart.en + " draws ") + pct(Z[M.ZI[RC.centralZone]].users'),
    ('{ id: "city", title: t("فرص المدينة", "City Opportunities"),', '{ id: "city", title: CX("opps"),'),
    ('state.area === "all" ? t("كل المدينة", "All of Madinah") : zoneName(state.area)', 'state.area === "all" ? CX("all") : zoneName(state.area)'),
])

# ── Ask the data ──
patch("agent/ask-bank.js", [
    ("/* Ruh Al Madinah BI — the \"Ask the data\" intent bank.", "/* Rihab BI — the \"Ask the data\" intent bank."),
    ('ex: { ar: ["كيف قباء", "وش وضع العوالي", "معلومات عن المنطقة المركزية", "حدثني عن العزيزية"], en: ["how is quba doing", "tell me about al-awali", "central area profile", "what about al-aziziyah"] }',
     'ex: { ar: ["كيف " + window.RIHAB_BI_CITY.terms.exampleArea.ar, "وش وضع العوالي", "معلومات عن المنطقة المركزية", "حدثني عن العزيزية"], en: ["how is " + window.RIHAB_BI_CITY.terms.exampleArea.en.toLowerCase() + " doing", "tell me about al-awali", "central area profile", "what about al-aziziyah"] }'),
    ('"عش في المدينة", "وين يدورون سكن"', '"عش في " + window.RIHAB_BI_CITY.terms.city.ar, "وين يدورون سكن"'),
    ('"live in madinah", "where do people look', '"live in " + window.RIHAB_BI_CITY.terms.city.en.toLowerCase(), "where do people look'),
    ('"استثمر في المدينة", "الفرص التجارية"', '"استثمر في " + window.RIHAB_BI_CITY.terms.city.ar, "الفرص التجارية"'),
    ('"invest in madinah", "business opportunities"', '"invest in " + window.RIHAB_BI_CITY.terms.city.en.toLowerCase(), "business opportunities"'),
    (R(r"    area: \{\n      central: \[.*?\n    \},\n", re.S), "    area: window.RIHAB_BI_CITY.areaAliases,\n"),
    ('["كيف قباء؟", "How is Quba doing?"]', '["كيف " + window.RIHAB_BI_CITY.terms.exampleArea.ar + "؟", "How is " + window.RIHAB_BI_CITY.terms.exampleArea.en + " doing?"]'),
])
patch("agent/ask-runtime.js", [
    ("/* Ruh Al Madinah BI — \"Ask the data\"", "/* Rihab BI — \"Ask the data\""),
    ("  const P = window.RuhPages, MM = M.M, X = M.XM;\n", "  const P = window.RuhPages, MM = M.M, X = M.XM;\n  const CT = B.RC.terms, EA = CT.exampleArea;\n"),
    ('s.f.area === "all" ? t("كل المدينة", "all of Madinah") : B.zoneName(s.f.area)', 's.f.area === "all" ? t(CT.allLower.ar, CT.allLower.en) : B.zoneName(s.f.area)'),
    ('{ text: t("أي منطقة تقصد؟ مثلًا: «كيف قباء؟» أو «وش وضع العوالي؟»", "Which area do you mean? For example: \\"How is Quba doing?\\""), chips: [["كيف قباء؟", "How is Quba doing?"], ["وش وضع العوالي؟", "Tell me about Al-Awali"]] }',
     '{ text: t("أي منطقة تقصد؟ مثلًا: «كيف " + EA.ar + "؟» أو «وش وضع العوالي؟»", "Which area do you mean? For example: \\"How is " + EA.en + " doing?\\""), chips: [["كيف " + EA.ar + "؟", "How is " + EA.en + " doing?"], ["وش وضع العوالي؟", "Tell me about Al-Awali"]] }'),
    ('t(" من المدينة)، والنمو ", " of the city); growth ")', 't(" من " + CT.city.ar + ")، والنمو ", " of the city); growth ")'),
    ('{ text: t("لا توجد بيانات سكن لهذه الفترة؛ افتُتح قسم فرص المدينة في ١ مايو ٢٠٢٦.", "There is no housing data for this period; City Opportunities opened on 1 May 2026.") }',
     '{ text: t("لا توجد بيانات سكن لهذه الفترة؛ افتُتح قسم " + CT.opps.ar + " في ١ مايو ٢٠٢٦.", "There is no housing data for this period; " + CT.opps.en + " opened on 1 May 2026.") }'),
    ('t(" طلب تفاصيل على المساكن الخمسة التجريبية. أكثر المناطق بحثًا دون إعلان: ", " details requests on the five demo homes. Most-searched areas with no listing: ")',
     't(" طلب تفاصيل على المساكن المعروضة في التطبيق. أكثر المناطق بحثًا دون إعلان: ", " details requests on the homes listed in the app. Most-searched areas with no listing: ")'),
    ('go(t("افتح فرص المدينة", "Open City Opportunities"), "city", s.patch)', 'go(t("افتح " + CT.opps.ar, "Open " + CT.opps.en), "city", s.patch)', 2),
    ('t(" تسجيل اهتمام بالفرص الخمس، بترتيبها في التطبيق:", " interest registrations across the five opportunities, in the app\'s order:")',
     't(" تسجيل اهتمام بالفرص المعروضة، بترتيبها في التطبيق:", " interest registrations across the listed opportunities, in the app\'s order:")'),
    ('من محتوى تطبيق روح المدينة الفعلي.', 'من محتوى تطبيق " + CT.app.ar + " الفعلي.'),
    ('come from the Ruh Al Madinah app\'s real content.', 'come from the " + CT.app.en + " app\'s real content.'),
    ('السوق، فرص المدينة، المجتمع،', 'السوق، " + CT.opps.ar + "، المجتمع،'),
    ('the Market, City Opportunities, the community,', 'the Market, " + CT.opps.en + ", the community,'),
    ('{ text: t("أهلًا. أنا مساعد البيانات في منصة روح المدينة. اسألني عن أي لوحة.", "Hello. I\'m the data assistant of the Ruh Al Madinah platform. Ask me about any dashboard.") }',
     '{ text: t("أهلًا. أنا مساعد البيانات في منصة " + CT.app.ar + " لذكاء الأعمال. اسألني عن أي لوحة.", "Hello. I\'m the data assistant of the " + CT.app.en + " Business Intelligence platform. Ask me about any dashboard.") }'),
])

# ── the few remaining city names ──
patch("js/pages-a.js", [
    ('market: ["السوق وفرص المدينة", "Market and City Opportunities", 0.8]', 'market: ["السوق و" + CT.opps.ar, "Market and " + CT.opps.en, 0.8]'),
    ('["city", "فرص المدينة", "City Opportunities",', '["city", CT.opps.ar, CT.opps.en,'),
    ('["s-city", t("فرص المدينة", "City Opportunities")', '["s-city", CX("opps")'),
    ('sub: deal("rent") + " · " + deal("sale") + " · " + deal("furnished")', 'sub: M.C.homeDeals.map((d) => L(d.name)).join(" · ")'),
])
patch("js/pages-b.js", [
    ('data-set-area="all">\' + esc(t("كل المدينة", "All of Madinah"))', 'data-set-area="all">\' + esc(CX("all"))'),
    ('desc: t("كل مناطق السكن الـ١٥ وعلى مستوى المدينة", "All 15 home areas and city-wide")', 'desc: t("كل مناطق السكن و" + CT.cityWide.ar, "All home areas and city-wide")'),
])
patch("js/app.js", [('console.error("Ruh Al Madinah BI: could not render"', 'console.error("Rihab BI: could not render"'),
    ('''esc(t("محلل تجريبي", "Demo analyst")) + \'</b><small dir="ltr">\' + DEMO_EMAIL + \'</small>''', '''esc(t("محلل الأعمال", "Business analyst")) + \'</b><small dir="ltr">\' + esc((session() || {}).email || DEMO_EMAIL) + \'</small>''')])
patch("js/core.js", [
    ('''      tb.rows.map((r) => "<tr>" + r.map((v) => '<td class="' + (typeof v === "number" ? "num" : "") + '">' + esc(fmtCell(v)) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";''',
     '''      tb.rows.map((r) => "<tr>" + r.map((v, i) => (idCol[i] ? '<td class="code" dir="ltr" translate="no">' : '<td class="' + (typeof v === "number" ? "num" : "") + '">') + esc(fmtCell(v)) + "</td>").join("") + "</tr>").join("") + "</tbody></table></div>";'''),
    ('''    const fmtCell = (v) => (typeof v === "number" ? num(v, Math.abs(v) < 10 && v % 1 ? 1 : 0) : v);''',
     '''    const fmtCell = (v) => (typeof v === "number" ? num(v, Math.abs(v) < 10 && v % 1 ? 1 : 0) : v);\n    /* record ids are codes, the same in both languages */\n    const idCol = tb.cols.map((c) => c === "المعرّف" || c === "ID");'''),
])
print("done")
