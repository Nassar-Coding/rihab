/* Rihab BI — dashboards, part 2: community, Visitor Centers and service quality, partners
   and operators, commercial performance, districts and the map, and reports. */
(function () {
  "use strict";
  const B = window.RuhBI, { M, CH, esc, state, t, L, num, compact, pct, sar, date, ctx, blabel, bsum, bavg, bands, delta, kpi, kpis, panel, insights, grid, empty, icon, zoneName } = B;
  const X = M.XM, MM = M.M, P = window.RuhPages;
  const RC = B.RC, CX = B.CX, CT = RC.terms;

  /* ═════════ 7. Community ═════════ */
  const TYPE_NAME = { question: ["أسئلة", "Questions"], recommendation: ["توصيات", "Recommendations"], tip: ["نصائح", "Tips"], update: ["تحديثات", "Updates"], experience_report: ["تجارب مكتوبة", "Experience reports"], photo: ["صور", "Photos"], post_story: ["قصص", "Stories"] };
  P.community = function () {
    const c = ctx(), { r, f } = c, vs = c.prevName;
    const cm = M.communityAgg(f, r.d0, r.d1), cp = M.communityAgg(f, r.p0, r.p1);
    const s = (rs, k) => rs.reduce((a, x) => a + x[k], 0);
    const posts = s(cm.rows, "posts"), postsP = s(cp.rows, "posts"), q = s(cm.rows, "questions"), qP = s(cp.rows, "questions");
    const ans = s(cm.rows, "answers"), ansP = s(cp.rows, "answers");
    const answered = q ? Math.min(0.97, 1 - Math.exp(-ans / q * 1.35)) : 0, answeredP = qP ? Math.min(0.97, 1 - Math.exp(-ansP / qP * 1.35)) : 0;
    const visShare = posts ? s(cm.rows.map((x) => ({ v: x.postsA[1] })), "v") / posts : 0;
    const firstAnswer = 3.1 + 2.4 * visShare + (r.p.id === "ramadan" ? -0.6 : 0);
    const tiles = [
      kpi({ id: "posts", raw: posts, label: t("المشاركات", "Posts"), value: compact(posts), delta: delta(posts, postsP), vs, spark: bsum(cm.byD[0].map((v, i) => v + cm.byD[1][i]), c.B, r.d0) }),
      kpi({ label: t("أسئلة مطروحة", "Questions asked"), value: compact(q), delta: delta(q, qP), vs }),
      kpi({ label: t("أسئلة نالت إجابة", "Questions answered"), value: pct(answered), delta: delta(answered, answeredP), vs }),
      kpi({ label: t("أول إجابة خلال", "First answer within"), value: num(firstAnswer, 1) + t(" ساعة", " h"), foot: t("الوسيط", "Median"), demo: true, inverse: true }),
      kpi({ label: t("أعضاء جدد", "New members"), value: compact(s(cm.rows, "joins")), delta: delta(s(cm.rows, "joins"), s(cp.rows, "joins")), vs }),
      kpi({ label: t("تصويتات «مفيد»", "Helpful votes"), value: compact(s(cm.rows, "helpful")), delta: delta(s(cm.rows, "helpful"), s(cp.rows, "helpful")), vs }),
    ];
    if (!posts) return kpis(tiles) + empty(t("لا توجد مشاركات ضمن هذه الفلاتر.", "No posts match these filters."));
    const tr = CH.trend(B.AUD_SERIES().map((a) => ({ name: a.name, color: a.color, values: bsum(cm.byD[a.key], c.B, r.d0) })), c.B.map((b) => blabel(b, r.gran)), { stack: true, fmt: compact, bands: bands(c.B) });
    const mix = {};
    Object.keys(TYPE_NAME).forEach((k) => (mix[k] = 0));
    cm.rows.forEach((x) => [0, 1].forEach((a) => Object.entries(M.POST_MIX[a]).forEach(([k, v]) => (mix[k] += x.postsA[a] * v))));
    const order = ["recommendation", "question", "experience_report", "tip", "update"];
    const segs = order.map((k, i) => ({ name: t(TYPE_NAME[k][0], TYPE_NAME[k][1]), color: CH.S[i], value: mix[k] })).concat([{ name: t("صور وقصص", "Photos and stories"), color: CH.S[5], value: mix.photo + mix.post_story }]);
    const types = CH.donut(segs, { fmt: compact, aria: t("أنواع المشاركات", "Kinds of posts") });
    const top = cm.rows.slice().sort((a, b) => b.posts - a.posts).slice(0, 12);
    const fam = (id) => L(M.C.families.find((x) => x.id === id).name);
    const tb = CH.table([t("المجتمع", "Community"), t("المجموعة", "Family"), t("الأعضاء", "Members"), t("مشاركات", "Posts"), t("أسئلة", "Questions"), t("إجابات", "Answers"), t("أعضاء جدد", "New members")],
      top.map((x) => ({ cells: [L(x.cm.name), fam(x.cm.family), x.cm.members, x.posts, x.questions, x.answers, x.joins], raw: [0, 0, 0, x.posts], html: { 2: compact(x.cm.members), 3: compact(x.posts) } })), { num: [2, 3, 4, 5, 6], barCol: 3 });
    const allF = { ...f, area: "all" }, ca = M.communityAgg(allF, r.d0, r.d1);
    const hoodPosts = M.ZONES.slice(0, M.HOMEZ).map((z) => ca.rows.filter((x) => x.cm.nb === z.id).reduce((a, x) => a + x.posts, 0));
    const map = CH.districtMap(P.mapSites((i) => hoodPosts[i]), { allPoints: P.allPoints(), fmt: compact, selected: state.area !== "all" ? state.area : null, center: P.MOSQUE(), name: t("مشاركات مجتمع الحي", "Neighbourhood community posts") });
    const fams = M.C.families.map((fm) => {
      const rs = cm.rows.filter((x) => x.cm.family === fm.id);
      return { fm, rs, posts: rs.reduce((a, x) => a + x.posts, 0), q: rs.reduce((a, x) => a + x.questions, 0), an: rs.reduce((a, x) => a + x.answers, 0) };
    }).filter((x) => x.posts > 0).sort((a, b) => b.posts - a.posts);
    const famMul = CH.multiples(fams.map((x) => ({ name: L(x.fm.name), value: x.posts, values: bsum(cm.byFam[x.fm.id], c.B, r.d0), color: CH.S[0], sub: num(x.rs.length) + t(" مجتمعات", " communities") })), { name: t("مشاركات", "Posts") });
    const qa = CH.hbars(fams.filter((x) => x.q > 0).map((x) => ({ label: L(x.fm.name), value: x.an / x.q, sub: compact(x.q) + t(" سؤال", " questions") })).sort((a, b) => b.value - a.value), { fmt: (v) => num(v, 1), color: CH.S[0], name: t("إجابات لكل سؤال", "Answers per question"), labelCol: t("المجموعة", "Family") });
    const clubs = CH.hbars(M.C.clubs.map((cl) => ({ label: L(cl.name), value: cl.members })).sort((a, b) => b.value - a.value), { fmt: num, color: CH.S[0], name: t("أعضاء", "Members"), labelCol: t("النادي", "Club") });
    return kpis(tiles) + grid(
      panel({ id: "co-trend", span: 2, title: t("المشاركات عبر الفترة", "Posts over the period"), sub: t("السكان والزوار", "Residents and visitors"), chart: tr }),
      panel({ id: "co-types", title: t("أنواع المشاركات", "Kinds of posts"), sub: t("بأنواع المساهمات في التطبيق", "Using the app's contribution types"), chart: types }),
      panel({ id: "co-top", span: 2, title: t("المجتمعات الأكثر نشاطًا", "Most active communities"), sub: t("أعداد الأعضاء من التطبيق", "Member counts from the app"), chart: tb }),
      panel({ id: "co-ins", title: t("أبرز ما تقوله البيانات", "What the data says"), html: insights([
        { icon: "chat", title: t("الأكثر نشاطًا", "Most active"), text: L(top[0].cm.name) + t(" بـ", " with ") + compact(top[0].posts) + t(" مشاركة.", " posts.") },
        { icon: "users", title: t("الزوار يسألون", "Visitors ask"), text: t("الزوار يكتبون ", "Visitors write ") + pct(visShare) + t(" من المشاركات، وأغلبها أسئلة يجيب عنها السكان.", " of posts, mostly questions that residents answer.") },
        { icon: "clock", title: t("سرعة الإجابة", "Answer speed"), text: pct(answered) + t(" من الأسئلة نالت إجابة، وأول إجابة تصل خلال ", " of questions were answered; the first answer arrives within ") + num(firstAnswer, 1) + t(" ساعة في الوسيط.", " hours (median).") }]) }),
      panel({ id: "co-map", span: 2, title: t("مجتمعات الأحياء", "Neighbourhood communities"), sub: t("مشاركات مجتمع كل حي", "Posts in each district's community"), chart: map }),
      panel({ id: "co-clubs", title: t("الأندية", "Clubs"), sub: t("أعداد الأعضاء في التطبيق اليوم", "Member counts in the app today"), chart: clubs }),
      panel({ id: "co-fam", span: 2, title: t("مجموعات المجتمعات", "Community families"), sub: t("المشاركات عبر الفترة لكل مجموعة", "Posts over the period, per family"), chart: famMul }),
      panel({ id: "co-qa", title: t("إجابات لكل سؤال", "Answers per question"), sub: t("حسب مجموعة المجتمعات", "By community family"), chart: qa }),
    );
  };

  /* ═════════ 8. Visitor Centers and service quality (all demo) ═════════ */
  P.centers = function () {
    const c = ctx(), { r, f } = c, vs = c.prevName;
    const vc = M.centerAgg(f, r.d0, r.d1), vp = M.centerAgg(f, r.p0, r.p1), T = vc.tot, Tp = vp.tot;
    const ratio = (a, b) => (b ? a / b : 0);
    const served = T[0], wait = ratio(T[1], T[0]), sla = ratio(T[6], T[0]), csat = ratio(T[4], T[3]), fcr = ratio(T[5], T[0]);
    const nps = Math.round((csat - 3.2) / 1.8 * 100 - 22);
    const tiles = [
      kpi({ id: "served", raw: served, label: t("زوار خُدموا", "Visitors served"), value: compact(served), delta: delta(served, Tp[0]), vs, spark: bsum(vc.byD[0], c.B, r.d0), demo: true }),
      kpi({ label: t("متوسط الانتظار", "Average wait"), value: num(wait, 1) + t(" د", " min"), delta: delta(wait, ratio(Tp[1], Tp[0])), vs, inverse: true, demo: true }),
      kpi({ label: t("خُدموا خلال ١٠ دقائق", "Served within 10 minutes"), value: pct(sla), delta: delta(sla, ratio(Tp[6], Tp[0])), vs, demo: true }),
      kpi({ label: t("رضا الزوار", "Satisfaction"), value: num(csat, 2) + t(" من ٥", " / 5"), delta: delta(csat, ratio(Tp[4], Tp[3])), vs, demo: true }),
      kpi({ label: t("حُلّت من أول تواصل", "Solved at first contact"), value: pct(fcr), delta: delta(fcr, ratio(Tp[5], Tp[0])), vs, demo: true }),
      kpi({ label: t("صافي نقاط الترويج", "Net Promoter Score"), value: (nps > 0 ? "+" : "") + num(nps), demo: true }),
    ];
    const note = '<div class="notice">' + icon("info", 16) + "<span>" + esc(t("مراكز الزوار ونقاطها في هذه اللوحة أمثلة توضيحية، وكل أرقامها تجريبية: لا يوجد في التطبيق مراكز زوار تشغيلية.", "The Visitor Centers and points on this dashboard are illustrative, and all their figures are demo data: the app runs no Visitor Centers.")) + "</span> " + B.DEMO() + "</div>";
    if (!served) return note + kpis(tiles) + empty(t("لا يوجد مركز زوار في هذه المنطقة.", "There is no Visitor Center in this area."));
    const tr = CH.trend([{ name: t("زوار خُدموا", "Visitors served"), color: CH.S[1], values: bsum(vc.byD[0], c.B, r.d0) }], c.B.map((b) => blabel(b, r.gran)), { area: true, fmt: compact, bands: bands(c.B) });
    const g1 = CH.gauge(csat, { min: 1, max: 5, label: num(csat, 2), minLabel: num(1), maxLabel: num(5), bands: [[1, 3.5, "#F4D9D9"], [3.5, 4.2, "#FBEBC8"], [4.2, 5, "#D6EEDD"]], caption: t("متوسط التقييم من ٥", "Average rating out of 5"), aria: t("رضا الزوار", "Satisfaction") });
    const g2 = CH.gauge(sla, { min: 0, max: 1, label: pct(sla, 0), minLabel: pct(0, 0), maxLabel: pct(1, 0), bands: [[0, 0.8, "#F4D9D9"], [0.8, 0.9, "#FBEBC8"], [0.9, 1, "#D6EEDD"]], color: CH.S[1], caption: t("الهدف: ٩٠٪ خلال ١٠ دقائق", "Goal: 90% within 10 minutes"), aria: t("خُدموا خلال ١٠ دقائق", "Served within 10 minutes") });
    const rows = vc.rows.map((x) => ({ ce: x.ce, served: x.v[0], wait: ratio(x.v[1], x.v[0]), sla: ratio(x.v[6], x.v[0]), csat: ratio(x.v[4], x.v[3]), fcr: ratio(x.v[5], x.v[0]), esc: x.v[7] }));
    const dp = CH.dotplot(rows.slice().sort((a, b) => b.wait - a.wait).map((x) => ({ label: L(x.ce.name), value: x.wait, note: t("دقيقة انتظار", "minutes' wait") })), { threshold: 10, thresholdName: t("هدف الانتظار: ١٠ دقائق", "Wait goal: 10 minutes"), fmt: (v) => num(v, 1) + t(" د", " min"), flag: t("فوق الهدف", "Over the goal") });
    /* centre load by hour: busiest after the dawn and evening prayers */
    const HP = [0, 0, 0, 0, 0, 0.6, 1.4, 1.9, 2.1, 1.9, 1.6, 1.2, 0.7, 0.9, 1.1, 1.0, 1.3, 1.6, 1.2, 1.5, 1.9, 1.7, 0.9, 0];
    const hs = HP.reduce((a, v) => a + v, 0);
    const mat = Array.from({ length: 7 }, () => new Float64Array(24));
    for (let d = r.d0; d <= r.d1; d++) { const v = vc.byD[0][d - r.d0]; for (let h = 0; h < 24; h++) mat[M.DOW[d]][h] += v * HP[h] / hs * (M.DOW[d] === 5 && h >= 11 && h <= 13 ? 0.5 : 1); }
    const hrs = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const heat = CH.heatmap(mat.map((row) => hrs.map((h) => row[h])), B.weekdays(), hrs.map((h) => B.hours()[h]), { fmt: compact, colEvery: 2, ramp: CH.SEQ_B, unit: t("زوار", "visitors") });
    const visA = vc.rows.reduce((a, x) => a + x.byA[1], 0), resA = vc.rows.reduce((a, x) => a + x.byA[0], 0);
    const topics = CH.hbars(M.VC_TOPICS.map((tp) => ({ label: L(tp.name), value: resA * tp.mix[0] + visA * tp.mix[1], parts: B.AUD_SERIES().map((a) => ({ name: a.name, color: a.color, value: (a.key ? visA : resA) * tp.mix[a.key] })) })).sort((a, b) => b.value - a.value), { fmt: compact, legend: B.AUD_SERIES().length > 1 ? B.AUD_SERIES() : null, name: t("استفسارات", "Enquiries"), labelCol: t("الموضوع", "Topic") });
    const langs = M.VC_LANGS.slice(0, 5).map((lg, i) => ({ name: L(lg.name), color: CH.S[i], value: served * lg.share })).concat([{ name: t("لغات أخرى", "Other languages"), color: CH.S[5], value: served * M.VC_LANGS.slice(5).reduce((a, lg) => a + lg.share, 0) }]);
    const ld = CH.donut(langs, { fmt: compact, aria: t("لغات الخدمة", "Languages served") });
    const pts = [];
    vc.perDay.forEach((days, j) => { if (!vc.rows.find((x) => x.ce.i === j)) return; days.forEach((v, k) => { if (v[0]) pts.push({ name: L(M.CENTERS[j].name) + " · " + date(r.d0 + k), x: v[1] / v[0], y: v[4] / v[3] / 5, s: v[0], color: CH.S[1] }); }); });
    const sc = CH.bubble(pts.length > 220 ? pts.filter((_, i) => i % Math.ceil(pts.length / 220) === 0) : pts, { xName: t("دقائق الانتظار", "Minutes waited"), yName: t("الرضا (من ٥)", "Satisfaction (of 5)"), sName: t("زوار", "Visitors"), fx: (v) => num(v, 0), fy: (v) => num(v * 5, 1), ymin: 0.6, ymax: 1, xmin: Math.max(0, Math.floor(Math.min(...pts.map((p) => p.x))) - 1), labels: 0, rmax: 9, h: 300, wide: true });
    const tb = CH.table([t("المركز", "Centre"), t("خُدموا", "Served"), t("الانتظار", "Wait"), t("خلال ١٠ د", "Within 10 min"), t("الرضا", "Satisfaction"), t("من أول تواصل", "First contact"), t("تصعيد", "Escalated")],
      rows.map((x) => ({ cells: [L(x.ce.name), x.served, num(x.wait, 1), pct(x.sla), num(x.csat, 2), pct(x.fcr), x.esc], raw: [0, x.served], html: { 1: compact(x.served), 3: '<span class="st ' + (x.sla >= 0.9 ? "good" : x.sla >= 0.8 ? "warn" : "bad") + '">' + icon(x.sla >= 0.9 ? "check" : "alert", 13) + esc(pct(x.sla)) + "</span>" } })), { num: [1, 2, 3, 4, 5, 6], barCol: 1 });
    const svc = [
      [t("أسئلة أجاب عنها المساعد دون توضيح", "Assistant questions answered without clarifying"), 0.912, 0.85, true],
      [t("عمليات بحث انتهت بفتح نتيجة", "Searches that opened a result"), 0.784, 0.7, true],
      [t("جلسات بلا أعطال", "Crash-free sessions"), 0.9962, 0.995, true],
      [t("طلبات سُحبت بعد تسجيلها", "Requests withdrawn after recording"), 0.068, 0.1, false],
    ];
    const svcHtml = '<ul class="sl">' + svc.map((x) => { const ok = x[3] ? x[1] >= x[2] : x[1] <= x[2]; return '<li><span class="st ' + (ok ? "good" : "warn") + '">' + icon(ok ? "check" : "alert", 14) + esc(ok ? t("ضمن الهدف", "On target") : t("دون الهدف", "Below target")) + "</span><div><b>" + esc(pct(x[1], x[1] > 0.99 ? 2 : 1)) + "</b><span>" + esc(x[0]) + "</span><small>" + esc(t("الهدف ", "Target ") + (x[3] ? "≥ " : "≤ ") + pct(x[2], x[2] > 0.99 ? 1 : 0)) + "</small></div></li>"; }).join("") + "</ul>";
    return note + kpis(tiles) + grid(
      panel({ id: "vc-trend", span: 2, title: t("الزوار الذين خُدموا", "Visitors served"), demo: true, chart: tr }),
      panel({ id: "vc-g1", title: t("رضا الزوار", "Satisfaction"), demo: true, chart: g1 }),
      panel({ id: "vc-wait", span: 2, title: t("الانتظار في كل مركز", "Wait at each centre"), demo: true, sub: t("متوسط دقائق الانتظار مقابل الهدف", "Average minutes waited against the goal"), chart: dp }),
      panel({ id: "vc-g2", title: t("سرعة الخدمة", "Speed of service"), demo: true, chart: g2 }),
      panel({ id: "vc-heat", span: 2, title: t("أوقات الذروة", "Peak times"), demo: true, sub: t("زوار المراكز حسب اليوم والساعة", "Centre visitors by weekday and hour"), chart: heat }),
      panel({ id: "vc-lang", title: t("لغات الخدمة", "Languages served"), demo: true, chart: ld }),
      panel({ id: "vc-topics", span: 2, title: t("موضوعات الاستفسار", "What visitors ask about"), demo: true, chart: topics }),
      panel({ id: "vc-svc", title: t("جودة الخدمة الرقمية", "Digital service quality"), demo: true, sub: t("مؤشرات خدمة التطبيق", "App service levels"), html: svcHtml }),
      panel({ id: "vc-scatter", span: 3, title: t("الانتظار والرضا", "Waiting and satisfaction"), demo: true, sub: t("كل نقطة يوم في مركز؛ الرضا ينخفض كلما طال الانتظار", "Each point is a day at a centre; satisfaction falls as waits grow"), chart: sc }),
      panel({ id: "vc-table", span: 3, title: t("المراكز", "The centres"), demo: true, chart: tb }),
    );
  };

  /* ═════════ 9. Partners and operators ═════════ */
  P.partners = function () {
    const c = ctx(), { r, f } = c, vs = c.prevName;
    const objs = M.objectRows(f, r.d0, r.d1), objP = M.objectRows(f, r.p0, r.p1);
    const byObj = new Map(objs.map((x) => [x.ob.id, x])), byObjP = new Map(objP.map((x) => [x.ob.id, x]));
    const of = M.offerAgg(f, r.d0, r.d1), ofP = M.offerAgg(f, r.p0, r.p1);
    const red = new Map(of.rows.map((x) => [x.of.id, x]));
    const inF = (p) => (state.area === "all" || M.ZONES[p.z].id === state.area) && (state.category === "all" || M.CATS[p.c].id === state.category);
    const rows = M.PARTNERS.filter(inF).filter((p) => p.since <= r.d1).map((p) => {
      const o = p.objs.map((ob) => byObj.get(ob.id)).filter(Boolean), oP = p.objs.map((ob) => byObjP.get(ob.id)).filter(Boolean);
      const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
      return { p, views: sum(o, "views"), actions: sum(o, "actions"), bookings: sum(o, "bookings"), gmv: sum(o, "gmv"), actionsP: sum(oP, "actions"), redemptions: p.offers.reduce((a, x) => a + (red.get(x.id) ? red.get(x.id).red : 0), 0), liveOffers: p.offers.filter((x) => x.d0 <= r.d1 && x.d1 >= r.d0).length };
    });
    const active = rows.length, activeP = M.PARTNERS.filter(inF).filter((p) => p.since <= r.p1).length;
    const ops = rows.filter((x) => x.p.kind !== "community");
    const resp = ops.length ? ops.reduce((a, x) => a + x.p.response, 0) / ops.length : 0, acc = ops.length ? ops.reduce((a, x) => a + x.p.accept, 0) / ops.length : 0;
    const redTot = of.rows.reduce((a, x) => a + x.red, 0), redTotP = ofP.rows.reduce((a, x) => a + x.red, 0);
    const actTot = rows.reduce((a, x) => a + x.actions, 0), actTotP = rows.reduce((a, x) => a + x.actionsP, 0);
    const tiles = [
      kpi({ label: t("شركاء نشطون", "Active partners"), value: num(active), delta: delta(active, activeP), vs }),
      kpi({ label: t("إجراءات على عروض الشركاء", "Actions on partner listings"), value: compact(actTot), delta: delta(actTot, actTotP), vs }),
      kpi({ label: t("متوسط زمن الرد", "Average response time"), value: num(resp, 1) + t(" ساعة", " h"), demo: true, inverse: true }),
      kpi({ label: t("نسبة القبول", "Acceptance rate"), value: pct(acc), demo: true }),
      kpi({ label: t("عروض سارية", "Offers running"), value: num(of.rows.filter((x) => x.liveDays).length), foot: t("من عروض التطبيق الـ٦٤", "Of the app's 64 offers") }),
      kpi({ label: t("استخدام العروض", "Offer redemptions"), value: compact(redTot), delta: delta(redTot, redTotP), vs }),
    ];
    const note = '<div class="notice">' + icon("info", 16) + "<span>" + esc(t("الشركاء هنا هم المزودون والمنشآت التوضيحية في التطبيق. الجهات الرسمية والمؤسسات العامة المذكورة في التطبيق لا تُعرض كشركاء.", "Partners here are the app's illustrative providers and venues. Official bodies and public institutions listed in the app are not shown as partners.")) + "</span></div>";
    if (!active) return note + kpis(tiles) + empty(t("لا يوجد شركاء ضمن هذه الفلاتر.", "No partners match these filters."));
    const tierName = (i) => L(M.TIERS[i].name);
    const kindName = (k) => ({ operator: t("مشغل تجارب وخدمات", "Experience and service operator"), venue: t("منشأة", "Venue"), community: t("فريق أو نادٍ مجتمعي", "Community team or club") }[k]);
    const top = rows.slice().sort((a, b) => b.actions - a.actions).slice(0, 14);
    const tb = CH.table([t("الشريك", "Partner"), t("النوع", "Kind"), t("الباقة", "Plan"), t("عناصر", "Listings"), t("مشاهدات", "Views"), t("إجراءات", "Actions"), t("قيمة الحجوزات", "Booking value"), t("زمن الرد", "Response")],
      top.map((x) => ({ cells: [L(x.p.name), L(x.p.role), tierName(x.p.tier), x.p.objs.length, x.views, x.actions, x.gmv ? sar(x.gmv) : "—", num(x.p.response, 1) + t(" س", " h")], raw: [0, 0, 0, 0, 0, x.actions], html: { 4: compact(x.views), 5: compact(x.actions) } })), { num: [3, 4, 5, 6, 7], barCol: 5 });
    const tiers = CH.donut(M.TIERS.map((ti, i) => ({ name: ti.name ? L(ti.name) + (ti.fee ? t(" · " + num(ti.fee) + " ر.س شهريًا", " · SAR " + num(ti.fee) + "/month") : t(" · مجانية", " · free")) : "", color: CH.S[2 + i], value: rows.filter((x) => x.p.tier === i).length })), { fmt: num, centerLabel: t("شريك", "partners") });
    /* the network over the last 12 months, whatever the period */
    const gB = M.buckets(M.idx("2025-11-01"), M.DAYS - 1, "month");
    const growth = CH.trend([{ name: t("شركاء نشطون", "Active partners"), color: CH.S[0], values: gB.map((b) => M.PARTNERS.filter(inF).filter((p) => p.since <= b.b).length) }], gB.map((b) => blabel(b, "month")), { area: true, fmt: (v) => num(v) });
    const sc = CH.bubble(ops.filter((x) => x.actions > 0).map((x) => ({ name: L(x.p.name), short: L(x.p.name).slice(0, 22), x: x.p.response, y: x.p.accept, s: x.actions, color: x.p.kind === "venue" ? CH.S[2] : CH.S[0] })), { xName: t("زمن الرد (ساعة)", "Response time (hours)"), yName: t("نسبة القبول", "Acceptance"), sName: t("إجراءات", "Actions"), fx: (v) => num(v, 1), fy: (v) => pct(v, 0), ymin: 0.75, ymax: 1, labels: 4, rmax: 14, legend: [{ name: t("مشغلون", "Operators"), color: CH.S[0] }, { name: t("منشآت", "Venues"), color: CH.S[2] }] });
    const offers = of.rows.filter((x) => x.liveDays).sort((a, b) => b.red - a.red).slice(0, 10);
    const otb = CH.table([t("العرض", "Offer"), t("لدى", "At"), t("حصري", "Exclusive"), t("ينتهي", "Ends"), t("فتح العرض", "Opened"), t("استخدام", "Redeemed"), t("التحويل", "Conversion")],
      offers.map((x) => ({ cells: [L(x.of.title), L(x.of.ob.o.name), x.of.exclusive ? t("نعم", "Yes") : "—", B.date(x.of.ends, { day: "numeric", month: "short", year: "numeric" }), x.opens, x.red, pct(x.opens ? x.red / x.opens : 0)], raw: [0, 0, 0, 0, 0, x.red], html: { 4: compact(x.opens), 5: compact(x.red) } })), { num: [4, 5, 6], barCol: 5 });
    const kinds = ["operator", "venue", "community"].map((k) => ({ label: kindName(k), value: rows.filter((x) => x.p.kind === k).reduce((a, x) => a + x.actions, 0), sub: num(rows.filter((x) => x.p.kind === k).length) + t(" شريك", " partners") }));
    const kc = CH.hbars(kinds, { fmt: compact, color: CH.S[0], name: t("إجراءات", "Actions"), labelCol: t("النوع", "Kind") });
    return note + kpis(tiles) + grid(
      panel({ id: "pa-table", span: 3, title: t("أداء الشركاء", "Partner performance"), sub: t("الأعلى في الإجراءات ضمن الفلاتر", "The most actions under the filters"), demo: true, chart: tb }),
      panel({ id: "pa-growth", span: 2, title: t("نمو الشبكة", "Network growth"), sub: t("شركاء نشطون في نهاية كل شهر — آخر ١٢ شهرًا دائمًا", "Active partners at the end of each month — always the last 12 months"), demo: true, chart: growth }),
      panel({ id: "pa-tiers", title: t("باقات الشركاء", "Partner plans"), demo: "money", chart: tiers }),
      panel({ id: "pa-scatter", span: 2, title: t("سرعة الرد والقبول", "Response and acceptance"), demo: true, sub: t("كل دائرة شريك؛ حجمها بعدد الإجراءات", "Each circle is a partner, sized by actions"), chart: sc }),
      panel({ id: "pa-kinds", title: t("حسب نوع الشريك", "By kind of partner"), chart: kc }),
      panel({ id: "pa-offers", span: 3, title: t("أداء العروض", "Offer performance"), sub: t("عروض التطبيق السارية في الفترة؛ كلها تبدأ في ١ سبتمبر ٢٠٢٦", "The app's offers running in the period; all start on 1 September 2026"), chart: otb }),
    );
  };

  /* ═════════ 10. Commercial performance (demo money) ═════════ */
  P.commercial = function () {
    const c = ctx(), { r, f, cur, prev } = c, vs = c.prevName;
    const rev = M.revenue(f, r.d0, r.d1), revP = M.revenue(f, r.p0, r.p1);
    const U = M.uniques(cur), take = rev.gmv ? (rev.totals.experience + rev.totals.product) / rev.gmv : 0;
    const keys = Object.keys(rev.totals);
    const targets = Object.fromEntries(keys.map((k) => [k, Math.max(revP.totals[k] * (1.06 + 0.06 * M.u01("tg" + k + state.period)), rev.totals[k] * (0.9 + 0.12 * M.u01("tg2" + k + state.period)))]));
    const tgt = keys.reduce((a, k) => a + targets[k], 0);
    const revB = c.B.map((b) => keys.reduce((s, k) => { for (let d = b.a; d <= b.b; d++) s += rev.ch[k][d - r.d0]; return s; }, 0));
    const tiles = [
      kpi({ id: "revenue", raw: rev.total, label: t("صافي الإيرادات", "Net revenue"), value: sar(rev.total), delta: delta(rev.total, revP.total), vs, spark: revB, demo: true, hero: true, color: CH.S[2] }),
      kpi({ label: t("قيمة المعاملات", "Gross transaction value"), value: sar(rev.gmv), delta: delta(rev.gmv, revP.gmv), vs, demo: true, foot: t("حجوزات التجارب وطلبات المنتجات", "Experience bookings and product requests") }),
      kpi({ label: t("نسبة العمولة", "Take rate"), value: pct(take), demo: true }),
      kpi({ label: t("الإيراد لكل مستخدم نشط", "Revenue per active user"), value: B.state.lang === "ar" ? num(rev.total / (U || 1), 2) + " ر.س" : "SAR " + num(rev.total / (U || 1), 2), delta: delta(rev.total / (U || 1), revP.total / (M.uniques(prev) || 1)), vs, demo: true }),
      kpi({ label: t("مقابل المستهدف", "Against target"), value: pct(rev.total / tgt - 1, 1, true), foot: sar(tgt) + t(" مستهدف", " target"), demo: true }),
      kpi({ label: t("حجوزات مدفوعة", "Paid bookings"), value: compact(cur.tot[X.BK]), delta: delta(cur.tot[X.BK], prev.tot[X.BK]), vs, demo: true }),
    ];
    const note = '<div class="notice">' + icon("info", 16) + "<span>" + esc(t("كل القيم المالية في هذه اللوحة تجريبية بالريال السعودي لأغراض العرض، وليست إيرادات فعلية. لا يتضمن قسم " + CT.opps.ar + " أي قيم مالية.", "Every money value on this dashboard is a simulated demo figure in Saudi riyals, not real revenue. " + CT.opps.en + " carries no money values.")) + "</span> " + B.MONEY() + "</div>";
    if (!rev.total) return note + kpis(tiles) + empty(t("لا توجد إيرادات ضمن هذه الفلاتر.", "There is no revenue under these filters."));
    const series = keys.map((k) => ({ name: P.channelName(k), color: P.CHANNEL_COLORS[k], values: bsum(rev.ch[k], c.B, r.d0) }));
    const st = CH.trend(series, c.B.map((b) => blabel(b, r.gran)), { stack: true, fmt: sar, bands: bands(c.B) });
    const wf = CH.waterfall([{ name: vs, value: revP.total, total: true }].concat(keys.map((k) => ({ name: P.channelName(k), value: rev.totals[k] - revP.totals[k] }))).concat([{ name: t("الفترة الحالية", "This period"), value: rev.total, total: true }]), { fmt: sar });
    const bl = CH.bullet(keys.map((k) => ({ label: P.channelName(k), actual: rev.totals[k], target: targets[k] })), { fmt: sar });
    /* revenue by area and category: the channels that carry a place (the rest is city-wide) */
    const byZ = M.ZONES.map((z) => { const ff = { ...f, area: z.id }; const rr = M.revenue(ff, r.d0, r.d1); return { z, v: rr.total }; }).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
    const zc = CH.hbars(byZ.slice(0, 10).map((x) => ({ label: L(x.z.name), value: x.v })), { fmt: sar, color: CH.S[2], name: t("الإيرادات", "Revenue"), labelCol: t("المنطقة", "Area"), rank: true });
    const byC = M.CATS.map((cat) => ({ cat, v: M.revenue({ ...f, category: cat.id }, r.d0, r.d1).total })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
    const cc = CH.hbars(byC.slice(0, 10).map((x) => ({ label: L(x.cat.name), value: x.v })), { fmt: sar, color: CH.S[2], name: t("الإيرادات", "Revenue"), labelCol: t("الفئة", "Category") });
    const pr = M.productAgg(f, r.d0, r.d1), of = M.offerAgg(f, r.d0, r.d1), sb = M.subscriptions(f, r.d0, r.d1);
    const vol = { experience: cur.tot[X.BK], product: pr.tot.requests, service: cur.tot[X.SR], offers: of.rows.reduce((a, x) => a + x.red, 0), subscriptions: sb.active };
    const volName = { experience: t("حجز", "bookings"), product: t("طلب", "requests"), service: t("طلب", "requests"), offers: t("استخدام", "redemptions"), subscriptions: t("شريك", "partners") };
    const gmvOf = { experience: rev.expGmv, product: rev.prodGmv };
    const ue = CH.table([t("القناة", "Channel"), t("الحجم", "Volume"), t("قيمة المعاملات", "Transaction value"), t("الإيرادات", "Revenue"), t("الحصة", "Share"), t("التغيّر", "Change")],
      keys.map((k) => ({ cells: [P.channelName(k), num(vol[k]) + " " + volName[k], gmvOf[k] ? sar(gmvOf[k]) : "—", sar(rev.totals[k]), pct(rev.totals[k] / rev.total), delta(rev.totals[k], revP.totals[k]) === null ? t("جديد", "New") : pct(delta(rev.totals[k], revP.totals[k]), 1, true)], raw: [0, 0, 0, rev.totals[k]], html: { 0: '<i class="key box" style="--c:' + P.CHANNEL_COLORS[k] + '"></i> ' + esc(P.channelName(k)) } })), { num: [1, 2, 3, 4, 5], barCol: 3 });
    const audRev = (a) => M.revenue({ ...f, audience: a }, r.d0, r.d1);
    const ar = state.audience === "all" ? [audRev("resident"), audRev("visitor")] : null;
    const aud = ar ? CH.hbars(keys.map((k) => ({ label: P.channelName(k), value: ar[0].totals[k] + ar[1].totals[k], parts: [{ name: t("السكان", "Residents"), color: CH.AUD.resident, value: ar[0].totals[k] }, { name: t("الزوار", "Visitors"), color: CH.AUD.visitor, value: ar[1].totals[k] }] })), { fmt: sar, legend: B.AUD_SERIES(), name: t("الإيرادات", "Revenue") }) : null;
    const best = keys.slice().sort((a, b) => (delta(rev.totals[b], revP.totals[b]) ?? 9) - (delta(rev.totals[a], revP.totals[a]) ?? 9))[0];
    return note + kpis(tiles) + grid(
      panel({ id: "cm-trend", span: 2, title: t("الإيرادات حسب القناة", "Revenue by channel"), demo: "money", chart: st }),
      panel({ id: "cm-ins", title: t("أبرز ما تقوله البيانات", "What the data says"), html: insights([
        { icon: "coins", title: t("أكبر قناة", "Largest channel"), text: P.channelName(keys.slice().sort((a, b) => rev.totals[b] - rev.totals[a])[0]) + t(" تمثل ", " makes up ") + pct(Math.max(...keys.map((k) => rev.totals[k])) / rev.total) + t(" من الإيرادات.", " of revenue.") },
        { icon: "up", title: t("أسرع نمو", "Fastest growth"), text: P.channelName(best) + (delta(rev.totals[best], revP.totals[best]) === null ? t(" قناة جديدة في هذه الفترة.", " is new in this period.") : t(" نمت ", " grew ") + pct(delta(rev.totals[best], revP.totals[best]), 1, true) + ".") },
        { icon: "chart", title: t("المستهدف", "Target"), text: t("الإيرادات ", "Revenue is ") + pct(Math.abs(rev.total / tgt - 1)) + (rev.total >= tgt ? t(" فوق المستهدف.", " above target.") : t(" دون المستهدف.", " below target.")) }]) }),
      panel({ id: "cm-wf", span: 2, title: t("من الفترة السابقة إلى الحالية", "From the previous period to this one"), demo: "money", sub: t("التغيّر في كل قناة", "The change in each channel"), chart: wf }),
      panel({ id: "cm-bullet", title: t("القنوات مقابل المستهدف", "Channels against target"), demo: "money", chart: bl }),
      panel({ id: "cm-ue", span: 3, title: t("اقتصاديات القنوات", "Channel economics"), demo: "money", chart: ue, note: t("العمولات: ١٢٪ على حجوزات التجارب، ١٠٪ على المنتجات؛ ١٢ ر.س لكل طلب خدمة؛ ٣ ر.س لكل استخدام عرض و٢٠ ر.س يوميًا للعرض الحصري؛ الباقات ٢٩٩ و٧٩٩ ر.س شهريًا. كلها افتراضات تجريبية.", "Fees: 12% on experience bookings, 10% on products; SAR 12 per service request; SAR 3 per offer redemption and SAR 20 a day per exclusive offer; plans at SAR 299 and 799 a month. All are demo assumptions.") }),
      panel({ id: "cm-zone", title: t("الإيرادات حسب المنطقة", "Revenue by area"), demo: "money", chart: zc }),
      panel({ id: "cm-cat", title: t("الإيرادات حسب الفئة", "Revenue by category"), demo: "money", chart: cc }),
      aud ? panel({ id: "cm-aud", title: t("الإيرادات حسب الجمهور", "Revenue by audience"), demo: "money", chart: aud }) : "",
    );
  };

  /* ═════════ 11. Districts and the map ═════════ */
  const METRICS = [
    ["users", "المستخدمون يوميًا", "Users per day"], ["views", "المشاهدات", "Views"], ["actions", "الإجراءات", "Actions"], ["growth", "النمو", "Growth"],
    ["visitors", "حصة الزوار", "Visitors' share"], ["posts", "مشاركات المجتمع", "Community posts"], ["centers", "زوار المراكز", "Centre visitors"],
  ];
  P.geography = function () {
    const c = ctx(), { r, f } = c, vs = c.prevName;
    const all = { ...f, area: "all" }, cur = M.cubeAgg(all, r.d0, r.d1), prev = M.cubeAgg(all, r.p0, r.p1);
    const cm = M.communityAgg(all, r.d0, r.d1), vc = M.centerAgg(all, r.d0, r.d1);
    const res = M.cubeAgg({ ...all, audience: "visitor" }, r.d0, r.d1);
    const Z = M.ZONES.slice(0, M.HOMEZ).map((z, i) => {
      const u = cur.byZ[i][MM.U] / c.days, up = prev.byZ[i][MM.U] / (r.p1 - r.p0 + 1);
      const topC = M.CATS.map((cat, ci) => ({ cat, v: M.cubeAgg({ ...all, area: z.id }, r.d0, r.d1).byC[ci][MM.V] })).sort((a, b) => b.v - a.v)[0];
      return { z, i, users: u, growth: delta(cur.byZ[i][MM.U], prev.byZ[i][MM.U]) || 0, views: cur.byZ[i][MM.V], actions: cur.byZ[i][MM.X], visitors: cur.byZ[i][MM.U] ? res.byZ[i][MM.U] / cur.byZ[i][MM.U] : 0,
        posts: cm.rows.filter((x) => x.cm.z === i).reduce((a, x) => a + x.posts, 0), centers: vc.rows.filter((x) => x.ce.z === i).reduce((a, x) => a + x.v[0], 0), topC, up };
    });
    const m = state.mapMetric;
    const fmtM = { users: compact, views: compact, actions: compact, growth: (v) => pct(v, 1, true), visitors: (v) => pct(v, 0), posts: compact, centers: compact }[m];
    const sel = '<div class="seg" role="tablist" aria-label="' + esc(t("مقياس الخريطة", "Map measure")) + '">' + METRICS.map((x) => '<button type="button" role="tab" aria-selected="' + (m === x[0]) + '" data-map-metric="' + x[0] + '">' + esc(t(x[1], x[2])) + "</button>").join("") + "</div>";
    const map = CH.districtMap(Z.map((x) => ({ id: x.z.id, name: L(x.z.name), short: L(x.z.name).replace(/^(Al-)/, ""), x: x.z.x, y: x.z.y, value: x[m], label: fmtM(x[m]), extra: [[null, t("مستخدمون يوميًا", "Users per day"), compact(x.users)], [null, t("النمو", "Growth"), pct(x.growth, 1, true)], [null, t("الأكثر مشاهدة", "Most viewed"), L(x.topC.cat.name)]] })),
      { allPoints: P.allPoints(), fmt: fmtM, diverging: m === "growth", divMax: Math.max(...Z.map((x) => Math.abs(x.growth))), ramp: m === "visitors" ? CH.SEQ_B : CH.SEQ, zero: m === "centers" || m === "posts", selected: state.area !== "all" ? state.area : null, center: P.MOSQUE(),
        landmarks: P.landmarks((ob) => { const row = M.objectRows(all, r.d0, r.d1).find((x) => x.ob === ob); return row ? [[null, t("مشاهدات", "Views"), compact(row.views)]] : []; }), name: t(METRICS.find((x) => x[0] === m)[1], METRICS.find((x) => x[0] === m)[2]) });
    const cw = cur.byZ[M.ZI.cw][MM.U] / c.days;
    const totalU = cur.tot[MM.U] / c.days;
    const tiles = [
      kpi({ label: t("المناطق المغطاة", "Areas covered"), value: num(M.HOMEZ), foot: t("مناطق السكن في التطبيق", "The app's home areas") }),
      kpi({ label: t("الأكثر نشاطًا", "Most active"), value: L(Z.slice().sort((a, b) => b.users - a.users)[0].z.name), foot: compact(Math.max(...Z.map((x) => x.users))) + t(" مستخدم يوميًا", " users a day") }),
      kpi({ label: t("أسرع نمو", "Fastest growth"), value: L(Z.slice().sort((a, b) => b.growth - a.growth)[0].z.name), foot: pct(Math.max(...Z.map((x) => x.growth)), 1, true) + " · " + vs }),
      kpi({ label: t("أعلى حصة للزوار", "Highest visitor share"), value: L(Z.slice().sort((a, b) => b.visitors - a.visitors)[0].z.name), foot: pct(Math.max(...Z.map((x) => x.visitors)), 0) }),
      kpi({ label: t("نشاط " + CT.cityWide.ar, "City-wide activity"), value: pct(cw / (totalU || 1)), foot: t("أماكن يحددها التطبيق ب" + CT.city.ar + " فقط", "Places the app locates only as " + CT.city.en) }),
    ];
    const sorted = Z.slice().sort((a, b) => b.users - a.users);
    const zDaily = (i) => { const zz = M.cubeAgg({ ...all, area: M.ZONES[i].id }, r.d0, r.d1); return bavg(zz.byD[0][MM.U].map((v, k) => v + zz.byD[1][MM.U][k]), c.B, r.d0); };
    const rank = CH.table([t("المنطقة", "Area"), t("مستخدمون يوميًا", "Users a day"), t("النمو", "Growth"), t("حصة الزوار", "Visitors"), t("الأكثر مشاهدة", "Most viewed"), t("مشاركات", "Posts"), t("الاتجاه", "Trend")],
      sorted.map((x) => ({ cells: [L(x.z.name), x.users, pct(x.growth, 1, true), pct(x.visitors, 0), L(x.topC.cat.name), x.posts, ""], raw: [0, x.users], attrs: ' data-set-area="' + x.z.id + '" class="row-link' + (state.area === x.z.id ? " sel" : "") + '" tabindex="0"', html: { 1: compact(x.users), 2: B.deltaBadge(x.growth, { vs }), 5: compact(x.posts), 6: CH.spark(zDaily(x.i), CH.S[0], 96, 26) } })), { num: [1, 2, 3, 5], barCol: 1 });
    const split = CH.hbars(Z.slice().sort((a, b) => b.visitors - a.visitors).map((x) => ({ label: L(x.z.name), value: x.users, parts: [{ name: t("السكان", "Residents"), color: CH.AUD.resident, value: x.users * (1 - x.visitors) }, { name: t("الزوار", "Visitors"), color: CH.AUD.visitor, value: x.users * x.visitors }] })), { fmt: compact, legend: [{ name: t("السكان", "Residents"), color: CH.AUD.resident }, { name: t("الزوار", "Visitors"), color: CH.AUD.visitor }], name: t("مستخدمون يوميًا", "Users a day"), labelCol: t("المنطقة", "Area") });
    /* what each area is viewed for: each row is that area's mix of categories */
    const catIdx = M.CATS.map((_, i) => i).filter((ci) => cur.byC[ci][MM.V] > 0);
    const mat = sorted.map((x) => { const zz = M.cubeAgg({ ...all, area: x.z.id }, r.d0, r.d1); const tot = zz.tot[MM.V] || 1; return catIdx.map((ci) => zz.byC[ci][MM.V] / tot); });
    const hm = CH.heatmap(mat, sorted.map((x) => L(x.z.name)), catIdx.map((ci) => L(M.CATS[ci].name)), { fmt: (v) => pct(v, 0), zero: true, rotate: true, rowLabel: 112, unit: t("من مشاهدات المنطقة", "of the area's views") });
    const lm = M.objectRows(all, r.d0, r.d1).filter((x) => x.ob.o.mustDo).sort((a, b) => b.views - a.views);
    const lmc = CH.hbars(lm.map((x) => ({ label: L(x.ob.o.name), value: x.views, sub: zoneName(M.ZONES[x.ob.z].id) })), { fmt: compact, color: CH.S[1], name: t("مشاهدات", "Views"), labelCol: t("المعلم", "Landmark"), rank: true });
    const selZ = state.area !== "all" ? Z.find((x) => x.z.id === state.area) : null;
    const profile = selZ ? '<div class="area-card"><h4>' + icon("pin", 16) + esc(L(selZ.z.name)) + "</h4><p>" + esc(L(M.C.districts.find((d) => d.id === selZ.z.id).blurb)) + '</p><dl><div><dt>' + esc(t("مستخدمون يوميًا", "Users a day")) + "</dt><dd>" + esc(compact(selZ.users)) + "</dd></div><div><dt>" + esc(t("النمو", "Growth")) + "</dt><dd>" + B.deltaBadge(selZ.growth, { vs }) + "</dd></div><div><dt>" + esc(t("حصة الزوار", "Visitors")) + "</dt><dd>" + esc(pct(selZ.visitors, 0)) + "</dd></div><div><dt>" + esc(t("الأكثر مشاهدة", "Most viewed")) + "</dt><dd>" + esc(L(selZ.topC.cat.name)) + '</dd></div></dl><button type="button" class="btn ghost" data-set-area="all">' + esc(CX("all")) + "</button></div>" : "";
    return kpis(tiles) + grid(
      panel({ id: "ge-map", span: 2, cls: "map-panel", title: t("خريطة الأحياء", "District map"), sub: t("اضغط على منطقة لتصفية كل اللوحات · ● معالم «لا تفوّت» من التطبيق", "Select an area to filter every dashboard · ● the app's must-see landmarks"), controls: sel, chart: map, note: t("خريطة تخطيطية: مناطق السكن في التطبيق ومواقعها نسبةً إلى " + CT.mosque.ar + "، وكل حي آخر يتبع أقرب منطقة. ليست بمقياس رسم.", "A schematic map: the app's home areas at their positions relative to " + CT.mosque.en + "; every other district joins its nearest area. Not to scale.") }),
      panel({ id: "ge-side", title: selZ ? t("المنطقة المختارة", "The selected area") : t("أبرز ما تقوله البيانات", "What the data says"), html: profile || insights([
        { icon: "map", title: t("قلب " + CT.city.ar, "The heart of the city"), text: t(CT.heart.ar + " تستقبل ", CT.heart.en + " draws ") + pct(Z[M.ZI[RC.centralZone]].users / (totalU || 1)) + t(" من النشاط اليومي.", " of daily activity.") },
        { icon: "users", title: t("أحياء السكان", "Residents' districts"), text: t("أعلى حصة للسكان في ", "Residents make up the largest share in ") + L(Z.slice().sort((a, b) => a.visitors - b.visitors)[0].z.name) + " (" + pct(1 - Math.min(...Z.map((x) => x.visitors)), 0) + ")." },
        { icon: "up", title: t("النمو", "Growth"), text: L(Z.slice().sort((a, b) => b.growth - a.growth)[0].z.name) + t(" الأسرع نموًا مقارنةً مع ", " grew fastest against ") + c.vsText + "." }]) }),
      panel({ id: "ge-rank", span: 3, title: t("ترتيب المناطق", "Areas compared"), sub: t("اضغط على صف لتصفية اللوحات", "Select a row to filter the dashboards"), chart: rank }),
      panel({ id: "ge-heat", span: 2, title: t("ماذا يشاهد الناس في كل منطقة", "What people view in each area"), sub: t("حصة كل فئة من مشاهدات المنطقة", "Each category's share of the area's views"), chart: hm }),
      panel({ id: "ge-split", title: t("السكان والزوار في كل منطقة", "Residents and visitors by area"), chart: split }),
      panel({ id: "ge-lm", span: 3, title: t("معالم «لا تفوّت»", "Must-see landmarks"), sub: t("اختيار التطبيق التحريري للمعالم الحقيقية، حسب مشاهدات صفحاتها", "The app's editorial selection of real landmarks, by page views"), chart: lmc }),
    );
  };

  /* ═════════ 12. Reports ═════════ */
  function reportList() {
    const c = ctx(), { r, f, cur } = c;
    const tb = (cols, rows) => ({ cols, rows });
    const rev = M.revenue(f, r.d0, r.d1);
    const list = [
      { id: "daily", title: t("المؤشرات اليومية", "Daily figures"), desc: t("المستخدمون والجلسات والمشاهدات والإجراءات لكل يوم", "Users, sessions, views and actions for every day"),
        table: () => tb([t("التاريخ", "Date"), t("مستخدمون", "Users"), t("مستخدمون جدد", "New users"), t("جلسات", "Sessions"), t("مشاهدات", "Views"), t("حفظ", "Saves"), t("إضافة إلى خطتي", "Added to My Plan"), t("إجراءات", "Actions")],
          Array.from({ length: c.days }, (_, i) => [M.iso(r.d0 + i)].concat([MM.U, MM.N, MM.S, MM.V, MM.SV, MM.P, MM.X].map((m) => Math.round(cur.byD[0][m][i] + cur.byD[1][m][i]))))) },
      { id: "areas", title: t("ملخص المناطق", "Area summary"), desc: t("كل مناطق السكن و" + CT.cityWide.ar, "All home areas and city-wide"),
        table: () => tb([t("المنطقة", "Area"), t("مستخدمون نشطون", "Active users"), t("مشاهدات", "Views"), t("حفظ", "Saves"), t("إجراءات", "Actions"), t("مستخدمون جدد", "New users")],
          M.ZONES.map((z, i) => [L(z.name), Math.round(cur.byZ[i][MM.U] / ((M.freq(c.days, 0) + M.freq(c.days, 1)) / 2)), Math.round(cur.byZ[i][MM.V]), Math.round(cur.byZ[i][MM.SV]), Math.round(cur.byZ[i][MM.X]), Math.round(cur.byZ[i][MM.N])])) },
      { id: "categories", title: t("ملخص الفئات", "Category summary"), desc: t("الفئات الـ١٤ في التطبيق", "The app's 14 categories"),
        table: () => tb([t("الفئة", "Category"), t("مشاهدات", "Views"), t("حفظ", "Saves"), t("إضافة إلى خطتي", "Added to My Plan"), t("إجراءات", "Actions"), t("عمليات بحث", "Searches")],
          M.CATS.map((cat, i) => [L(cat.name), Math.round(cur.byC[i][MM.V]), Math.round(cur.byC[i][MM.SV]), Math.round(cur.byC[i][MM.P]), Math.round(cur.byC[i][MM.X]), Math.round(cur.byC[i][MM.Q])])) },
      { id: "objects", title: t("الأماكن والتجارب", "Places and experiences"), desc: t("كل سجل في محتوى التطبيق ضمن الفلاتر", "Every record in the app's content under the filters"),
        table: () => tb([t("المعرّف", "ID"), t("الاسم", "Name"), t("النوع", "Type"), t("الفئة", "Category"), t("المنطقة", "Area"), t("مشاهدات", "Views"), t("حفظ", "Saves"), t("إضافة إلى خطتي", "Added to My Plan"), t("إجراءات", "Actions")],
          M.objectRows(f, r.d0, r.d1).sort((a, b) => b.views - a.views).map((x) => [x.ob.id, L(x.ob.o.name), L(M.C.typeLabels[x.ob.o.type]), L(M.CATS[x.ob.c].name), L(M.ZONES[x.ob.z].name), Math.round(x.views), Math.round(x.saves), Math.round(x.plans), Math.round(x.actions)])) },
      { id: "market", title: t("منتجات السوق", "Market products"), desc: t("الطلبات والقيم التجريبية", "Requests and demo values"), demo: true,
        table: () => tb([t("المعرّف", "ID"), t("المنتج", "Product"), t("السعر التجريبي", "Demo price"), t("مشاهدات", "Views"), t("طلبات", "Requests"), t("قطع", "Units"), t("القيمة (ر.س)", "Value (SAR)")],
          M.productAgg(f, r.d0, r.d1).rows.map((x) => [x.p.id, L(x.p.name), x.p.price, Math.round(x.views), Math.round(x.requests), Math.round(x.units), Math.round(x.gmv)])) },
      { id: "city", title: CX("opps"), desc: t("المشاهدات والطلبات، دون أي قيم مالية", "Views and requests, with no money values"),
        table: () => tb([t("المعرّف", "ID"), t("العنصر", "Item"), t("المنطقة", "Area"), t("مشاهدات", "Views"), t("طلبات أو اهتمام", "Requests or interest")],
          M.cityAgg(f, r.d0, r.d1).rows.map((x) => [x.it.id, L(x.it.name), L(M.ZONES[x.it.z].name), Math.round(x.views), Math.round(x.requests)])) },
      { id: "community", title: t("المجتمعات", "Communities"), desc: t("المشاركات والأسئلة والأعضاء الجدد", "Posts, questions and new members"),
        table: () => tb([t("المجتمع", "Community"), t("الأعضاء", "Members"), t("مشاركات", "Posts"), t("أسئلة", "Questions"), t("إجابات", "Answers"), t("أعضاء جدد", "New members")],
          M.communityAgg(f, r.d0, r.d1).rows.map((x) => [L(x.cm.name), x.cm.members, Math.round(x.posts), Math.round(x.questions), Math.round(x.answers), Math.round(x.joins)])) },
      { id: "centers", title: t("مراكز الزوار", "Visitor Centers"), desc: t("الخدمة والانتظار والرضا", "Service, waiting and satisfaction"), demo: true,
        table: () => tb([t("المركز", "Centre"), t("خُدموا", "Served"), t("متوسط الانتظار (د)", "Average wait (min)"), t("خلال ١٠ دقائق", "Within 10 minutes"), t("الرضا من ٥", "Satisfaction of 5")],
          M.centerAgg(f, r.d0, r.d1).rows.map((x) => [L(x.ce.name), Math.round(x.v[0]), +(x.v[1] / (x.v[0] || 1)).toFixed(1), +(x.v[6] / (x.v[0] || 1)).toFixed(3), +(x.v[4] / (x.v[3] || 1)).toFixed(2)])) },
      { id: "revenue", title: t("الإيرادات حسب القناة", "Revenue by channel"), desc: t("أرقام مالية تجريبية لكل يوم", "Demo money figures for every day"), demo: true,
        table: () => tb([t("التاريخ", "Date")].concat(Object.keys(rev.ch).map((k) => P.channelName(k) + t(" (ر.س)", " (SAR)"))), Array.from({ length: c.days }, (_, i) => [M.iso(r.d0 + i)].concat(Object.keys(rev.ch).map((k) => Math.round(rev.ch[k][i]))))) },
    ];
    return list;
  }
  P.reportList = reportList;
  P.reports = function () {
    const c = ctx(), list = reportList();
    const scope = [L(c.r.p.name), state.area === "all" ? CX("all") : zoneName(state.area), state.category === "all" ? t("كل الفئات", "All categories") : B.catName(state.category), B.audName(state.audience)].join(" · ");
    const cards = list.map((rp) => {
      const tb = rp.table();
      return '<article class="report"><div class="rp-h"><div><h3>' + esc(rp.title) + (rp.demo ? " " + B.DEMO() : "") + "</h3><p>" + esc(rp.desc) + '</p></div><span class="rp-n">' + esc(num(tb.rows.length)) + " " + esc(t("صف", "rows")) + '</span></div><div class="rp-prev">' + B.tableView({ cols: tb.cols, rows: tb.rows.slice(0, 4) }) + '</div><div class="rp-a"><button type="button" class="btn" data-report="' + rp.id + '">' + icon("download", 16) + "<span>" + esc(t("تنزيل CSV", "Download CSV")) + "</span></button></div></article>";
    }).join("");
    return '<div class="notice">' + icon("info", 16) + "<span>" + esc(t("التقارير تتبع الفلاتر الحالية: ", "Reports follow the current filters: ") + scope) + '</span><button type="button" class="btn ghost sm" data-print>' + icon("print", 15) + "<span>" + esc(t("طباعة أو حفظ PDF", "Print or save as PDF")) + "</span></button></div>" + '<div class="reports">' + cards + "</div>";
  };
})();
