/* Rihab BI — dashboards, part 1: executive overview, residents and visitors, engagement
   and journeys, experiences and activities, the Market, City Opportunities. Each dashboard reads
   the shared model through the active filters; names come from the app's own content. */
(function () {
  "use strict";
  const B = window.RuhBI, { M, CH, esc, state, t, L, num, compact, pct, sar, date, ctx, blabel, bsum, bavg, bands, delta, kpi, kpis, panel, insights, grid, empty, icon, zoneName, catName, AUD_SERIES } = B;
  const X = M.XM, MM = M.M;
  const RC = B.RC, CX = B.CX, CT = RC.terms;
  const P = (window.RuhPages = window.RuhPages || {});
  const CHANNEL_COLORS = { experience: CH.S[2], product: CH.S[3], service: CH.S[4], offers: CH.S[5], subscriptions: CH.S[6] };
  const channelName = (k) => ({ experience: t("عمولة التجارب والأنشطة", "Experience commissions"), product: t("منتجات السوق", "Market products"), service: t("رسوم طلبات الخدمات", "Service request fees"), offers: t("العروض والترويج", "Offers and placements"), subscriptions: t("اشتراكات الشركاء", "Partner subscriptions") }[k]);
  P.CHANNEL_COLORS = CHANNEL_COLORS; P.channelName = channelName;

  /* ── shared measures ── */
  const sumA = (agg, m) => agg.byA[0][m] + agg.byA[1][m];
  const dayArr = (agg, m) => agg.byD[0][m].map((v, i) => v + agg.byD[1][m][i]);
  function bucketUniques(c) {
    return c.B.map((b) => {
      const n = b.b - b.a + 1;
      let s = 0;
      for (let a = 0; a < 2; a++) { let u = 0; for (let d = b.a; d <= b.b; d++) u += c.cur.byD[a][MM.U][d - c.r.d0]; s += u / M.freq(n, a); }
      return s;
    });
  }
  const uniqA = (agg, a) => agg.byA[a][MM.U] / M.freq(agg.days, a);
  /* people at each step of the journey, from how often each step happens per person */
  function peopleFunnel(agg) {
    const u = M.uniques(agg) || 1;
    const p = (ev, k) => 1 - Math.exp(-ev / u / k);
    const viewed = Math.min(0.97, p(agg.tot[MM.V], 6)), saved = Math.min(viewed, p(agg.tot[MM.SV] + agg.tot[MM.P], 2.4)), acted = Math.min(saved * 1.25, p(agg.tot[MM.X], 3)), done = Math.min(acted, p(agg.tot[MM.K], 1.7));
    return { u, viewed: u * viewed, saved: u * saved, acted: u * Math.min(acted, viewed), done: u * done };
  }
  const TABS = [["home", "الرئيسية", "Home", 0.31, 0.27], ["discover", "اكتشف", "Discover", 0.22, 0.26], ["market", "السوق", "Market", 0.09, 0.11], ["community", "المجتمع", "Community", 0.14, 0.09], ["plan", "خطتي", "My Plan", 0.15, 0.17], ["assistant", "المساعد", "Assistant", 0.05, 0.07], ["city", CT.opps.ar, CT.opps.en, 0.04, 0.03]];
  /* sessions that visit each part of the app; the Market and City Opportunities count from their opening */
  function tabSessions(agg, d0, d1) {
    const tot = TABS.map(() => 0);
    for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
      const s = agg.byD[a][MM.S][d - d0];
      const w = TABS.map((tb) => ((tb[0] === "market" && d < M.LAUNCH.market) || (tb[0] === "city" && d < M.LAUNCH.city) ? 0 : tb[3 + a])), ws = w.reduce((x, y) => x + y, 0);
      w.forEach((v, i) => (tot[i] += (s * v) / ws));
    }
    return Object.fromEntries(TABS.map((tb, i) => [tb[0], tot[i]]));
  }
  P.tabSessions = tabSessions; P.TABS = TABS;
  P.peopleFunnel = peopleFunnel; P.bucketUniques = bucketUniques; P.dayArr = dayArr; P.uniqA = uniqA;
  const allAreas = () => ({ ...B.filt(), area: "all" });
  const allPoints = () => M.C.districts.filter((d) => d.x != null).map((d) => [d.x, d.y]);
  function mapSites(valueOf, opts = {}) {
    return M.ZONES.slice(0, M.HOMEZ).map((z, i) => ({ id: z.id, name: L(z.name), short: L(z.name).replace(/^(Al-|حي )/, ""), x: z.x, y: z.y, value: valueOf(i, z), extra: opts.extra ? opts.extra(i, z) : null }));
  }
  const landmarks = (rows) => M.OBJS.filter((ob) => ob.o.mustDo && ob.o.geo).map((ob) => ({ name: L(ob.o.name), x: ob.o.geo.x, y: ob.o.geo.y, rows: rows ? rows(ob) : [] }));
  const MOSQUE = () => ({ name: CX("Mosque"), x: RC.mosqueAt.x, y: RC.mosqueAt.y });
  P.mapSites = mapSites; P.allPoints = allPoints; P.landmarks = landmarks; P.MOSQUE = MOSQUE; P.allAreas = allAreas;
  const vsName = (c) => c.prevName;

  /* ═════════ 1. Executive overview ═════════ */
  P.overview = function () {
    const c = ctx(), { cur, prev, r, f } = c;
    const U = M.uniques(cur), Up = M.uniques(prev);
    const pr = M.productAgg(f, r.d0, r.d1), prp = M.productAgg(f, r.p0, r.p1);
    const mreq = pr.tot.requests + cur.tot[X.SR], mreqP = prp.tot.requests + prev.tot[X.SR];
    const cm = M.communityAgg(f, r.d0, r.d1), cmp = M.communityAgg(f, r.p0, r.p1);
    const posts = cm.rows.reduce((s, x) => s + x.posts, 0), postsP = cmp.rows.reduce((s, x) => s + x.posts, 0);
    const rev = M.revenue(f, r.d0, r.d1), revP = M.revenue(f, r.p0, r.p1);
    const vc = M.centerAgg(f, r.d0, r.d1);
    const uB = bucketUniques(c);
    const sp = (m) => bsum(dayArr(cur, m), c.B, r.d0);
    const revB = c.B.map((b) => { let s = 0; Object.values(rev.ch).forEach((arr) => { for (let d = b.a; d <= b.b; d++) s += arr[d - r.d0]; }); return s; });
    const vs = vsName(c);
    const tiles = [
      kpi({ id: "users", raw: U, label: t("المستخدمون النشطون", "Active users"), value: compact(U), delta: delta(U, Up), vs, spark: uB, hero: true }),
      kpi({ id: "new", label: t("مستخدمون جدد", "New users"), value: compact(cur.tot[MM.N]), delta: delta(cur.tot[MM.N], prev.tot[MM.N]), vs, spark: sp(MM.N) }),
      kpi({ id: "views", raw: cur.tot[MM.V], label: t("مشاهدات التفاصيل", "Detail views"), value: compact(cur.tot[MM.V]), delta: delta(cur.tot[MM.V], prev.tot[MM.V]), vs, spark: sp(MM.V) }),
      kpi({ id: "saves", label: t("حفظ وإضافة إلى خطتي", "Saved and planned"), value: compact(cur.tot[MM.SV] + cur.tot[MM.P]), delta: delta(cur.tot[MM.SV] + cur.tot[MM.P], prev.tot[MM.SV] + prev.tot[MM.P]), vs, spark: sp(MM.P) }),
      kpi({ id: "actions", raw: cur.tot[MM.X], label: t("إجراءات منفّذة", "Actions taken"), value: compact(cur.tot[MM.X]), delta: delta(cur.tot[MM.X], prev.tot[MM.X]), vs, spark: sp(MM.X), foot: t("انضمام، تسجيل، حجز، طلب، اتجاهات", "Join, register, book, request, directions") }),
      kpi({ id: "market", raw: mreq, label: t("طلبات السوق", "Market requests"), value: compact(mreq), delta: delta(mreq, mreqP), vs, spark: c.B.map((b, i) => bsum(pr.byD, c.B, r.d0)[i] + bsum(dayArr(cur, X.SR), c.B, r.d0)[i]) }),
      kpi({ id: "posts", raw: posts, label: t("مشاركات المجتمع", "Community posts"), value: compact(posts), delta: delta(posts, postsP), vs, spark: bsum(cm.byD[0].map((v, i) => v + cm.byD[1][i]), c.B, r.d0) }),
      kpi({ id: "revenue", raw: rev.total, label: t("الإيرادات", "Revenue"), value: sar(rev.total), delta: delta(rev.total, revP.total), vs, spark: revB, demo: true, color: CH.S[2] }),
    ];
    if (!U) return kpis(tiles) + empty(t("لا توجد بيانات لهذه الفلاتر.", "There is no data for these filters."));
    const series = AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: bavg(cur.byD[a.key][MM.U], c.B, r.d0) }));
    const hero = CH.trend(series, c.B.map((b) => blabel(b, r.gran)), { stack: true, fmt: compact, bands: bands(c.B), aria: t("المستخدمون النشطون يوميًا", "Daily active users") });
    const fu = peopleFunnel(cur);
    const funnel = CH.funnel([
      { name: t("مستخدمون نشطون", "Active users"), value: fu.u }, { name: t("شاهدوا تفاصيل", "Viewed details"), value: fu.viewed },
      { name: t("حفظوا أو خطّطوا", "Saved or planned"), value: fu.saved }, { name: t("نفّذوا إجراءً", "Took an action"), value: fu.acted }, { name: t("أكملوا خطة", "Completed a plan"), value: fu.done },
    ], { fmt: compact });
    const all = M.cubeAgg(allAreas(), r.d0, r.d1);
    const map = CH.districtMap(mapSites((i) => all.byZ[i][MM.U] / all.days), { narrow: true, allPoints: allPoints(), fmt: compact, selected: state.area !== "all" ? state.area : null, dim: state.area !== "all", center: MOSQUE(), name: t("مستخدمون يوميًا", "Users per day"), aria: t("خريطة الأحياء", "District map") });
    const catRows = M.CATS.map((cat, i) => ({ id: cat.id, label: L(cat.name), value: cur.byC[i][MM.V], parts: AUD_SERIES().map((a) => ({ name: a.name, color: a.color, value: 0 })) })).filter((x) => x.value > 0);
    /* per-audience split of a category's views */
    catRows.forEach((row) => { const ci = M.CATS.findIndex((cc) => cc.id === row.id); row.parts = AUD_SERIES().map((a) => ({ name: a.name, color: a.color, value: M.cubeAgg({ ...f, audience: a.id }, r.d0, r.d1).byC[ci][MM.V] })); });
    catRows.sort((a, b) => b.value - a.value);
    const cats = CH.hbars(catRows.slice(0, 8), { fmt: compact, legend: AUD_SERIES().length > 1 ? AUD_SERIES() : null, labelCol: t("الفئة", "Category"), name: t("مشاهدات", "Views") });
    const ch = Object.keys(rev.totals).map((k) => ({ name: channelName(k), color: CHANNEL_COLORS[k], value: rev.totals[k] }));
    const donut = CH.donut(ch, { fmt: sar, center: sar(rev.total), centerLabel: t("الإيرادات", "Revenue"), aria: t("الإيرادات حسب القناة", "Revenue by channel") });
    const csat = vc.tot[3] ? vc.tot[4] / vc.tot[3] : 0, sla = vc.tot[0] ? vc.tot[6] / vc.tot[0] : 0;
    const gauge = CH.gauge(csat, { min: 1, max: 5, label: num(csat, 2), minLabel: num(1), maxLabel: num(5), bands: [[1, 3.5, "#F4D9D9"], [3.5, 4.2, "#FBEBC8"], [4.2, 5, "#D6EEDD"]], color: CH.S[0], caption: t("خُدم ", "") + pct(sla, 0) + t(" من الزوار خلال ١٠ دقائق", " of visitors served within 10 minutes"), aria: t("رضا زوار المراكز", "Visitor Center satisfaction") });
    /* the watchlist: what needs attention next, from the app's own records */
    const today = M.DAYS - 1;
    const ending = M.OFFERS.filter((o) => o.ends >= today && o.ends <= today + 14).sort((a, b) => a.ends - b.ends).slice(0, 4);
    const full = M.OBJS.filter((ob) => ob.o.cap && ob.o.joined / ob.o.cap >= 0.68).sort((a, b) => b.o.joined / b.o.cap - a.o.joined / a.o.cap).slice(0, 3);
    const slow = vc.rows.filter((x) => x.v[0] && x.v[6] / x.v[0] < 0.9).map((x) => x.ce);
    const watch = '<ul class="watch">' +
      ending.map((o) => '<li class="w-warn">' + icon("clock", 16) + "<div><b>" + esc(L(o.title)) + "</b><small>" + esc(L(o.ob.o.name)) + " · " + esc(t("ينتهي ", "Ends ") + B.date(o.ends, { day: "numeric", month: "long" })) + "</small></div></li>").join("") +
      full.map((ob) => '<li class="w-info">' + icon("users", 16) + "<div><b>" + esc(L(ob.o.name)) + "</b><small>" + esc(t("اكتمل ", "") + pct(ob.o.joined / ob.o.cap, 0) + t(" من المقاعد", " of places taken") + " · " + num(ob.o.joined) + "/" + num(ob.o.cap)) + "</small></div></li>").join("") +
      (slow.length ? slow.map((ce) => '<li class="w-bad">' + icon("alert", 16) + "<div><b>" + esc(L(ce.name)) + "</b><small>" + esc(t("أقل من ٩٠٪ خُدموا خلال ١٠ دقائق", "Under 90% served within 10 minutes")) + " " + B.DEMO() + "</small></div></li>").join("") : '<li class="w-ok">' + icon("check", 16) + "<div><b>" + esc(t("مراكز الزوار ضمن هدف الانتظار", "Visitor Centers within the wait goal")) + "</b><small>" + esc(t("كل المراكز خدمت ٩٠٪ أو أكثر خلال ١٠ دقائق", "Every centre served 90% or more within 10 minutes")) + "</small></div></li>") + "</ul>";
    /* insights */
    const resD = delta(uniqA(cur, 0), uniqA(prev, 0)), visD = delta(uniqA(cur, 1), uniqA(prev, 1));
    const zG = M.ZONES.slice(0, M.HOMEZ).map((z, i) => ({ z, d: delta(all.byZ[i][MM.U], M.cubeAgg(allAreas(), r.p0, r.p1).byZ[i][MM.U]) })).filter((x) => x.d !== null).sort((a, b) => b.d - a.d);
    const topCat = catRows[0];
    const ins = insights([
      { icon: "users", title: t("النشاط", "Activity"), text: t("المستخدمون النشطون ", "Active users ") + (delta(U, Up) >= 0 ? t("ارتفعوا ", "rose ") : t("انخفضوا ", "fell ")) + pct(Math.abs(delta(U, Up) || 0)) + t(" مقارنةً مع ", " against ") + c.vsText + t("؛ السكان ", "; residents ") + pct(resD || 0, 1, true) + t(" والزوار ", " and visitors ") + pct(visD || 0, 1, true) + "." },
      zG.length && state.area === "all" ? { icon: "map", title: t("الأحياء", "Districts"), text: t("أسرع نمو في ", "The fastest growth is in ") + L(zG[0].z.name) + " (" + pct(zG[0].d, 1, true) + t(")، والأبطأ في ", "), the slowest in ") + L(zG[zG.length - 1].z.name) + " (" + pct(zG[zG.length - 1].d, 1, true) + ")." } : null,
      topCat ? { icon: "compass", title: t("الاهتمامات", "Interests"), text: topCat.label + t(" تتصدر المشاهدات بحصة ", " leads detail views with ") + pct(topCat.value / cur.tot[MM.V]) + t(" من الإجمالي.", " of the total.") } : null,
      { icon: "route", title: t("التحويل", "Conversion"), text: pct(fu.saved / fu.u) + t(" من المستخدمين حفظوا أو خطّطوا، و", " of users saved or planned, and ") + pct(fu.acted / fu.u) + t(" نفّذوا إجراءً.", " took an action.") },
    ]);
    return kpis(tiles) + grid(
      panel({ id: "ov-trend", span: 2, title: r.gran === "day" ? t("المستخدمون النشطون يوميًا", "Daily active users") : t("المستخدمون النشطون يوميًا (متوسط)", "Daily active users (average)"), sub: t("السكان والزوار، مع مواسم " + CT.city.ar, "Residents and visitors, with " + CT.cityPoss.en + " seasons"), chart: hero }),
      panel({ id: "ov-ins", title: t("أبرز ما تقوله البيانات", "What the data says"), html: ins }),
      panel({ id: "ov-funnel", title: t("رحلة المستخدم", "The user journey"), sub: t("أشخاص وصلوا إلى كل خطوة", "People who reached each step"), chart: funnel }),
      panel({ id: "ov-map", title: t("النشاط حسب المنطقة", "Activity by area"), sub: t("مستخدمون يوميًا · اضغط على منطقة لتصفية اللوحة", "Users per day · select an area to filter"), chart: map, note: t("خريطة تخطيطية من مواقع الأحياء في التطبيق، وليست بمقياس رسم.", "A schematic map from the app's district positions, not to scale.") }),
      panel({ id: "ov-cats", title: t("الفئات الأكثر مشاهدة", "Most viewed categories"), sub: t("مشاهدات التفاصيل حسب الجمهور", "Detail views by audience"), chart: cats }),
      panel({ id: "ov-rev", title: t("الإيرادات حسب القناة", "Revenue by channel"), demo: "money", chart: donut }),
      panel({ id: "ov-csat", title: t("رضا زوار المراكز", "Visitor Center satisfaction"), demo: true, sub: t("متوسط التقييم من ٥", "Average rating out of 5"), chart: gauge }),
      panel({ id: "ov-watch", title: t("تحتاج متابعة", "Watchlist"), sub: t("عروض تنتهي قريبًا وأنشطة شبه مكتملة", "Offers ending soon and activities nearly full"), html: watch }),
    );
  };

  /* ═════════ 2. Residents and visitors ═════════ */
  const AGE = [["١٨–٢٤", "18–24", 0.17, 0.11], ["٢٥–٣٤", "25–34", 0.29, 0.24], ["٣٥–٤٤", "35–44", 0.24, 0.23], ["٤٥–٥٤", "45–54", 0.15, 0.19], ["٥٥–٦٤", "55–64", 0.1, 0.14], ["٦٥+", "65+", 0.05, 0.09]];
  const COUNTRIES = [["السعودية (زوار من داخل المملكة)", "Saudi Arabia (domestic)", 0.34], ["باكستان", "Pakistan", 0.1], ["إندونيسيا", "Indonesia", 0.1], ["مصر", "Egypt", 0.09], ["الهند", "India", 0.07], ["تركيا", "Türkiye", 0.04], ["ماليزيا", "Malaysia", 0.04], ["بنغلاديش", "Bangladesh", 0.03], ["الجزائر", "Algeria", 0.03], ["المملكة المتحدة", "United Kingdom", 0.02]];
  const STAY_MIX = { today: 0.14, short: 0.31, mid: 0.38, long: 0.17 }, PARTY_MIX = { solo: 0.17, couple: 0.18, family: 0.27, kids: 0.26, group: 0.12 };
  const INTEREST_RATE = { resident: { food: 0.62, family: 0.48, events: 0.41, sport: 0.33, learn: 0.29, culture: 0.36, community: 0.27, volunteer: 0.19, market: 0.31 }, visitor: { culture: 0.71, heritage: 0.64, food: 0.58, market: 0.44, nature: 0.26, family: 0.37, experiences: 0.33, walking: 0.29, learn: 0.17 } };
  P.audiences = function () {
    const c = ctx(), { cur, prev, r, f } = c, vs = vsName(c);
    const uR = uniqA(cur, 0), uV = uniqA(cur, 1), pR = uniqA(prev, 0), pV = uniqA(prev, 1);
    const newV = cur.byA[1][MM.N], newVp = prev.byA[1][MM.N];
    const visShare = (uR + uV) ? uV / (uR + uV) : 0, visShareP = (pR + pV) ? pV / (pR + pV) : 0;
    const avgStay = Object.entries(STAY_MIX).reduce((s, [k, v]) => s + v * M.C.stay.find((x) => x.id === k).days, 0);
    const show = { r: state.audience !== "visitor", v: state.audience !== "resident" };
    const tiles = [
      kpi({ id: "residents", raw: show.r ? uR : 0, label: t("السكان النشطون", "Active residents"), value: show.r ? compact(uR) : "—", delta: show.r ? delta(uR, pR) : undefined, vs, spark: show.r ? bavg(cur.byD[0][MM.U], c.B, r.d0) : null, color: CH.AUD.resident }),
      kpi({ id: "visitors", raw: show.v ? uV : 0, label: t("الزوار النشطون", "Active visitors"), value: show.v ? compact(uV) : "—", delta: show.v ? delta(uV, pV) : undefined, vs, spark: show.v ? bavg(cur.byD[1][MM.U], c.B, r.d0) : null, color: CH.AUD.visitor }),
      kpi({ label: t("حصة الزوار من النشاط", "Visitors' share of users"), value: pct(visShare), delta: state.audience === "all" ? delta(visShare, visShareP) : undefined, vs }),
      kpi({ label: t("زوار جدد", "New visitors"), value: show.v ? compact(newV) : "—", delta: show.v ? delta(newV, newVp) : undefined, vs }),
      kpi({ label: t("متوسط مدة الزيارة", "Average visit length"), value: num(avgStay, 1) + t(" أيام", " days"), foot: t("من خيارات مدة الزيارة في التطبيق", "From the app's visit-length options"), demo: true }),
      kpi({ label: t("زوار عائدون", "Returning visitors"), value: pct(0.18 + 0.02 * Math.sin(r.d1 / 40)), foot: t("زاروا " + CT.city.ar + " من قبل باستخدام التطبيق", "Visited " + CT.city.en + " with the app before"), demo: true }),
    ];
    if (!(uR + uV)) return kpis(tiles) + empty(t("لا توجد بيانات لهذه الفلاتر.", "There is no data for these filters."));
    const lines = CH.trend(AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: bavg(cur.byD[a.key][MM.U], c.B, r.d0) })), c.B.map((b) => blabel(b, r.gran)), { fmt: compact, bands: bands(c.B) });
    /* always the last 12 months, so the seasons can be read */
    const y0 = M.idx("2025-11-01"), yB = M.buckets(y0, M.DAYS - 1, "month"), ya = M.cubeAgg(f, y0, M.DAYS - 1);
    const season = CH.trend(AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: bavg(ya.byD[a.key][MM.U], yB, y0) })), yB.map((b) => blabel(b, "month")), { fmt: compact, bands: bands(yB), area: true });
    const age = CH.butterfly(AGE.map((x) => ({ label: t(x[0], x[1]), a: x[2], b: x[3] })), { name: t("السكان", "Residents"), color: CH.AUD.resident }, { name: t("الزوار", "Visitors"), color: CH.AUD.visitor });
    const ctry = CH.hbars(COUNTRIES.map((x) => ({ label: t(x[0], x[1]), value: uV * x[2] })), { fmt: compact, color: CH.AUD.visitor, name: t("زوار", "Visitors"), labelCol: t("البلد", "Country") });
    const stay = CH.donut(M.C.stay.map((s, i) => ({ name: L(s.name), color: CH.ramp(0.3 + i * 0.22, CH.SEQ_B), value: uV * STAY_MIX[s.id] })), { fmt: compact, center: num(avgStay, 1), centerLabel: t("يوم في المتوسط", "days on average") });
    const party = CH.columns(M.C.party.map((p) => L(p.name)), [{ name: t("الزوار", "Visitors"), color: CH.AUD.visitor, values: M.C.party.map((p) => uV * PARTY_MIX[p.id]) }], { fmt: compact });
    const catBoost = (cats) => (state.category !== "all" && cats.includes(state.category) ? 1.3 : 1);
    const intR = CH.hbars(M.C.interests.resident.map((i) => ({ label: L(i.name), value: Math.min(0.95, INTEREST_RATE.resident[i.id] * catBoost(i.cats)) })).sort((a, b) => b.value - a.value), { fmt: (v) => pct(v, 0), max: 1, color: CH.AUD.resident, name: t("اختاروه", "Chose it") });
    const intV = CH.hbars(M.C.interests.visitor.map((i) => ({ label: L(i.name), value: Math.min(0.95, INTEREST_RATE.visitor[i.id] * catBoost(i.cats)) })).sort((a, b) => b.value - a.value), { fmt: (v) => pct(v, 0), max: 1, color: CH.AUD.visitor, name: t("اختاروه", "Chose it") });
    const homes = CH.hbars(M.ZONES.slice(0, M.HOMEZ).map((z, i) => ({ label: L(z.name), value: cur.byZ[i] ? M.cubeAgg({ ...f, audience: "resident" }, r.d0, r.d1).byZ[i][MM.U] / M.freq(c.days, 0) : 0 })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value), { fmt: compact, color: CH.AUD.resident, name: t("سكان نشطون", "Active residents"), labelCol: t("المنطقة", "Area"), rank: true });
    const prof = (label, segs) => '<div class="prof-row"><span>' + esc(label) + '</span><div class="stackbar">' + segs.map((s) => '<i style="width:' + (s.v * 100).toFixed(1) + "%;background:" + s.c + ";color:" + CH.inkOn(s.c) + '"' + CH.tip(label, [[s.c, s.n, pct(s.v, 0)]]) + ">" + (s.v >= 0.12 ? esc(pct(s.v, 0)) : "") + "</i>").join("") + "</div></div>";
    const profile = '<div class="profile">' + CH.legend([{ name: t("ذكور", "Men"), color: CH.S[5] }, { name: t("إناث", "Women"), color: CH.S[3] }]) +
      (show.r ? prof(t("السكان", "Residents"), [{ v: 0.54, c: CH.S[5], n: t("ذكور", "Men") }, { v: 0.46, c: CH.S[3], n: t("إناث", "Women") }]) : "") + (show.v ? prof(t("الزوار", "Visitors"), [{ v: 0.57, c: CH.S[5], n: t("ذكور", "Men") }, { v: 0.43, c: CH.S[3], n: t("إناث", "Women") }]) : "") +
      CH.legend([{ name: t("العربية", "Arabic"), color: CH.NOOR }, { name: t("الإنجليزية", "English"), color: CH.S[4] }]) +
      (show.r ? prof(t("لغة التطبيق — السكان", "App language — residents"), [{ v: 0.86, c: CH.NOOR, n: t("العربية", "Arabic") }, { v: 0.14, c: CH.S[4], n: t("الإنجليزية", "English") }]) : "") + (show.v ? prof(t("لغة التطبيق — الزوار", "App language — visitors"), [{ v: 0.58, c: CH.NOOR, n: t("العربية", "Arabic") }, { v: 0.42, c: CH.S[4], n: t("الإنجليزية", "English") }]) : "") + "</div>";
    const catCols = M.CATS.map((cat, i) => ({ cat, r: M.cubeAgg({ ...f, audience: "resident" }, r.d0, r.d1).byC[i][MM.V], v: M.cubeAgg({ ...f, audience: "visitor" }, r.d0, r.d1).byC[i][MM.V] }));
    const tr = catCols.reduce((s, x) => s + x.r, 0) || 1, tv = catCols.reduce((s, x) => s + x.v, 0) || 1;
    const prefs = CH.butterfly(catCols.filter((x) => x.r + x.v > 0).sort((a, b) => b.r / tr + b.v / tv - a.r / tr - a.v / tv).slice(0, 8).map((x) => ({ label: L(x.cat.name), a: x.r / tr, b: x.v / tv })), { name: t("السكان", "Residents"), color: CH.AUD.resident }, { name: t("الزوار", "Visitors"), color: CH.AUD.visitor });
    const insV = { icon: "users", title: t("مواسم الزيارة", "Visiting seasons"), text: t("في رمضان يرتفع عدد الزوار النشطين يوميًا إلى قرابة ", "In Ramadan, daily active visitors rise to about ") + pct(M.cubeAgg(f, M.idx("2026-02-18"), M.idx("2026-03-19")).byA[1][MM.U] / 30 / (M.cubeAgg(f, M.idx("2026-07-01"), M.idx("2026-07-30")).byA[1][MM.U] / 30 || 1), 0) + t(" من مستواه في يوليو.", " of their July level.") };
    return kpis(tiles) + grid(
      panel({ id: "au-trend", span: 2, title: t("السكان والزوار عبر الفترة", "Residents and visitors over the period"), sub: r.gran === "day" ? t("مستخدمون نشطون يوميًا", "Daily active users") : t("متوسط المستخدمين النشطين يوميًا", "Average daily active users"), chart: lines }),
      panel({ id: "au-ins", title: t("أبرز ما تقوله البيانات", "What the data says"), html: insights([insV,
        { icon: "map", title: t("أين ينشط السكان", "Where residents are active"), text: t("أكثر المناطق نشاطًا للسكان: ", "The most active areas for residents: ") + homes.table.rows.slice(0, 3).map((x) => x[0]).join(t("، ", ", ")) + "." },
        { icon: "globe", title: t("من أين يأتي الزوار", "Where visitors come from"), text: t("ثلث الزوار تقريبًا من داخل المملكة، ثم باكستان وإندونيسيا ومصر.", "About a third of visitors come from within Saudi Arabia, then Pakistan, Indonesia and Egypt.") }]) }),
      panel({ id: "au-season", span: 2, title: t("مواسم " + CT.city.ar + " — آخر ١٢ شهرًا", CT.cityPoss.en + " seasons — last 12 months"), sub: t("متوسط المستخدمين يوميًا لكل شهر. هذه اللوحة تعرض ١٢ شهرًا دائمًا.", "Average daily users per month. This panel always shows 12 months."), chart: season }),
      panel({ id: "au-profile", title: t("لمحة عن المستخدمين", "Profile at a glance"), demo: true, html: profile }),
      panel({ id: "au-age", title: t("الفئات العمرية", "Age groups"), demo: true, sub: t("نسبة كل فئة داخل كل جمهور", "Share of each group within each audience"), chart: age }),
      panel({ id: "au-pref", title: t("ماذا يشاهد كل جمهور", "What each audience views"), sub: t("حصة الفئة من مشاهدات كل جمهور", "Category share of each audience's views"), chart: prefs }),
      show.v ? panel({ id: "au-ctry", title: t("بلدان الزوار", "Visitors' countries"), demo: true, sub: t("أعلى ١٠ بلدان", "Top 10 countries"), chart: ctry }) : "",
      show.v ? panel({ id: "au-stay", title: t("مدة الزيارة", "Visit length"), sub: t("خيارات التطبيق عند إنشاء حساب الزائر", "The app's visitor sign-up options"), demo: true, chart: stay }) : "",
      show.v ? panel({ id: "au-party", title: t("مع من يزورون", "Who visitors come with"), demo: true, chart: party }) : "",
      show.r ? panel({ id: "au-int-r", title: t("اهتمامات السكان", "Residents' interests"), sub: t("نسبة من اختار كل اهتمام (اختيار متعدد)", "Share who chose each interest (multiple choice)"), demo: true, chart: intR }) : "",
      show.v ? panel({ id: "au-int-v", title: t("اهتمامات الزوار", "Visitors' interests"), sub: t("نسبة من اختار كل اهتمام (اختيار متعدد)", "Share who chose each interest (multiple choice)"), demo: true, chart: intV }) : "",
      show.r ? panel({ id: "au-homes", title: t("أين ينشط السكان", "Where residents are active"), sub: t("سكان نشطون حسب منطقة نشاطهم", "Active residents by the area of their activity"), chart: homes }) : "",
    );
  };

  /* ═════════ 3. Engagement and journeys ═════════ */
  const ASSIST_CAT = { discovery: ["الاكتشاف", "Discovery", 1.6], food_cafe: ["المطاعم والمقاهي", "Food and cafés", 1.5], places_activities: ["الأماكن والأنشطة", "Places and activities", 1.3], plan: ["الخطة", "My Plan", 1.1], offers: ["العروض", "Offers", 1.0], access_practical: ["معلومات عملية", "Practical information", 1.2], time_area: ["الوقت والمنطقة", "Time and area", 0.9], community: ["المجتمع", "Community", 0.7], market: ["السوق و" + CT.opps.ar, "Market and " + CT.opps.en, 0.8], family_party: ["العائلة والمرافقون", "Family and party", 0.8], visitor_resident: ["الزائر والساكن", "Visitor and resident", 0.6], app_help: ["مساعدة التطبيق", "App help", 0.5], social: ["تحية وشكر", "Greetings and thanks", 0.7], conversation_context: ["متابعة الحديث", "Follow-ups", 0.45] };
  const PLAN_MIX = { planned: 0.31, going: 0.11, registered: 0.09, awaiting: 0.06, confirmed: 0.07, active: 0.02, completed: 0.26, cancelled: 0.08 };
  P.engagement = function () {
    const c = ctx(), { cur, prev, r, f } = c, vs = vsName(c);
    const S = cur.tot[MM.S], Sp = prev.tot[MM.S], Udays = cur.tot[MM.U] || 1;
    const minutes = (cur.byA[0][MM.S] * 6.4 + cur.byA[1][MM.S] * 8.9) / (S || 1), minutesP = (prev.byA[0][MM.S] * 6.4 + prev.byA[1][MM.S] * 8.9) / (Sp || 1);
    const conv = (agg, m) => (agg.tot[MM.V] ? agg.tot[m] / agg.tot[MM.V] : 0);
    const conversations = cur.byA[0][MM.S] * 0.05 + cur.byA[1][MM.S] * 0.09, conversationsP = prev.byA[0][MM.S] * 0.05 + prev.byA[1][MM.S] * 0.09;
    const tiles = [
      kpi({ label: t("الجلسات", "Sessions"), value: compact(S), delta: delta(S, Sp), vs, spark: bsum(dayArr(cur, MM.S), c.B, r.d0) }),
      kpi({ label: t("متوسط مدة الجلسة", "Average session"), value: num(minutes, 1) + t(" د", " min"), delta: delta(minutes, minutesP), vs, demo: true }),
      kpi({ label: t("مشاهدات لكل مستخدم يوميًا", "Views per user per day"), value: num(cur.tot[MM.V] / Udays, 1), delta: delta(cur.tot[MM.V] / Udays, prev.tot[MM.V] / (prev.tot[MM.U] || 1)), vs }),
      kpi({ label: t("معدل الحفظ", "Save rate"), value: pct(conv(cur, MM.SV)), delta: delta(conv(cur, MM.SV), conv(prev, MM.SV)), vs, foot: t("من مشاهدات التفاصيل", "Of detail views") }),
      kpi({ label: t("الإضافة إلى خطتي", "Added to My Plan"), value: pct(conv(cur, MM.P)), delta: delta(conv(cur, MM.P), conv(prev, MM.P)), vs, foot: t("من مشاهدات التفاصيل", "Of detail views") }),
      kpi({ label: t("محادثات المساعد", "Assistant conversations"), value: compact(conversations), delta: delta(conversations, conversationsP), vs }),
    ];
    if (!S) return kpis(tiles) + empty(t("لا توجد بيانات لهذه الفلاتر.", "There is no data for these filters."));
    const fu = peopleFunnel(cur);
    const funnel = CH.funnel([
      { name: t("مستخدمون نشطون", "Active users"), value: fu.u }, { name: t("شاهدوا تفاصيل مكان أو تجربة", "Viewed a place or experience"), value: fu.viewed },
      { name: t("حفظوا أو أضافوا إلى خطتي", "Saved or added to My Plan"), value: fu.saved }, { name: t("نفّذوا إجراءً", "Took an action"), value: fu.acted, sub: t("انضمام، تسجيل، حجز، طلب، اتجاهات", "Join, register, book, request, directions") },
      { name: t("أكملوا عنصرًا في خطتهم", "Completed a plan item"), value: fu.done },
    ], { fmt: compact });
    /* journeys: where sessions start, which part of the app they reach, how far they go */
    const resW = cur.byA[0][MM.S] / (S || 1), visW = 1 - resW;
    const entries = [["e-home", t("الرئيسية", "Home"), 0.38, 0.3], ["e-discover", t("اكتشف", "Discover"), 0.2, 0.22], ["e-search", t("البحث", "Search"), 0.16, 0.18], ["e-assist", t("المساعد", "Assistant"), 0.08, 0.12], ["e-community", t("المجتمع", "Community"), 0.1, 0.08], ["e-notify", t("إشعار أو رابط", "Notification or link"), 0.08, 0.1]];
    const sections = [["s-places", t("أماكن ومطاعم", "Places and food"), 0.46], ["s-exp", t("تجارب وأنشطة", "Experiences and activities"), 0.24], ["s-market", t("السوق", "Market"), 0.12], ["s-comm", t("المجتمع", "Community"), 0.13], ["s-city", CX("opps"), 0.05]];
    const actS = Math.min(S * 0.32, cur.tot[MM.X] * 0.8), planS = Math.min(S * 0.18, cur.tot[MM.P] * 0.75), saveS = Math.min(S * 0.2, cur.tot[MM.SV] * 0.6);
    const outs = [["o-act", t("نفّذ إجراءً", "Took an action"), actS], ["o-plan", t("أضاف إلى خطتي", "Added to My Plan"), planS], ["o-save", t("حفظ", "Saved"), saveS], ["o-browse", t("تصفّح فقط", "Browsed only"), Math.max(0, S - actS - planS - saveS)]];
    const eN = entries.map((e) => ({ id: e[0], name: e[1], value: S * (e[2] * resW + e[3] * visW), color: CH.NOOR }));
    const sN = sections.map((s) => ({ id: s[0], name: s[1], value: S * s[2], color: CH.S[0] }));
    const oN = outs.map((o, i) => ({ id: o[0], name: o[1], value: o[2], color: CH.ramp(0.85 - i * 0.18) }));
    const links = [];
    eN.forEach((e) => sN.forEach((s) => links.push({ from: e.id, to: s.id, value: e.value * (s.value / S) })));
    sN.forEach((s) => oN.forEach((o) => links.push({ from: s.id, to: o.id, value: s.value * (o.value / S) })));
    const sk = CH.sankey([eN, sN, oN], links, { fmt: compact, aria: t("رحلات المستخدمين", "User journeys") });
    const hm = M.heat(f, r.d0, r.d1);
    const heat = CH.heatmap(hm, B.weekdays(), B.hours(), { fmt: compact, colEvery: 3, unit: t("جلسات", "sessions") });
    const co = M.cohorts(f, r.d1).map((x) => ({ ...x, label: date(x.start) }));
    const coh = CH.cohort(co);
    const ts = tabSessions(cur, r.d0, r.d1);
    const tabs = CH.hbars(TABS.map((tb) => ({ label: t(tb[1], tb[2]), value: ts[tb[0]] })).sort((a, b) => b.value - a.value), { fmt: compact, color: CH.S[0], name: t("جلسات", "Sessions"), labelCol: t("القسم", "Section") });
    const objs = M.objectRows(f, r.d0, r.d1).sort((a, b) => b.views - a.views);
    const Q = cur.tot[MM.Q];
    const terms = objs.slice(0, 7).map((x) => ({ label: L(x.ob.o.name), w: x.views })).concat(M.CATS.map((cat, i) => ({ label: L(cat.name), w: cur.byC[i][MM.Q] * 2.2 })).sort((a, b) => b.w - a.w).slice(0, 3));
    const tw = terms.reduce((s, x) => s + x.w, 0) || 1;
    const searches = CH.hbars(terms.map((x) => ({ label: x.label, value: Q * 0.42 * x.w / tw })).sort((a, b) => b.value - a.value), { fmt: compact, color: CH.S[1], name: t("عمليات بحث", "Searches"), labelCol: t("ما بحثوا عنه", "Searched for"), rank: true });
    const ac = M.C.assistant.categories;
    const at = Object.keys(ASSIST_CAT).map((k) => ({ label: t(ASSIST_CAT[k][0], ASSIST_CAT[k][1]), value: (ac[k] || 1) * ASSIST_CAT[k][2] }));
    const atw = at.reduce((s, x) => s + x.value, 0);
    const assist = CH.hbars(at.map((x) => ({ ...x, value: conversations * 2.6 * x.value / atw })).sort((a, b) => b.value - a.value).slice(0, 9), { fmt: compact, color: CH.S[5], name: t("أسئلة", "Questions"), labelCol: t("الموضوع", "Topic") });
    /* the app labels a completed plan item with the word it also uses for a full activity; here it means completed */
    const planLabel = (k) => (k === "completed" ? t(M.C.planStates[k].ar, "Completed") : L(M.C.planStates[k]));
    const plan = CH.hbars(Object.keys(PLAN_MIX).map((k) => ({ label: planLabel(k), value: cur.tot[MM.P] * PLAN_MIX[k] })), { fmt: compact, color: CH.S[0], name: t("عناصر", "Items"), labelCol: t("الحالة في خطتي", "My Plan state") });
    const steps = CH.trend([{ name: t("حفظ", "Saves"), color: CH.S[0], values: bsum(dayArr(cur, MM.SV), c.B, r.d0) }, { name: t("إضافة إلى خطتي", "Added to My Plan"), color: CH.S[1], values: bsum(dayArr(cur, MM.P), c.B, r.d0) }, { name: t("إجراءات", "Actions"), color: CH.S[2], values: bsum(dayArr(cur, MM.X), c.B, r.d0) }], c.B.map((b) => blabel(b, r.gran)), { fmt: compact, narrow: true });
    let peak = [0, 0, 0];
    hm.forEach((row, d) => row.forEach((v, h) => { if (v > peak[0]) peak = [v, d, h]; }));
    return kpis(tiles) + grid(
      panel({ id: "en-funnel", title: t("الأشخاص في كل خطوة", "People at each step"), sub: t("مستخدمون فريدون وصلوا إلى كل خطوة", "Unique users who reached each step"), chart: funnel }),
      panel({ id: "en-sankey", span: 2, title: t("رحلات المستخدمين", "User journeys"), sub: t("من أين تبدأ الجلسة، وإلى أين تصل، وماذا تنتهي به", "Where sessions start, what they reach and how they end"), chart: sk }),
      panel({ id: "en-heat", span: 2, title: t("متى يستخدمون التطبيق", "When people use the app"), sub: t("الجلسات حسب اليوم والساعة (توقيت " + CT.city.ar + ")", "Sessions by weekday and hour (" + CT.city.en + " time)"), chart: heat, note: t("ذروة الاستخدام: ", "Peak: ") + B.weekdays()[peak[1]] + " " + B.hours()[peak[2]] + ":00" + (r.p.id === "ramadan" ? t(" — في رمضان يتحول النشاط إلى ما بعد الإفطار والتراويح.", " — in Ramadan activity moves to after iftar and Taraweeh.") : "") }),
      panel({ id: "en-tabs", title: t("أقسام التطبيق", "Parts of the app"), sub: t("الجلسات التي زارت كل قسم", "Sessions that visited each part"), demo: true, chart: tabs }),
      panel({ id: "en-cohort", span: 2, title: t("العودة إلى التطبيق", "Coming back"), sub: t("مجموعات أسبوعية من المستخدمين الجدد ونسبة من عاد في كل أسبوع", "Weekly cohorts of new users and the share who came back each week"), chart: coh }),
      panel({ id: "en-steps", title: t("الحفظ والتخطيط والإجراءات", "Saves, plans and actions"), chart: steps }),
      panel({ id: "en-search", title: t("أكثر ما يبحثون عنه", "Top searches"), chart: searches }),
      panel({ id: "en-assist", title: t("موضوعات أسئلة المساعد", "What people ask the Assistant"), sub: t("حسب فئات بنك نوايا المساعد في التطبيق (" + num(M.C.assistant.intents) + " نية)", "By the app Assistant's intent categories (" + num(M.C.assistant.intents) + " intents)"), demo: true, chart: assist, note: t("نسبة الأسئلة التي أُجيبت دون الحاجة إلى توضيح: ", "Questions answered without a clarifying question: ") + pct(0.912) }),
      panel({ id: "en-plan", title: t("حالات عناصر خطتي", "My Plan item states"), sub: t("بأسماء الحالات في التطبيق", "Using the app's state names"), demo: true, chart: plan }),
    );
  };

  /* ═════════ 4. Experiences and activities ═════════ */
  const TYPE_ORDER = ["experience", "event", "activity", "recurring"];
  P.experiences = function () {
    const c = ctx(), { cur, prev, r, f } = c, vs = vsName(c);
    const rows = M.objectRows(f, r.d0, r.d1).filter((x) => M.EXP_TYPES.has(x.ob.o.type));
    const rowsP = M.objectRows(f, r.p0, r.p1).filter((x) => M.EXP_TYPES.has(x.ob.o.type));
    const s = (rs, k) => rs.reduce((a, x) => a + x[k], 0);
    const views = cur.tot[X.VT], acts = cur.tot[X.XT], bk = s(rows, "bookings"), gmv = s(rows, "gmv");
    const capped = M.OBJS.filter((ob) => ob.o.cap && M.EXP_TYPES.has(ob.o.type) && (state.category === "all" || M.CATS[ob.c].id === state.category) && (state.area === "all" || M.ZONES[ob.z].id === state.area));
    const fill = capped.length ? capped.reduce((a, ob) => a + ob.o.joined / ob.o.cap, 0) / capped.length : 0;
    const comp = s(rows, "plans") ? s(rows, "completes") / s(rows, "plans") : 0, compP = s(rowsP, "plans") ? s(rowsP, "completes") / s(rowsP, "plans") : 0;
    const tiles = [
      kpi({ label: t("مشاهدات التجارب والأنشطة", "Experience and activity views"), value: compact(views), delta: delta(views, prev.tot[X.VT]), vs, spark: bsum(dayArr(cur, X.VT), c.B, r.d0) }),
      kpi({ id: "exp-actions", raw: acts, label: t("انضمام وتسجيل وحجز", "Joins, registrations and bookings"), value: compact(acts), delta: delta(acts, prev.tot[X.XT]), vs, spark: bsum(dayArr(cur, X.XT), c.B, r.d0) }),
      kpi({ label: t("حجوزات مؤكدة", "Confirmed bookings"), value: compact(bk), delta: delta(bk, s(rowsP, "bookings")), vs, demo: true, foot: t("للتجارب المدفوعة التوضيحية", "Paid illustrative experiences") }),
      kpi({ label: t("قيمة الحجوزات", "Booking value"), value: sar(gmv), delta: delta(gmv, s(rowsP, "gmv")), vs, demo: true, color: CH.S[2] }),
      kpi({ label: t("إكمال المخطط له", "Planned and completed"), value: pct(comp), delta: delta(comp, compP), vs }),
      kpi({ label: t("متوسط الإشغال", "Average fill"), value: pct(fill, 0), foot: t("من أعداد المقاعد في التطبيق", "From the app's places and sign-ups") }),
    ];
    if (!rows.length || !views) return kpis(tiles) + empty(t("لا توجد تجارب أو أنشطة ضمن هذه الفلاتر.", "No experiences or activities match these filters."));
    const typeName = (ty) => L(M.C.typeLabels[ty]);
    const top = rows.slice().sort((a, b) => b.views - a.views);
    const pts = top.slice(0, 32).map((x) => ({ name: L(x.ob.o.name), short: L(x.ob.o.name).split(/ — | - |: /)[0].slice(0, 26), x: x.views, y: x.views ? x.actions / x.views : 0, s: x.actions, color: x.byA[1] > x.byA[0] ? CH.AUD.visitor : CH.AUD.resident }));
    const bub = CH.bubble(pts, { xName: t("مشاهدات", "Views"), yName: t("معدل الإجراء", "Action rate"), sName: t("إجراءات", "Actions"), legend: [{ name: t("أغلب جمهوره من السكان", "Mostly residents"), color: CH.AUD.resident }, { name: t("أغلب جمهوره من الزوار", "Mostly visitors"), color: CH.AUD.visitor }],
      quads: [t("اهتمام عالٍ وتحويل عالٍ", "High interest, high conversion"), t("تحويل عالٍ واهتمام أقل", "High conversion, less interest"), t("اهتمام عالٍ وتحويل أقل", "High interest, lower conversion")] });
    const price = (ob) => (ob.o.price == null ? t("عبر المنظّم", "With the organiser") : ob.o.price === 0 ? t("مجاني", "Free") : sar(ob.o.price));
    const tblRows = top.slice(0, 14).map((x) => ({
      cells: [L(x.ob.o.name), typeName(x.ob.o.type), zoneName(M.ZONES[x.ob.z].id), x.views, x.actions, pct(x.views ? x.actions / x.views : 0), x.ob.o.cap ? pct(x.ob.o.joined / x.ob.o.cap, 0) : "—", price(x.ob)],
      raw: [0, 0, 0, x.views], html: { 3: compact(x.views), 4: compact(x.actions), 6: x.ob.o.cap ? CH.meter(x.ob.o.joined / x.ob.o.cap) + " " + esc(pct(x.ob.o.joined / x.ob.o.cap, 0)) : "—" },
    }));
    const tb = CH.table([t("التجربة أو النشاط", "Experience or activity"), t("النوع", "Type"), t("المنطقة", "Area"), t("مشاهدات", "Views"), t("إجراءات", "Actions"), t("التحويل", "Conversion"), t("الإشغال", "Fill"), t("السعر في التطبيق", "Price in the app")], tblRows, { num: [3, 4, 5], barCol: 3 });
    const byType = CH.columns(TYPE_ORDER.map(typeName), AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: TYPE_ORDER.map((ty) => rows.filter((x) => x.ob.o.type === ty).reduce((s2, x) => s2 + x.actA[a.key], 0)) })), { stack: true, fmt: compact, labelCol: t("النوع", "Type") });
    const days = []; const xt = dayArr(cur, X.XT);
    for (let d = r.d0; d <= r.d1; d++) days.push({ dow: M.DOW[d], value: xt[d - r.d0], label: B.dateLong(d) });
    const cal = CH.calendar(days, { fmt: compact, name: t("إجراءات", "Actions") });
    const fillRows = capped.map((ob) => ({ label: L(ob.o.name), value: ob.o.joined / ob.o.cap, tail: " · " + num(ob.o.joined) + "/" + num(ob.o.cap), color: ob.o.joined / ob.o.cap >= 0.68 ? "#ec835a" : CH.S[0] })).sort((a, b) => b.value - a.value).slice(0, 10);
    const fillC = CH.hbars(fillRows, { fmt: (v) => pct(v, 0), max: 1, name: t("الإشغال", "Fill"), labelCol: t("النشاط", "Activity") });
    const catA = M.CATS.map((cat) => ({ label: L(cat.name), value: rows.filter((x) => x.ob.o.cat === cat.id).reduce((a, x) => a + x.actions, 0) })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
    const cats = CH.hbars(catA, { fmt: compact, name: t("إجراءات", "Actions"), labelCol: t("الفئة", "Category") });
    const best = top.slice(0, 20).sort((a, b) => b.actions / b.views - a.actions / a.views)[0];
    return kpis(tiles) + grid(
      panel({ id: "ex-bubble", span: 2, title: t("الاهتمام مقابل التحويل", "Interest against conversion"), sub: t("كل دائرة تجربة أو نشاط؛ حجمها بعدد الإجراءات", "Each circle is an experience or activity, sized by its actions"), chart: bub }),
      panel({ id: "ex-ins", title: t("أبرز ما تقوله البيانات", "What the data says"), html: insights([
        { icon: "ticket", title: t("الأكثر مشاهدة", "Most viewed"), text: L(top[0].ob.o.name) + t(" بـ", " with ") + compact(top[0].views) + t(" مشاهدة.", " views.") },
        best ? { icon: "up", title: t("أفضل تحويل", "Best conversion"), text: L(best.ob.o.name) + t(" يحوّل ", " converts ") + pct(best.actions / best.views) + t(" من المشاهدات إلى إجراء.", " of views into an action.") } : null,
        fillRows[0] ? { icon: "users", title: t("قارب الاكتمال", "Nearly full"), text: fillRows[0].label + t(" مكتمل بنسبة ", " is ") + pct(fillRows[0].value, 0) + t(".", " full.") } : null]) }),
      panel({ id: "ex-table", span: 2, title: t("أداء التجارب والأنشطة", "Experience and activity performance"), sub: t("الأعلى مشاهدة ضمن الفلاتر", "The most viewed under the filters"), chart: tb }),
      panel({ id: "ex-type", title: t("الإجراءات حسب النوع", "Actions by type"), chart: byType }),
      panel({ id: "ex-cal", span: 2, title: t("الإجراءات يومًا بيوم", "Actions day by day"), sub: t("انضمام وتسجيل وحجز على التجارب والأنشطة", "Joins, registrations and bookings on experiences and activities"), chart: cal }),
      panel({ id: "ex-fill", title: t("الإشغال الحالي", "How full they are"), sub: t("من أعداد المقاعد والمسجلين في التطبيق اليوم", "From the app's places and sign-ups today"), chart: fillC }),
      panel({ id: "ex-cat", title: t("الإجراءات حسب الفئة", "Actions by category"), chart: cats }),
    );
  };

  /* ═════════ 5. The Market ═════════ */
  P.market = function () {
    const c = ctx(), { cur, prev, r, f } = c, vs = vsName(c);
    const pr = M.productAgg(f, r.d0, r.d1), prp = M.productAgg(f, r.p0, r.p1);
    const svc = cur.tot[X.SR], svcP = prev.tot[X.SR], exA = cur.tot[X.EX], exP = prev.tot[X.EX];
    const total = pr.tot.requests + svc, totalP = prp.tot.requests + svcP;
    const tiles = [
      kpi({ id: "market", raw: total, label: t("طلبات السوق", "Market requests"), value: compact(total), delta: delta(total, totalP), vs, foot: t("منتجات وخدمات", "Products and services") }),
      kpi({ label: t("طلبات المنتجات", "Product requests"), value: compact(pr.tot.requests), delta: delta(pr.tot.requests, prp.tot.requests), vs, spark: bsum(pr.byD, c.B, r.d0), color: CH.S[3] }),
      kpi({ label: t("قيمة طلبات المنتجات", "Product request value"), value: sar(pr.tot.gmv), delta: delta(pr.tot.gmv, prp.tot.gmv), vs, demo: true, color: CH.S[3] }),
      kpi({ label: t("متوسط قيمة الطلب", "Average request value"), value: sar(pr.tot.requests ? pr.tot.gmv / pr.tot.requests : 0), demo: true }),
      kpi({ label: t("طلبات الخدمات", "Service requests"), value: compact(svc), delta: delta(svc, svcP), vs, spark: bsum(dayArr(cur, X.SR), c.B, r.d0), color: CH.S[4] }),
      kpi({ label: t("حجوزات التجارب في السوق", "Market experience bookings"), value: compact(exA), delta: delta(exA, exP), vs, color: CH.S[2] }),
    ];
    if (!(total + exA)) return kpis(tiles) + empty(t("لا توجد طلبات ضمن هذه الفلاتر.", "No requests match these filters."));
    const series = [{ name: t("التجارب", "Experiences"), color: CH.S[2], values: bsum(dayArr(cur, X.EX), c.B, r.d0) }, { name: t("المنتجات", "Products"), color: CH.S[3], values: bsum(pr.byD, c.B, r.d0) }, { name: t("الخدمات", "Services"), color: CH.S[4], values: bsum(dayArr(cur, X.SR), c.B, r.d0) }];
    const trend = CH.trend(series, c.B.map((b) => blabel(b, r.gran)), { stack: true, fmt: compact, bands: bands(c.B) });
    const pcat = M.C.productCats, pcol = Object.fromEntries(pcat.map((pc, i) => [pc.id, CH.S[2 + i]]));
    const tm = CH.treemap(pr.rows.filter((x) => x.gmv > 0).map((x) => ({ name: L(x.p.name), value: x.gmv, color: pcol[x.p.cat], rows: [[null, t("طلبات", "Requests"), num(x.requests)]] })), { fmt: sar, legend: pcat.map((pc) => ({ name: L(pc.name), color: pcol[pc.id] })), name: t("قيمة الطلبات", "Request value") });
    const prodT = CH.table([t("المنتج", "Product"), t("الفئة", "Category"), t("السعر التجريبي", "Demo price"), t("مشاهدات", "Views"), t("طلبات", "Requests"), t("التحويل", "Conversion"), t("القطع", "Units"), t("القيمة", "Value")],
      pr.rows.slice().sort((a, b) => b.gmv - a.gmv).map((x) => ({ cells: [L(x.p.name), L(pcat.find((pc) => pc.id === x.p.cat).name), sar(x.p.price), x.views, x.requests, pct(x.views ? x.requests / x.views : 0), x.units, sar(x.gmv)], raw: [0, 0, 0, 0, x.requests], html: { 3: compact(x.views), 4: compact(x.requests), 6: compact(x.units) } })), { num: [2, 3, 4, 5, 6, 7], barCol: 4 });
    const mvis = tabSessions(M.cubeAgg({ ...f, category: "all" }, r.d0, r.d1), r.d0, r.d1).market;
    const fn = CH.funnel([{ name: t("زيارات قسم السوق", "Market visits"), value: mvis }, { name: t("مشاهدات المنتجات", "Product views"), value: pr.tot.views }, { name: t("طلبات المنتجات", "Product requests"), value: pr.tot.requests }], { fmt: compact });
    const svcRows = M.objectRows(f, r.d0, r.d1).filter((x) => x.ob.marketKind === "service").sort((a, b) => b.actions - a.actions).slice(0, 10);
    const svcC = CH.hbars(svcRows.map((x) => ({ label: L(x.ob.o.name), value: x.actions, sub: L(M.C.typeLabels[x.ob.o.type]) + " · " + zoneName(M.ZONES[x.ob.z].id) })), { fmt: compact, color: CH.S[4], name: t("طلبات", "Requests"), labelCol: t("الخدمة", "Service") });
    const status = CH.donut([{ name: t("طلب مسجّل", "Request recorded"), color: CH.S[0], value: total * 0.842 }, { name: t("طُلب مرة أخرى وحُدّث", "Requested again and updated"), color: CH.S[4], value: total * 0.09 }, { name: t("سُحب الطلب", "Withdrawn"), color: CH.S[3], value: total * 0.068 }], { fmt: compact, aria: t("حالة الطلبات", "Request status") });
    const audCat = CH.hbars(pcat.map((pc) => ({ label: L(pc.name), value: pr.rows.filter((x) => x.p.cat === pc.id).reduce((a, x) => a + x.requests, 0), parts: AUD_SERIES().map((a) => ({ name: a.name, color: a.color, value: pr.rows.filter((x) => x.p.cat === pc.id).reduce((s2, x) => s2 + x.byA[a.key], 0) })) })).filter((x) => x.value > 0), { fmt: compact, legend: AUD_SERIES().length > 1 ? AUD_SERIES() : null, name: t("طلبات", "Requests") });
    const pre = r.d1 < M.LAUNCH.market ? '<div class="notice">' + icon("info", 16) + esc(t("افتُتح قسم المنتجات في ١ فبراير ٢٠٢٦؛ لا توجد طلبات منتجات قبل ذلك.", "Products opened on 1 February 2026; there are no product requests before then.")) + "</div>" : "";
    return '<div class="notice">' + icon("info", 16) + "<span>" + esc(t("الطلبات في التطبيق تُحفظ على جهاز المستخدم ولا تُرسل لأي بائع. الأسعار والقيم هنا تجريبية.", "In the app, requests are saved on the person's device and never sent to a seller. Prices and values here are demo figures.")) + "</span></div>" + pre + kpis(tiles) + grid(
      panel({ id: "mk-trend", span: 2, title: t("الطلبات حسب النوع", "Requests by kind"), sub: t("تجارب، منتجات، خدمات", "Experiences, products, services"), chart: trend }),
      panel({ id: "mk-funnel", title: t("من الزيارة إلى الطلب", "From visit to request"), sub: t("المنتجات", "Products"), chart: fn }),
      panel({ id: "mk-tree", span: 2, title: t("قيمة طلبات المنتجات", "Product request value"), demo: "money", sub: t("حسب المنتج وفئته، بأسعار التطبيق التجريبية", "By product and category, at the app's demo prices"), chart: tm }),
      panel({ id: "mk-status", title: t("حالة الطلبات في «طلباتي»", "Request status in My requests"), demo: true, chart: status }),
      panel({ id: "mk-products", span: 2, title: t("المنتجات", "Products"), sub: t("المنتجات العشرة في السوق", "The Market's ten products"), demo: "money", chart: prodT }),
      panel({ id: "mk-aud", title: t("من يطلب ماذا", "Who requests what"), sub: t("طلبات المنتجات حسب الفئة والجمهور", "Product requests by category and audience"), chart: audCat }),
      panel({ id: "mk-services", span: 2, title: t("أكثر الخدمات طلبًا", "Most requested services"), sub: t("الخدمات والإقامة والضيافة المدينية", "Services, stays and Madani hospitality"), chart: svcC }),
    );
  };

  /* ═════════ 6. City Opportunities (no money values of any kind) ═════════ */
  P.city = function () {
    const c = ctx(), { r, f } = c, vs = vsName(c);
    const ca = M.cityAgg(f, r.d0, r.d1), cp = M.cityAgg(f, r.p0, r.p1);
    const homes = ca.rows.filter((x) => x.it.kind === "home"), opps = ca.rows.filter((x) => x.it.kind === "opp");
    const s = (rs, k) => rs.reduce((a, x) => a + x[k], 0);
    const hReq = s(homes, "requests"), oReq = s(opps, "requests"), hReqP = s(cp.rows.filter((x) => x.it.kind === "home"), "requests"), oReqP = s(cp.rows.filter((x) => x.it.kind === "opp"), "requests");
    const views = s(ca.rows, "views"), viewsP = s(cp.rows, "views");
    const chipTot = ca.chips.reduce((a, v) => a + v, 0);
    const listed = new Set(homes.map((x) => x.it.z));
    const unmet = M.ZONES.slice(0, M.HOMEZ).map((z, i) => ({ z, i, v: ca.chips[i] })).filter((x) => !listed.has(x.i) && x.v > 0).sort((a, b) => b.v - a.v);
    const visH = s(homes, "views") ? homes.reduce((a, x) => a + x.viewsA[1], 0) / s(homes, "views") : 0;
    const tiles = [
      kpi({ label: t("مشاهدات الإعلانات والفرص", "Listing and opportunity views"), value: compact(views), delta: delta(views, viewsP), vs }),
      kpi({ label: t("طلبات تفاصيل المساكن", "Home details requests"), value: compact(hReq), delta: delta(hReq, hReqP), vs, spark: bsum(ca.byD.home, c.B, r.d0) }),
      kpi({ label: t("تسجيلات الاهتمام", "Registered interest"), value: compact(oReq), delta: delta(oReq, oReqP), vs, spark: bsum(ca.byD.opp, c.B, r.d0), color: CH.S[1] }),
      kpi({ label: t("معدل الطلب", "Request rate"), value: pct(views ? (hReq + oReq) / views : 0), foot: t("من مشاهدات العناصر", "Of item views") }),
      kpi({ label: t("مناطق بُحث عنها دون إعلان", "Areas searched with no listing"), value: num(unmet.length), foot: t("من ١٥ منطقة", "Of 15 areas") }),
      kpi({ label: t("حصة الزوار من مشاهدات المساكن", "Visitors' share of home views"), value: pct(visH) }),
    ];
    const rule = '<div class="notice">' + icon("info", 16) + "<span>" + esc(t(CT.opps.ar + " دليل تعريفي: لا تعرض هذه اللوحة أسعارًا أو مبالغ استثمار أو عوائد أو تقييمات أو ترتيبًا للفرص، وليست استشارة استثمارية. تظهر الفرص بترتيبها في التطبيق.", CT.opps.en + " is an information directory: this dashboard shows no prices, investment amounts, returns, ratings or rankings, and is not investment advice. Opportunities appear in the app's own order.")) + "</span></div>";
    if (r.d1 < M.LAUNCH.city) return rule + kpis(tiles) + empty(t("افتُتح قسم " + CT.opps.ar + " في ١ مايو ٢٠٢٦؛ لا توجد بيانات لهذه الفترة.", CT.opps.en + " opened on 1 May 2026; there is no data for this period."));
    if (!views) return rule + kpis(tiles) + empty(t("لا توجد بيانات لهذه الفلاتر.", "There is no data for these filters."));
    const deal = (id) => L(M.C.homeDeals.find((d) => d.id === id).name);
    const hc = CH.columns(homes.map((x) => L(x.it.name).split(" — ")[0] + " · " + zoneName(M.ZONES[x.it.z].id)), AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: homes.map((x) => x.byA[a.key]) })), { fmt: compact, labelCol: t("المسكن", "Home") });
    const oc = CH.hbars(opps.map((x) => ({ label: L(x.it.name), sub: L(M.C.oppCats.find((k) => k.id === x.it.cat).name) + " · " + zoneName(M.ZONES[x.it.z].id), value: x.requests, parts: AUD_SERIES().map((a) => ({ name: a.name, color: a.color, value: x.byA[a.key] })) })), { fmt: compact, legend: AUD_SERIES().length > 1 ? AUD_SERIES() : null, name: t("تسجيلات اهتمام", "Interest registrations"), labelCol: t("الفرصة", "Opportunity") });
    const secV = s(opps, "views") * 1.6;
    const ofn = CH.funnel([{ name: t("زيارات «" + CT.invest.ar + "»", CT.invest.en + " visits"), value: secV }, { name: t("استكشاف فرصة", "Explored an opportunity"), value: s(opps, "views") }, { name: t("سجّلوا اهتمامهم", "Registered interest"), value: oReq }], { fmt: compact, colors: [CH.ramp(0.45, CH.SEQ_B), CH.ramp(0.7, CH.SEQ_B), CH.ramp(0.95, CH.SEQ_B)] });
    const demand = CH.districtMap(mapSites((i) => ca.chips[i], { extra: (i) => [[null, listed.has(i) ? t("فيه إعلان تجريبي", "Has a demo listing") : t("لا يوجد إعلان", "No listing"), ""]] }).map((sx) => ({ ...sx, label: compact(sx.value) + (listed.has(M.ZI[sx.id]) ? " ●" : "") })), { allPoints: allPoints(), fmt: compact, ramp: CH.SEQ_B, center: MOSQUE(), selected: state.area !== "all" ? state.area : null, name: t("اختيار المنطقة", "Area chosen") });
    const tr = CH.trend([{ name: t("طلبات تفاصيل المساكن", "Home details requests"), color: CH.S[0], values: bsum(ca.byD.home, c.B, r.d0) }, { name: t("تسجيلات الاهتمام", "Interest registrations"), color: CH.S[1], values: bsum(ca.byD.opp, c.B, r.d0) }], c.B.map((b) => blabel(b, r.gran)), { fmt: compact, narrow: true });
    const dl = CH.donut(M.C.homeDeals.map((d, i) => ({ name: L(d.name), color: CH.S[2 + i], value: homes.filter((x) => x.it.deal === d.id).reduce((a, x) => a + x.requests, 0) })), { fmt: compact, centerLabel: t("طلب", "requests") });
    return rule + kpis(tiles) + grid(
      panel({ id: "ci-homes", span: 2, title: t(CT.live.ar + " — طلبات التفاصيل", CT.live.en + " — details requests"), sub: t("المساكن المعروضة في التطبيق", "The homes listed in the app"), chart: hc }),
      panel({ id: "ci-deal", title: t("حسب نوع العرض", "By listing type"), sub: M.C.homeDeals.map((d) => L(d.name)).join(" · "), chart: dl }),
      panel({ id: "ci-demand", span: 2, title: t("أين يبحثون عن سكن", "Where people look for a home"), sub: t("اختيار المنطقة في «" + CT.live.ar + "» · ● منطقة فيها إعلان", "Area chosen in " + CT.live.en + " · ● area with a listing"), chart: demand, note: unmet.length ? t("أكثر المناطق طلبًا دون إعلان: ", "Most-searched areas with no listing: ") + unmet.slice(0, 3).map((x) => L(x.z.name)).join(t("، ", ", ")) + "." : "" }),
      B.stack(
        panel({ id: "ci-funnel", title: CX("invest"), sub: t("من الزيارة إلى تسجيل الاهتمام", "From visit to registered interest"), chart: ofn }),
        panel({ id: "ci-trend", title: t("الطلبات عبر الفترة", "Requests over the period"), chart: tr })),
      panel({ id: "ci-opps", span: 3, title: t("الاهتمام بالفرص التجارية", "Interest in business opportunities"), sub: t("بترتيب التطبيق، دون ترتيب حسب الأداء", "In the app's order, not ranked"), chart: oc }),
    );
  };
})();
