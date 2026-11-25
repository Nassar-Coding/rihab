/* Rihab BI — "Ask the data": a deterministic analytics assistant (adapted from the
   EyeMakkah BI agent runtime). A question is normalised (diacritics, hamza and alef forms, ى/ي,
   ة/ه, Arabic digits), matched to the closest intent in agent/ask-bank.js by token overlap,
   character trigrams and keywords, and answered from the same model and filters the dashboards
   use. Areas, categories, audiences and periods named in the question narrow that answer only;
   its buttons open the matching dashboard with those filters. Nothing leaves the browser. */
(function () {
  "use strict";
  const B = window.RuhBI, BANK = window.RUH_ASK_BANK, { M, esc, state, t, L, num, compact, pct, sar, icon } = B;
  const P = window.RuhPages, MM = M.M, X = M.XM;
  const CT = B.RC.terms, EA = CT.exampleArea;
  const history = [];

  /* ── language ── */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/(.)\1{2,}/g, "$1").replace(/[^\p{L}\p{N}%]+/gu, " ").replace(/\s+/g, " ").trim();
  }
  const toks = (s) => norm(s).split(" ").filter((x) => x.length > 1);
  const tri = (s) => { const n = " " + norm(s) + " ", o = new Set(); for (let i = 0; i < n.length - 2; i++) o.add(n.slice(i, i + 3)); return o; };
  function f1(a, b) {
    const A = new Set(toks(a)), Bs = new Set(toks(b));
    if (!A.size || !Bs.size) return 0;
    let n = 0; A.forEach((x) => { if (Bs.has(x) || [...Bs].some((y) => y.length > 3 && (y.startsWith(x) || x.startsWith(y)))) n++; });
    const p = n / A.size, r = n / Bs.size;
    return p + r ? (2 * p * r) / (p + r) : 0;
  }
  function jac(a, b) { const A = tri(a), Bs = tri(b); let n = 0; A.forEach((x) => { if (Bs.has(x)) n++; }); return n / (A.size + Bs.size - n || 1); }
  const isAr = (q) => /[؀-ۿ]/.test(q);

  /* ── entities: areas, categories, audiences, periods ── */
  function entities(q) {
    const n = " " + norm(q) + " ", out = {};
    for (const [group, map] of Object.entries(BANK.aliases)) {
      const hits = Object.entries(map).filter(([, words]) => words.some((w) => { const nw = norm(w); return nw && (n.includes(" " + nw + " ") || (nw.length > 4 && n.includes(nw))); })).map(([id]) => id);
      /* naming both audiences compares them, so it narrows nothing */
      if (hits.length && !(group === "audience" && hits.length > 1)) out[group] = hits[0];
    }
    return out;
  }
  function match(q) {
    const ar = isAr(q), lang = ar ? "ar" : "en", nq = norm(q);
    let best = null;
    for (const it of BANK.intents) {
      let s = 0;
      for (const ex of it.ex[lang].concat(it.ex[ar ? "en" : "ar"].slice(0, 2))) s = Math.max(s, 0.62 * f1(q, ex) + 0.38 * jac(q, ex));
      const kw = (it.kw[lang] || []).filter((k) => (" " + nq + " ").includes(" " + norm(k)) || (norm(k).length > 4 && nq.includes(norm(k)))).length;
      s += Math.min(0.3, kw * 0.12);
      if (!best || s > best.s) best = { it, s };
    }
    return best;
  }

  /* ── answers ── */
  const go = (label, page, patch) => ({ label, page, patch: patch || {} });
  function scope(en) {
    const f = { period: en.period || state.period, area: en.area || state.area, category: en.category || state.category, audience: en.audience || state.audience };
    const r = M.range(f.period);
    return { f, r, cur: M.cubeAgg(f, r.d0, r.d1), prev: M.cubeAgg(f, r.p0, r.p1), patch: Object.fromEntries(Object.entries(en).filter(([k]) => ["period", "area", "category", "audience"].includes(k))) };
  }
  const scopeText = (s) => [L(s.r.p.name), s.f.area === "all" ? t(CT.allLower.ar, CT.allLower.en) : B.zoneName(s.f.area), s.f.category !== "all" ? B.catName(s.f.category) : null, s.f.audience !== "all" ? B.audName(s.f.audience) : null].filter(Boolean).join(" · ");
  const chg = (a, b) => { const d = B.delta(a, b); return d === null ? t("جديد", "new") : pct(d, 1, true); };
  const H = {
    summary(s) {
      const U = M.uniques(s.cur), Up = M.uniques(s.prev), fu = P.peopleFunnel(s.cur), rev = M.revenue(s.f, s.r.d0, s.r.d1);
      return { text: scopeText(s) + ": " + compact(U) + t(" مستخدم نشط (", " active users (") + chg(U, Up) + t(")، ", "), ") + compact(s.cur.tot[MM.V]) + t(" مشاهدة، و", " detail views and ") + compact(s.cur.tot[MM.X]) + t(" إجراء. ", " actions. ") + pct(fu.saved / fu.u) + t(" حفظوا أو خطّطوا.", " saved or planned."),
        list: [[t("مستخدمون جدد", "New users"), compact(s.cur.tot[MM.N])], [t("الإيرادات (تجريبية)", "Revenue (demo)"), sar(rev.total)], [t("الزوار من المستخدمين", "Visitors among users"), pct(P.uniqA(s.cur, 1) / (U || 1))]], actions: [go(t("افتح الملخص التنفيذي", "Open the executive overview"), "overview", s.patch)] };
    },
    users(s) { const U = M.uniques(s.cur); return { text: compact(U) + t(" مستخدم نشط في ", " active users in ") + scopeText(s) + " (" + chg(U, M.uniques(s.prev)) + t(" مقارنة بالفترة السابقة).", " against the previous period).") + t(" المتوسط اليومي ", " The daily average is ") + compact(s.cur.tot[MM.U] / s.cur.days) + ".", actions: [go(t("افتح الملخص التنفيذي", "Open the executive overview"), "overview", s.patch)] }; },
    new_users(s) { return { text: compact(s.cur.tot[MM.N]) + t(" مستخدم جديد في ", " new users in ") + scopeText(s) + " (" + chg(s.cur.tot[MM.N], s.prev.tot[MM.N]) + t("). أغلبهم زوار: ", "). Most are visitors: ") + pct(s.cur.byA[1][MM.N] / (s.cur.tot[MM.N] || 1)) + ".", actions: [go(t("افتح السكان والزوار", "Open residents and visitors"), "audiences", s.patch)] }; },
    residents_visitors(s) {
      /* both audiences are compared; a question about one of them is answered about that one */
      const one = s.patch.audience, f = { ...s.f, audience: "all" };
      const cur = M.cubeAgg(f, s.r.d0, s.r.d1), prev = M.cubeAgg(f, s.r.p0, s.r.p1);
      const r = P.uniqA(cur, 0), v = P.uniqA(cur, 1), rp = P.uniqA(prev, 0), vp = P.uniqA(prev, 1);
      const act = [go(t("افتح السكان والزوار", "Open residents and visitors"), "audiences", s.patch)];
      if (one === "visitor") return { text: compact(v) + t(" زائر نشط (", " active visitors (") + chg(v, vp) + t(")، أي ", "), ") + pct(v / (r + v || 1)) + t(" من المستخدمين. الزوار الجدد: ", " of users. New visitors: ") + compact(cur.byA[1][MM.N]) + ".", actions: act };
      if (one === "resident") return { text: compact(r) + t(" ساكن نشط (", " active residents (") + chg(r, rp) + t(")، أي ", "), ") + pct(r / (r + v || 1)) + t(" من المستخدمين، ويعودون للتطبيق أكثر من الزوار.", " of users; they come back to the app more often than visitors."), actions: act };
      return { text: t("السكان ", "Residents ") + compact(r) + " (" + chg(r, rp) + t(")، والزوار ", "), visitors ") + compact(v) + " (" + chg(v, vp) + t("). الزوار ", "). Visitors are ") + pct(v / (r + v || 1)) + t(" من المستخدمين، لكن السكان أكثر عودة للتطبيق.", " of users, but residents come back more often."), actions: act };
    },
    countries() { return { text: t("نحو ثلث الزوار من داخل المملكة، ثم باكستان وإندونيسيا (١٠٪ لكل منهما) ومصر (٩٪) والهند (٧٪). هذه أرقام تجريبية.", "About a third of visitors come from within Saudi Arabia, then Pakistan and Indonesia (10% each), Egypt (9%) and India (7%). These are demo figures."), actions: [go(t("افتح السكان والزوار", "Open residents and visitors"), "audiences")] }; },
    top_areas(s) {
      const a = M.cubeAgg({ ...s.f, area: "all" }, s.r.d0, s.r.d1);
      const z = M.ZONES.slice(0, M.HOMEZ).map((zz, i) => ({ zz, v: a.byZ[i][MM.U] / a.days })).sort((x, y) => y.v - x.v);
      return { text: t("أكثر المناطق نشاطًا في ", "The most active areas in ") + L(s.r.p.name) + t(":", ":"), list: z.slice(0, 5).map((x) => [L(x.zz.name), compact(x.v) + t(" مستخدم يوميًا", " users a day")]), actions: [go(t("افتح الخريطة", "Open the map"), "geography", { ...s.patch, area: "all" })] };
    },
    growth_areas(s) {
      const a = M.cubeAgg({ ...s.f, area: "all" }, s.r.d0, s.r.d1), p = M.cubeAgg({ ...s.f, area: "all" }, s.r.p0, s.r.p1);
      const z = M.ZONES.slice(0, M.HOMEZ).map((zz, i) => ({ zz, d: B.delta(a.byZ[i][MM.U], p.byZ[i][MM.U]) || 0 })).sort((x, y) => y.d - x.d);
      return { text: t("الأسرع نموًا: ", "Fastest growing: ") + L(z[0].zz.name) + " (" + pct(z[0].d, 1, true) + t(")، والأبطأ: ", "); slowest: ") + L(z[z.length - 1].zz.name) + " (" + pct(z[z.length - 1].d, 1, true) + ").", list: z.slice(0, 4).map((x) => [L(x.zz.name), pct(x.d, 1, true)]), actions: [go(t("افتح الخريطة على النمو", "Open the growth map"), "geography", { ...s.patch, area: "all" }, "growth")] };
    },
    area_profile(s) {
      if (s.f.area === "all") return { text: t("أي منطقة تقصد؟ مثلًا: «كيف " + EA.ar + "؟» أو «وش وضع العوالي؟»", "Which area do you mean? For example: \"How is " + EA.en + " doing?\""), chips: [["كيف " + EA.ar + "؟", "How is " + EA.en + " doing?"], ["وش وضع العوالي؟", "Tell me about Al-Awali"]] };
      const i = M.ZI[s.f.area], all = M.cubeAgg({ ...s.f, area: "all" }, s.r.d0, s.r.d1);
      const top = M.CATS.map((c, ci) => ({ c, v: s.cur.byC[ci][MM.V] })).sort((a, b) => b.v - a.v)[0];
      return { text: B.zoneName(s.f.area) + t(": ", ": ") + compact(s.cur.tot[MM.U] / s.cur.days) + t(" مستخدم يوميًا (", " users a day (") + pct(all.byZ[i][MM.U] / (all.tot[MM.U] || 1)) + t(" من " + CT.city.ar + ")، والنمو ", " of the city); growth ") + chg(s.cur.tot[MM.U], s.prev.tot[MM.U]) + t(". الأكثر مشاهدة: ", ". Most viewed: ") + L(top.c.name) + ".", list: [[t("الزوار", "Visitors"), pct(s.cur.byA[1][MM.U] / (s.cur.tot[MM.U] || 1))], [t("إجراءات", "Actions"), compact(s.cur.tot[MM.X])]], actions: [go(t("صفِّ اللوحات على ", "Filter the dashboards to ") + B.zoneName(s.f.area), "geography", s.patch)] };
    },
    top_categories(s) { const c = M.CATS.map((cc, i) => ({ cc, v: s.cur.byC[i][MM.V] })).filter((x) => x.v).sort((a, b) => b.v - a.v); return { text: t("الفئات الأكثر مشاهدة في ", "The most viewed categories in ") + scopeText(s) + ":", list: c.slice(0, 5).map((x) => [L(x.cc.name), pct(x.v / (s.cur.tot[MM.V] || 1))]), actions: [go(t("افتح الملخص التنفيذي", "Open the executive overview"), "overview", s.patch)] }; },
    top_places(s) { const o = M.objectRows(s.f, s.r.d0, s.r.d1).sort((a, b) => b.views - a.views).slice(0, 5); return { text: t("الأكثر مشاهدة في ", "Most viewed in ") + scopeText(s) + ":", list: o.map((x) => [L(x.ob.o.name), compact(x.views)]), actions: [go(t("افتح الأحياء والخريطة", "Open districts and map"), "geography", s.patch)] }; },
    top_experiences(s) { const o = M.objectRows(s.f, s.r.d0, s.r.d1).filter((x) => M.EXP_TYPES.has(x.ob.o.type)).sort((a, b) => b.actions - a.actions).slice(0, 5); return o.length ? { text: t("التجارب والأنشطة الأكثر إجراءات (انضمام وتسجيل وحجز):", "Experiences and activities with the most actions (joins, registrations, bookings):"), list: o.map((x) => [L(x.ob.o.name), compact(x.actions)]), actions: [go(t("افتح التجارب والأنشطة", "Open experiences and activities"), "experiences", s.patch)] } : { text: t("لا توجد تجارب ضمن هذه الفلاتر.", "No experiences match these filters.") }; },
    capacity() { const o = M.OBJS.filter((x) => x.o.cap).sort((a, b) => b.o.joined / b.o.cap - a.o.joined / a.o.cap).slice(0, 4); return { text: t("الأقرب إلى الاكتمال اليوم، من أعداد المقاعد في التطبيق:", "Closest to full today, from the app's places and sign-ups:"), list: o.map((x) => [L(x.o.name), pct(x.o.joined / x.o.cap, 0) + " · " + num(x.o.joined) + "/" + num(x.o.cap)]), actions: [go(t("افتح التجارب والأنشطة", "Open experiences and activities"), "experiences")] }; },
    conversion(s) { const fu = P.peopleFunnel(s.cur); return { text: t("من كل ١٠٠ مستخدم نشط: ", "Of every 100 active users: ") + num(fu.viewed / fu.u * 100) + t(" شاهدوا تفاصيل، ", " viewed details, ") + num(fu.saved / fu.u * 100) + t(" حفظوا أو خطّطوا، ", " saved or planned, ") + num(fu.acted / fu.u * 100) + t(" نفّذوا إجراءً، و", " took an action and ") + num(fu.done / fu.u * 100) + t(" أكملوا عنصرًا في خطتهم.", " completed a plan item."), list: [[t("معدل الحفظ", "Save rate"), pct(s.cur.tot[MM.SV] / (s.cur.tot[MM.V] || 1))], [t("الإضافة إلى خطتي", "Added to My Plan"), pct(s.cur.tot[MM.P] / (s.cur.tot[MM.V] || 1))]], actions: [go(t("افتح التفاعل والرحلات", "Open engagement and journeys"), "engagement", s.patch)] }; },
    peak_time(s) { const hm = M.heat(s.f, s.r.d0, s.r.d1); let p = [0, 0, 0]; hm.forEach((row, d) => row.forEach((v, h) => { if (v > p[0]) p = [v, d, h]; })); return { text: t("الذروة ", "The peak is ") + B.weekdays()[p[1]] + t(" الساعة ", " at ") + B.hours()[p[2]] + ":00" + (s.r.p.id === "ramadan" ? t("؛ في رمضان ينتقل النشاط إلى ما بعد الإفطار.", "; in Ramadan activity moves to after iftar.") : t("؛ المساء بعد العشاء هو الأنشط عادة.", "; evenings after Isha are usually busiest.")), actions: [go(t("افتح خريطة الأوقات", "Open the time heatmap"), "engagement", s.patch)] }; },
    retention(s) { const co = M.cohorts(s.f, s.r.d1).filter((c) => c.weeks.length > 4); const w4 = co.length ? co.reduce((a, c) => a + c.weeks[4], 0) / co.length : 0; return { text: pct(w4) + t(" من المستخدمين الجدد يعودون بعد أربعة أسابيع. السكان يعودون أكثر بكثير من الزوار، الذين تنتهي زيارتهم عادة خلال أيام.", " of new users come back after four weeks. Residents return far more than visitors, whose visits usually end within days."), actions: [go(t("افتح جدول العودة", "Open the retention table"), "engagement", s.patch)] }; },
    searches(s) { const o = M.objectRows(s.f, s.r.d0, s.r.d1).sort((a, b) => b.views - a.views).slice(0, 4); return { text: compact(s.cur.tot[MM.Q]) + t(" عملية بحث. أكثر ما يُبحث عنه:", " searches. Most searched for:"), list: o.map((x) => [L(x.ob.o.name), ""]), actions: [go(t("افتح التفاعل والرحلات", "Open engagement and journeys"), "engagement", s.patch)] }; },
    assistant_topics() { return { text: t("أكثر ما يُسأل عنه مساعد التطبيق: الاكتشاف، والمطاعم والمقاهي، والأماكن والأنشطة، والمعلومات العملية. يجيب عن ", "The app Assistant is asked most about discovery, food and cafés, places and activities, and practical information. It answers ") + pct(0.912) + t(" من الأسئلة دون حاجة لتوضيح.", " of questions without a clarifying question."), actions: [go(t("افتح التفاعل والرحلات", "Open engagement and journeys"), "engagement")] }; },
    market(s) { const pr = M.productAgg(s.f, s.r.d0, s.r.d1); return { text: t("طلبات السوق في ", "Market requests in ") + scopeText(s) + t(": ", ": ") + compact(pr.tot.requests + s.cur.tot[X.SR]) + t(" (", " (") + compact(pr.tot.requests) + t(" منتجات و", " products and ") + compact(s.cur.tot[X.SR]) + t(" خدمات)، و", " services), plus ") + compact(s.cur.tot[X.EX]) + t(" حجزًا وانضمامًا للتجارب.", " experience bookings and joins."), list: [[t("قيمة طلبات المنتجات (تجريبية)", "Product request value (demo)"), sar(pr.tot.gmv)]], actions: [go(t("افتح السوق", "Open the Market"), "market", s.patch)] }; },
    top_products(s) { const pr = M.productAgg(s.f, s.r.d0, s.r.d1).rows.slice().sort((a, b) => b.requests - a.requests).slice(0, 5); return pr.some((x) => x.requests) ? { text: t("أكثر المنتجات طلبًا:", "Most requested products:"), list: pr.map((x) => [L(x.p.name), compact(x.requests)]), actions: [go(t("افتح السوق", "Open the Market"), "market", s.patch)] } : { text: t("لا توجد طلبات منتجات في هذه الفترة؛ افتُتح قسم المنتجات في ١ فبراير ٢٠٢٦.", "There are no product requests in this period; products opened on 1 February 2026.") }; },
    services(s) { const o = M.objectRows(s.f, s.r.d0, s.r.d1).filter((x) => x.ob.marketKind === "service").sort((a, b) => b.actions - a.actions).slice(0, 5); return { text: t("أكثر الخدمات طلبًا:", "Most requested services:"), list: o.map((x) => [L(x.ob.o.name), compact(x.actions)]), actions: [go(t("افتح السوق", "Open the Market"), "market", s.patch)] }; },
    city_homes(s) {
      const ca = M.cityAgg(s.f, s.r.d0, s.r.d1), h = ca.rows.filter((x) => x.it.kind === "home");
      if (!h.some((x) => x.views)) return { text: t("لا توجد بيانات سكن لهذه الفترة؛ افتُتح قسم " + CT.opps.ar + " في ١ مايو ٢٠٢٦.", "There is no housing data for this period; " + CT.opps.en + " opened on 1 May 2026.") };
      const listed = new Set(h.map((x) => x.it.z)), un = M.ZONES.slice(0, M.HOMEZ).map((z, i) => ({ z, v: ca.chips[i], i })).filter((x) => !listed.has(x.i)).sort((a, b) => b.v - a.v);
      return { text: compact(h.reduce((a, x) => a + x.requests, 0)) + t(" طلب تفاصيل على المساكن المعروضة في التطبيق. أكثر المناطق بحثًا دون إعلان: ", " details requests on the homes listed in the app. Most-searched areas with no listing: ") + un.slice(0, 3).map((x) => L(x.z.name)).join(t("، ", ", ")) + ".", list: h.map((x) => [L(x.it.name), compact(x.requests)]), actions: [go(t("افتح " + CT.opps.ar, "Open " + CT.opps.en), "city", s.patch)] };
    },
    city_invest(s, q) {
      const money = /عائد|ربح|ارباح|سعر|تكلف|مبلغ|roi|return|profit|price|cost|amount|yield/i.test(q);
      const ca = M.cityAgg(s.f, s.r.d0, s.r.d1), o = ca.rows.filter((x) => x.it.kind === "opp");
      const base = money ? t("هذه المنصة لا تعرض عوائد أو أرباحًا أو مبالغ أو تقييمات للفرص، ولا تقدم نصيحة استثمارية. ما تعرضه هو الاهتمام فقط: ", "This platform shows no returns, profits, amounts or ratings for opportunities, and gives no investment advice. It shows interest only: ") : "";
      return { text: base + compact(o.reduce((a, x) => a + x.requests, 0)) + t(" تسجيل اهتمام بالفرص المعروضة، بترتيبها في التطبيق:", " interest registrations across the listed opportunities, in the app's order:"), list: o.map((x) => [L(x.it.name), compact(x.requests)]), actions: [go(t("افتح " + CT.opps.ar, "Open " + CT.opps.en), "city", s.patch)] };
    },
    community(s) { const c = M.communityAgg(s.f, s.r.d0, s.r.d1); const top = c.rows.slice().sort((a, b) => b.posts - a.posts)[0]; return top ? { text: compact(c.rows.reduce((a, x) => a + x.posts, 0)) + t(" مشاركة في ", " posts in ") + scopeText(s) + t(". الأكثر نشاطًا: ", ". Most active: ") + L(top.cm.name) + " (" + compact(top.posts) + ").", actions: [go(t("افتح المجتمع", "Open the community"), "community", s.patch)] } : { text: t("لا توجد مشاركات ضمن هذه الفلاتر.", "No posts match these filters.") }; },
    answers(s) { const c = M.communityAgg(s.f, s.r.d0, s.r.d1), q = c.rows.reduce((a, x) => a + x.questions, 0), an = c.rows.reduce((a, x) => a + x.answers, 0); return { text: compact(q) + t(" سؤال، نال ", " questions, of which ") + pct(Math.min(0.97, 1 - Math.exp(-an / (q || 1) * 1.35))) + t(" منها إجابة. الزوار يسألون أكثر، والسكان يجيبون.", " were answered. Visitors ask most; residents answer."), actions: [go(t("افتح المجتمع", "Open the community"), "community", s.patch)] }; },
    centers(s) { const v = M.centerAgg(s.f, s.r.d0, s.r.d1), T = v.tot; if (!T[0]) return { text: t("لا يوجد مركز زوار في هذه المنطقة.", "There is no Visitor Center in this area.") }; const busiest = v.rows.slice().sort((a, b) => b.v[0] - a.v[0])[0]; return { text: t("مراكز الزوار (تجريبية): ", "Visitor Centers (demo): ") + compact(T[0]) + t(" زائر، انتظار ", " served, an average wait of ") + num(T[1] / T[0], 1) + t(" دقيقة في المتوسط، و", " minutes, ") + pct(T[6] / T[0]) + t(" خلال ١٠ دقائق، ورضا ", " within 10 minutes and satisfaction of ") + num(T[4] / T[3], 2) + t(" من ٥. الأزحم: ", " out of 5. Busiest: ") + L(busiest.ce.name) + ".", actions: [go(t("افتح مراكز الزوار", "Open Visitor Centers"), "centers", s.patch)] }; },
    revenue(s) { const r = M.revenue(s.f, s.r.d0, s.r.d1), p = M.revenue(s.f, s.r.p0, s.r.p1); return { text: t("الإيرادات التجريبية في ", "Demo revenue in ") + scopeText(s) + t(": ", ": ") + sar(r.total) + " (" + chg(r.total, p.total) + ").", list: Object.keys(r.totals).sort((a, b) => r.totals[b] - r.totals[a]).map((k) => [P.channelName(k), sar(r.totals[k])]), actions: [go(t("افتح الأداء التجاري", "Open commercial performance"), "commercial", s.patch)] }; },
    partners(s) { const o = M.objectRows(s.f, s.r.d0, s.r.d1), by = new Map(o.map((x) => [x.ob.id, x])); const rows = M.PARTNERS.map((p) => ({ p, a: p.objs.reduce((a, ob) => a + (by.get(ob.id) ? by.get(ob.id).actions : 0), 0) })).sort((a, b) => b.a - a.a).slice(0, 5); return { text: t("الشركاء الأعلى في الإجراءات:", "Partners with the most actions:"), list: rows.map((x) => [L(x.p.name), compact(x.a)]), actions: [go(t("افتح الشركاء والمشغلين", "Open partners and operators"), "partners", s.patch)] }; },
    offers(s) { const today = M.DAYS - 1, end = M.OFFERS.filter((o) => o.ends >= today && o.ends <= today + 14).sort((a, b) => a.ends - b.ends); const of = M.offerAgg(s.f, s.r.d0, s.r.d1); return { text: num(of.rows.filter((x) => x.liveDays).length) + t(" عرضًا ساريًا. تنتهي قريبًا:", " offers running. Ending soon:"), list: end.slice(0, 5).map((o) => [L(o.title), B.date(o.ends, { day: "numeric", month: "long" })]), actions: [go(t("افتح أداء العروض", "Open offer performance"), "partners", s.patch)] }; },
    ramadan(s) { const f = { ...s.f, period: "ramadan" }, r = M.range("ramadan"), a = M.cubeAgg(f, r.d0, r.d1), p = M.cubeAgg(f, r.p0, r.p1); return { text: t("رمضان ١٤٤٧هـ مقارنة برمضان ١٤٤٦هـ: المستخدمون النشطون ", "Ramadan 1447 against Ramadan 1446: active users ") + chg(M.uniques(a), M.uniques(p)) + t("، والزوار ", ", visitors ") + chg(P.uniqA(a, 1), P.uniqA(p, 1)) + t("، ويتحول النشاط إلى ما بعد الإفطار والتراويح.", ", and activity moves to after iftar and Taraweeh."), actions: [go(t("اعرض رمضان ١٤٤٧هـ", "Show Ramadan 1447"), "audiences", { ...s.patch, period: "ramadan" })] }; },
    data_source() { return { text: t("الأسماء والمناطق والفئات والمنتجات والمساكن والفرص من محتوى تطبيق " + CT.app.ar + " الفعلي. أما الأرقام (السلوك، والديموغرافيا، ومراكز الزوار، والإيرادات) فمحاكاة لأغراض العرض، وليست بيانات تشغيلية.", "Names, areas, categories, products, homes and opportunities come from the " + CT.app.en + " app's real content. The figures (behaviour, demographics, Visitor Centers and revenue) are simulated for the demo and are not operational data.") }; },
    help() { return { text: t("اسأل عن المستخدمين، السكان والزوار، المناطق، الفئات، التجارب، السوق، " + CT.opps.ar + "، المجتمع، مراكز الزوار، الشركاء أو الإيرادات. يمكنك ذكر منطقة أو فئة أو فترة، مثل: «أكثر المنتجات طلبًا في رمضان».", "Ask about users, residents and visitors, areas, categories, experiences, the Market, " + CT.opps.en + ", the community, Visitor Centers, partners or revenue. You can name an area, a category or a period, such as \"top products in Ramadan\".") }; },
    greeting() { return { text: t("أهلًا. أنا مساعد البيانات في منصة " + CT.app.ar + " لذكاء الأعمال. اسألني عن أي لوحة.", "Hello. I'm the data assistant of the " + CT.app.en + " Business Intelligence platform. Ask me about any dashboard.") }; },
    thanks() { return { text: t("العفو. هل تريد شيئًا آخر من البيانات؟", "You're welcome. Anything else from the data?") }; },
  };
  function answer(q) {
    const ui = state.lang;
    state.lang = isAr(q) ? "ar" : /[a-z]/i.test(q) ? "en" : ui;
    try { return answerIn(q); } finally { state.lang = ui; }
  }
  function answerIn(q) {
    const m = match(q), en = entities(q);
    if (!m || m.s < 0.3) {
      if (en.area) return H.area_profile(scope(en), q);
      return { text: t("لم أفهم السؤال تمامًا. جرّب أحد هذه:", "I didn't quite get that. Try one of these:"), chips: (BANK.suggestions[state.page] || BANK.suggestions.overview) };
    }
    const id = m.it.id === "users" && en.audience ? "residents_visitors" : m.it.id;
    const h = H[id] || H.help;
    try { return h(scope(en), q); } catch (err) { console.error("Ask the data:", err); return { text: t("تعذّرت الإجابة عن هذا السؤال الآن.", "That question could not be answered just now.") }; }
  }

  /* ── the drawer ── */
  function msgHtml(m) {
    if (m.who === "me") return '<div class="msg me">' + esc(m.text) + "</div>";
    const a = m.a;
    return '<div class="msg bot"><p>' + esc(a.text) + "</p>" + (a.list && a.list.length ? '<ul class="msg-l">' + a.list.map((x) => "<li><span>" + esc(x[0]) + "</span><b>" + esc(x[1]) + "</b></li>").join("") + "</ul>" : "") +
      (a.actions ? '<div class="msg-a">' + a.actions.map((x) => '<button type="button" class="btn sm" data-ask-go="' + esc(x.page) + '" data-ask-patch="' + esc(JSON.stringify(x.patch || {})) + '">' + icon("up", 14) + "<span>" + esc(x.label) + "</span></button>").join("") + "</div>" : "") +
      (a.chips ? '<div class="chips">' + a.chips.map((c) => '<button type="button" class="chip" data-ask-q="' + esc(t(c[0], c[1])) + '">' + esc(t(c[0], c[1])) + "</button>").join("") + "</div>" : "") + "</div>";
  }
  function drawer() {
    if (!state.askOpen) return "";
    const sug = (BANK.suggestions[state.page] || BANK.suggestions.overview).map((c) => '<button type="button" class="chip" data-ask-q="' + esc(t(c[0], c[1])) + '">' + esc(t(c[0], c[1])) + "</button>").join("");
    const msgs = history.length ? history.map(msgHtml).join("") : '<div class="msg bot intro"><p>' + esc(t("اسأل عن أي رقم في اللوحات، بالعربية أو الإنجليزية. الإجابات من نفس البيانات وبالفلاتر الحالية.", "Ask about any figure on the dashboards, in Arabic or English. Answers use the same data and the current filters.")) + "</p></div>";
    return '<aside class="ask" role="dialog" aria-modal="false" aria-label="' + esc(t("اسأل البيانات", "Ask the data")) + '"><header><b>' + icon("ask", 18) + esc(t("اسأل البيانات", "Ask the data")) + '</b><button type="button" class="icon-btn" data-ask-close aria-label="' + esc(t("إغلاق", "Close")) + '">' + icon("close", 18) + '</button></header><div class="ask-msgs" id="ask-msgs" aria-live="polite">' + msgs + '</div><div class="chips">' + sug + '</div><form id="ask-form" class="ask-f"><input id="ask-in" autocomplete="off" placeholder="' + esc(t("مثال: أكثر المناطق نشاطًا", "e.g. most active areas")) + '" aria-label="' + esc(t("سؤالك", "Your question")) + '"><button type="submit" class="icon-btn send" aria-label="' + esc(t("إرسال", "Send")) + '">' + icon("send", 18) + "</button></form><small>" + esc(t("مساعد محلي بلا ذكاء اصطناعي متصل؛ لا يُرسل أي سؤال.", "A local assistant with no connected AI; no question is sent anywhere.")) + "</small></aside>";
  }
  function ask(q) {
    q = String(q || "").trim();
    if (!q) return;
    history.push({ who: "me", text: q }, { who: "bot", a: answer(q) });
    if (history.length > 40) history.splice(0, history.length - 40);
    B.render();
    const box = document.getElementById("ask-msgs");
    if (box) box.scrollTop = box.scrollHeight;
    const inp = document.getElementById("ask-in"); if (inp) inp.focus();
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-ask-q], [data-ask-go], [data-ask-close]");
    if (!el) return;
    if (el.dataset.askQ) { ask(el.dataset.askQ); return; }
    if (el.dataset.askClose !== undefined) { close(); return; }
    if (el.dataset.askGo) {
      const patch = JSON.parse(el.dataset.askPatch || "{}");
      B.update(() => { Object.assign(state, patch); state.page = el.dataset.askGo; if (el.textContent && /growth|النمو/i.test(el.textContent)) state.mapMetric = "growth"; if (innerWidth < 900) state.askOpen = false; }, true);
    }
  });
  document.addEventListener("submit", (e) => { if (e.target.id === "ask-form") { e.preventDefault(); ask(document.getElementById("ask-in").value); } });
  function open() { state.askOpen = true; B.render(); const inp = document.getElementById("ask-in"); if (inp) inp.focus(); }
  function close() { state.askOpen = false; B.render(); }
  function mounted() { const box = document.getElementById("ask-msgs"); if (box) box.scrollTop = box.scrollHeight; }
  window.RuhAsk = { drawer, open, close, mounted, ask, answer, match, entities, norm };
})();
