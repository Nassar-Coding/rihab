/* Rihab BI — the data model (one city: window.RIHAB_BI_CITY).
   One simulated, deterministic dataset, built on the app's own content (data/content.js): its 15
   home areas and their map positions, 14 categories, 355 places, activities, offers and
   services, 55 communities, the Market's products and the City Opportunities listings.
   Every figure on every dashboard is summed from the same daily facts below, so a total is the
   same wherever it appears and every breakdown adds up to it. Nothing here is live data: the
   behaviour, demographics, Visitor Center operations and all money values are simulated for the
   demo and the interface says so.
   Time: 730 days ending 27 October 2026 (the demo's "today"), so every period has a previous
   period of the same length to compare with. Ramadan, Eid, the Hajj season, school holidays,
   the weekend (Friday and Saturday) and the city's weather shape the series. The city's own
   behaviour (seasons, landmarks, areas, Visitor Centers) comes from its city.js. */
(function () {
  "use strict";
  const C = window.RUH_CONTENT;
  const RC = window.RIHAB_BI_CITY, CM = RC.model;
  const DAY = 864e5, DAYS = 730;
  const END = Date.UTC(2026, 9, 27), START = END - (DAYS - 1) * DAY;
  const iso = (i) => new Date(START + i * DAY).toISOString().slice(0, 10);
  const idx = (s) => Math.round((Date.parse(s + "T00:00:00Z") - START) / DAY);
  const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));

  /* ── deterministic noise ──
     Each dataset below draws from its own seeded stream in a fixed order, so the same figures come
     back on every load, on every device. */
  function fnv(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const u01 = (s) => (fnv(String(s)) + 0.5) / 4294967296;
  let seed = 1;
  const reseed = (s) => { seed = fnv(s) | 0; };
  function rnd() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const nrm = () => (rnd() + rnd() + rnd() - 1.5) * 2;
  const wob = (sd) => Math.exp(sd * nrm() - sd * sd / 2);
  const sr = (x) => Math.floor(x + rnd());                          /* unbiased integer rounding */
  const logn = (key, sd) => Math.exp(sd * ((u01(key) + u01(key + "#") + u01(key + "$") - 1.5) * 2));

  /* ── dimensions ── */
  const AUD = ["resident", "visitor"];
  const CATS = C.categories, CI = Object.fromEntries(CATS.map((c, i) => [c.id, i]));
  const DIST = byId(C.districts);
  const ZONES = C.districts.filter((d) => d.home).map((d) => ({ id: d.id, name: d.name, x: d.x, y: d.y, geo: d.geo }))
    .concat([{ id: "cw", name: RC.terms.cityWide, x: null, y: null, geo: null }]);
  const ZI = Object.fromEntries(ZONES.map((z, i) => [z.id, i]));
  const NZ = ZONES.length, NC = CATS.length, HOMEZ = NZ - 1;
  /* a district that is not a home area belongs to the nearest one (its Voronoi cell on the map);
     a record the app places only in the city as a whole counts city-wide */
  function zoneOf(nb) {
    if (nb != null && ZI[nb] != null) return ZI[nb];
    const d = DIST[nb];
    if (!d || d.x == null) return ZI.cw;
    let best = 0, bd = Infinity;
    for (let i = 0; i < HOMEZ; i++) { const z = ZONES[i], q = (z.x - d.x) ** 2 + (z.y - d.y) ** 2; if (q < bd) { bd = q; best = i; } }
    return best;
  }
  const ZONE_OF_DISTRICT = Object.fromEntries(C.districts.map((d) => [d.id, zoneOf(d.id)]));

  /* ── the calendar: the city's seasons ── */
  const R = (a, b) => [idx(a), idx(b)];
  const SEASONS = {
    ramadan: [R("2025-03-01", "2025-03-29"), R("2026-02-18", "2026-03-19")],
    last10: [R("2025-03-20", "2025-03-29"), R("2026-03-10", "2026-03-19")],
    eidFitr: [R("2025-03-30", "2025-04-02"), R("2026-03-20", "2026-03-23")],
    preHajj: [R("2025-05-01", "2025-06-02"), R("2026-04-20", "2026-05-23")],
    hajjDays: [R("2025-06-03", "2025-06-09"), R("2026-05-24", "2026-05-30")],
    postHajj: [R("2025-06-10", "2025-07-06"), R("2026-05-31", "2026-06-26")],
    summer: [R("2025-06-26", "2025-08-23"), R("2026-06-12", "2026-08-22")],
    national: [R("2025-09-21", "2025-09-25"), R("2026-09-21", "2026-09-25")],
    founding: [R("2025-02-20", "2025-02-24"), R("2026-02-20", "2026-02-24")],
    campaign: [R("2024-11-17", "2024-11-30"), R("2025-10-05", "2025-10-18"), R("2026-02-08", "2026-02-21"), R("2026-10-04", "2026-10-17")],
  };
  const inS = (name, d) => SEASONS[name].some(([a, b]) => d >= a && d <= b);
  const DOW = new Int8Array(DAYS), MONTH = new Int8Array(DAYS), FLAGS = Array.from({ length: DAYS }, () => ({}));
  for (let d = 0; d < DAYS; d++) {
    const dt = new Date(START + d * DAY);
    DOW[d] = dt.getUTCDay(); MONTH[d] = dt.getUTCMonth();
    for (const k of Object.keys(SEASONS)) if (inS(k, d)) FLAGS[d][k] = true;
  }
  const LAUNCH = { market: idx("2026-02-01"), city: idx("2026-05-01"), offers: idx("2026-09-01") };
  const ramp = (d, from, days) => (d < from ? 0 : Math.min(1, 0.35 + 0.65 * (d - from) / days));

  /* weekday rhythm (Sunday first; the weekend is Friday and Saturday) */
  const DOW_F = [[0.93, 0.9, 0.92, 0.96, 1.1, 1.17, 1.1], [0.97, 0.95, 0.95, 0.98, 1.06, 1.13, 1.04]];
  const growth = (d) => 0.5 + 0.5 * Math.pow(d / (DAYS - 1), 1.1);
  function seasonAud(d, a) {
    const f = FLAGS[d], m = MONTH[d];
    let s = 1;
    if (a === 1) {
      const V = CM.visitorSeason;
      if (f.ramadan) s *= f.last10 ? V.last10 : V.ramadan;
      if (f.eidFitr) s *= V.eidFitr;
      if (f.preHajj) s *= V.preHajj;
      if (f.hajjDays) s *= V.hajjDays;
      if (f.postHajj) s *= V.postHajj;
      if (m === 11 || m <= 1) s *= 1.12;
      if (f.summer) s *= 1.06;
    } else {
      if (f.ramadan) s *= 1.18;
      if (f.eidFitr) s *= 1.28; else if (f.hajjDays) s *= CM.residentHajj;
      if (f.summer) s *= 0.87;
      if (m === 11 || m <= 1) s *= 1.05;
      if (f.national || f.founding) s *= 1.12;
    }
    if (f.campaign) s *= 1.04;
    return s;
  }
  const TEMP = CM.temp;  /* outdoor comfort by month */
  function seasonCat(c, d, a) {
    const f = FLAGS[d], id = CATS[c].id;
    let s = 1;
    if (id === "nature" || id === "sport") s *= TEMP[MONTH[d]];
    if (id === "heritage" || id === "culture") s *= 0.9 + 0.1 * TEMP[MONTH[d]];
    if (f.ramadan) s *= { volunteer: 1.9, food: 1.3, cafe: 1.35, events: 0.8, sport: 0.8, learn: 0.9, market: f.last10 ? 1.5 : 1.1, stay: a ? 1.35 : 1 }[id] || 1;
    if (f.eidFitr || f.hajjDays) s *= { family: 1.4, events: 1.5, food: 1.25, market: 1.3 }[id] || 1;
    if (f.summer) s *= { family: 1.3, learn: 0.75, cafe: 1.05 }[id] || 1;
    if (f.national || f.founding) s *= { events: 1.9, heritage: 1.15, family: 1.15 }[id] || 1;
    if (f.postHajj && a) s *= { stay: 1.3, market: 1.2 }[id] || 1;
    return s;
  }

  /* ── content weights: how much attention each record draws, per audience ── */
  const TYPE_W = { place: 1, restaurant: 0.8, experience: 1.25, event: 1.1, activity: 1, recurring: 0.85, offer: 1.1, service: 0.7 };
  const CAT_AFF = { food: [1.25, 1], cafe: [1.3, 0.85], culture: [0.75, 1.45], heritage: [0.6, 1.6], nature: [0.95, 0.9], market: [0.85, 1.25],
    family: [1.3, 0.75], learn: [1.15, 0.55], craft: [1, 0.8], volunteer: [1.2, 0.45], sport: [1.25, 0.4], events: [1.2, 0.8], services: [1, 1.05], stay: [0.25, 1.6] };
  const ZONE_AFF_V = CM.zoneAffV;
  const ZONE_AFF_R = CM.zoneAffR;
  /* each kind of action converts differently from a detail view */
  const ACT_K = { go: 0.09, book: 0.045, register: 0.06, join: 0.07, official: 0.05, redeem: 0.055, contact: 0.035 };
  const SAVE_T = { place: 0.07, restaurant: 0.06, experience: 0.11, event: 0.1, activity: 0.09, recurring: 0.08, offer: 0.12, service: 0.05 };
  const PLAN_T = { place: 0.035, restaurant: 0.03, experience: 0.075, event: 0.07, activity: 0.065, recurring: 0.06, offer: 0.04, service: 0.025 };

  /* the city's anchors draw more attention than their content weight alone suggests */
  const LANDMARK = CM.landmark;
  const OBJS = C.objects.map((o, i) => {
    const z = zoneOf(o.nb), c = CI[o.cat];
    const marketKind = o.id === CM.hosted || (!o.real && (o.type === "service" || o.cat === "stay")) ? "service"
      : !o.real && ["experience", "event", "activity", "recurring"].includes(o.type) ? "experience" : null;
    const bookable = !o.real && o.price > 0 && ["book", "register", "join"].includes(o.action) && ["experience", "event", "activity", "recurring", "place"].includes(o.type);
    const w = [0, 1].map((a) => {
      const zid = ZONES[z].id;
      const za = a ? ZONE_AFF_V[zid] || 0.65 : ZONE_AFF_R[zid] || 1;
      return TYPE_W[o.type] * CAT_AFF[o.cat][a] * za * (0.35 + (o.pop ?? 0.5)) * (o.mustDo ? (a ? 2.6 : 1.3) : 1) * (LANDMARK[o.id] || 1) * logn(o.id + a, 0.35);
    });
    const k = [0, 1].map((a) => {
      const n = (m) => logn(o.id + m + a, 0.18);
      const act = (ACT_K[o.action] || 0.05) * (o.price > 0 ? 0.85 : 1.1) * (a ? (o.action === "join" ? 0.75 : 1.1) : (o.action === "join" ? 1.2 : 1));
      return [1, SAVE_T[o.type] * (a ? 1.15 : 1) * n("s"), PLAN_T[o.type] * (a ? 1.35 : 1) * n("p"), act * n("x"), (o.timing === "session" ? 0.7 : 0.55) * n("k")];
    });
    return { i, id: o.id, o, z, c, w, k, marketKind, bookable, party: o.suit.includes("family") || o.suit.includes("kids") ? 2.2 : 1.4 };
  });
  const OBJ = byId(OBJS);
  const EXP_TYPES = new Set(["experience", "event", "activity", "recurring"]);

  /* groups: one per (area, category) that has content */
  const GKEY = new Map(), GROUPS = [];
  OBJS.forEach((ob) => {
    const key = ob.z * NC + ob.c;
    if (!GKEY.has(key)) { GKEY.set(key, GROUPS.length); GROUPS.push({ z: ob.z, c: ob.c, objs: [] }); }
    GROUPS[GKEY.get(key)].objs.push(ob);
  });
  const G = GROUPS.length;
  /* per group and audience: the weight, the funnel rates and the share of each record in each step */
  const OM = 5;   /* object steps: view, save, plan, action, complete */
  GROUPS.forEach((g) => {
    g.W = [0, 1].map((a) => g.objs.reduce((s, ob) => s + ob.w[a], 0));
    g.rate = [0, 1].map((a) => [1, 2, 3].map((m) => g.objs.reduce((s, ob) => s + ob.w[a] * ob.k[a][m], 0) / g.W[a]));
    g.comp = [0, 1].map((a) => g.objs.reduce((s, ob) => s + ob.w[a] * ob.k[a][2] * ob.k[a][4], 0) / g.objs.reduce((s, ob) => s + ob.w[a] * ob.k[a][2], 0));
    g.share = [0, 1].map((a) => {
      const sums = [0, 1, 2, 3, 4].map((m) => g.objs.reduce((s, ob) => s + ob.w[a] * (m === 4 ? ob.k[a][2] * ob.k[a][4] : ob.k[a][m]), 0));
      return g.objs.map((ob) => [0, 1, 2, 3, 4].map((m) => (ob.w[a] * (m === 4 ? ob.k[a][2] * ob.k[a][4] : ob.k[a][m])) / sums[m]));
    });
    /* booking value and service requests per action, from the records that carry them */
    g.vpa = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][3] * (ob.bookable ? ob.o.price * ob.party * 0.64 : 0), 0));
    g.bpa = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][3] * (ob.bookable ? 0.64 : 0), 0));
    g.spa = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][3] * (ob.marketKind === "service" ? 1 : 0), 0));
    g.epa = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][3] * (ob.marketKind === "experience" ? 1 : 0), 0));
    /* experiences, events, activities and recurring groups (real and illustrative): their actions and views */
    g.xpa = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][3] * (EXP_TYPES.has(ob.o.type) ? 1 : 0), 0));
    g.vpe = [0, 1].map((a) => g.objs.reduce((s, ob, j) => s + g.share[a][j][0] * (EXP_TYPES.has(ob.o.type) ? 1 : 0), 0));
  });

  /* ── the daily facts ──
     U user-days · N new users · S sessions · Q searches · V detail views · SV saves · P added to My Plan
     X actions (directions, join, register, book, request, redeem) · K completed plan items */
  const M = { U: 0, N: 1, S: 2, Q: 3, V: 4, SV: 5, P: 6, X: 7, K: 8 };
  const NM = 9;
  const CUBE = new Int32Array(DAYS * G * 2 * NM);
  reseed("cube");
  const at = (d, g, a) => ((d * G + g) * 2 + a) * NM;
  const BASE_DAU = [11500, 6800], VPU = [5.2, 6.8], SPU = [0.9, 1.3], SESS = [1.5, 2.0], NEW = [0.009, 0.19];
  const UZ = new Float64Array(DAYS * NZ * 2);   /* user-days by area, for splitting what has no area of its own */
  const DAU = [new Float64Array(DAYS), new Float64Array(DAYS)];
  for (let d = 0; d < DAYS; d++) {
    for (let a = 0; a < 2; a++) {
      const total = BASE_DAU[a] * growth(d) * seasonAud(d, a) * DOW_F[a][DOW[d]] * wob(0.035);
      let norm = 0;
      const cw = new Float64Array(G);
      for (let g = 0; g < G; g++) { cw[g] = GROUPS[g].W[a] * seasonCat(GROUPS[g].c, d, a); norm += cw[g]; }
      const camp = FLAGS[d].campaign ? 1.6 : 1;
      for (let g = 0; g < G; g++) {
        const gr = GROUPS[g], o = at(d, g, a);
        const u = total * cw[g] / norm * wob(0.12);
        const U = sr(u);
        const V = sr(u * VPU[a] * wob(0.08));
        const drift = 1 + 0.06 * Math.sin((d + g * 17) / 58);
        const P = sr(V * gr.rate[a][1] * drift * wob(0.1));
        CUBE[o] = U;
        CUBE[o + 1] = sr(u * NEW[a] * camp * wob(0.2));
        CUBE[o + 2] = sr(u * SESS[a] * wob(0.06));
        CUBE[o + 3] = sr(u * SPU[a] * wob(0.1));
        CUBE[o + 4] = V;
        CUBE[o + 5] = sr(V * gr.rate[a][0] * drift * wob(0.1));
        CUBE[o + 6] = P;
        CUBE[o + 7] = sr(V * gr.rate[a][2] * wob(0.1));
        CUBE[o + 8] = sr(P * gr.comp[a] * wob(0.08));
        UZ[(d * NZ + gr.z) * 2 + a] += U;
        DAU[a][d] += U;
      }
    }
  }

  /* ── Market products (opened 1 February 2026) ── */
  const PROD_CAT = { dates: "market", gifts: "market", scents: "market", crafts: "craft" };
  const PROD_PREF = { "PRD-01": [0.9, 1.6], "PRD-02": [0.6, 1.3], "PRD-03": [1.4, 0.5], "PRD-04": [0.5, 1.1], "PRD-05": [0.3, 0.9],
    "PRD-06": [0.5, 0.6], "PRD-07": [0.4, 0.35], "PRD-08": [0.6, 0.3], "PRD-09": [1.1, 0.7], "PRD-10": [0.3, 0.65] };
  const PRODUCTS = C.products.map((p, i) => ({ ...p, i, catApp: PROD_CAT[p.cat] }));
  const NP = PRODUCTS.length;
  const PCUBE = new Int32Array(DAYS * NP * 2 * 3);   /* views, requests, units */
  reseed("products");
  for (let d = 0; d < DAYS; d++) {
    const r = ramp(d, LAUNCH.market, 75);
    if (!r) continue;
    const SP = CM.seasonalProduct, inSeason = !SP || (MONTH[d] >= SP.fromMonth && MONTH[d] <= SP.toMonth);   /* a seasonal product sells only in its season, as the app says */
    for (let p = 0; p < NP; p++) for (let a = 0; a < 2; a++) {
      const pr = PRODUCTS[p];
      if (SP && pr.id === SP.id && !inSeason) continue;
      const lift = FLAGS[d].last10 || FLAGS[d].eidFitr ? 1.6 : FLAGS[d].postHajj && a ? 1.35 : 1;
      const req = DAU[a][d] * (a ? 0.0042 : 0.0016) * PROD_PREF[pr.id][a] * r * lift * wob(0.18);
      const o = ((d * NP + p) * 2 + a) * 3;
      const R2 = sr(req);
      PCUBE[o] = sr(req / (0.15 * logn(pr.id, 0.15)));
      PCUBE[o + 1] = R2;
      PCUBE[o + 2] = R2 + sr(R2 * (pr.cat === "dates" ? (a ? 0.75 : 0.45) : 0.3));
    }
  }

  /* ── City Opportunities (opened 1 May 2026): homes and business opportunities ── */
  const CITY = C.homes.map((h) => ({ ...h, kind: "home", z: zoneOf(h.nb) }))
    .concat(C.opportunities.map((o) => ({ ...o, kind: "opp", z: zoneOf(o.nb) })));
  const CITY_PREF = { rent: [1.3, 0.35], sale: [0.9, 0.12], own: [0.9, 0.12], furnished: [0.55, 1.25], stay: [0.55, 1.25], commercial: [0.6, 0.18], hospitality: [0.5, 0.35], retail: [0.6, 0.15], food: [0.75, 0.3], development: [0.45, 0.12], tourism: [0.5, 0.4] };
  const NCI = CITY.length;
  const CCUBE = new Int32Array(DAYS * NCI * 2 * 2);   /* item views, requests (details or interest) */
  reseed("city");
  const CHIPS = new Int32Array(DAYS * NZ * 2);        /* Live in the city: area chip taps */
  const CHIP_PREF = CM.chipPref;
  for (let d = 0; d < DAYS; d++) {
    const r = ramp(d, LAUNCH.city, 60);
    if (!r) continue;
    for (let a = 0; a < 2; a++) {
      const sec = DAU[a][d] * (a ? 0.012 : 0.018) * r;
      CITY.forEach((it, j) => {
        const pref = CITY_PREF[it.kind === "home" ? it.deal : it.cat][a];
        const v = sec * pref * 0.24 * wob(0.15);
        const o = ((d * NCI + j) * 2 + a) * 2;
        CCUBE[o] = sr(v);
        CCUBE[o + 1] = sr(v * (it.kind === "home" ? 0.085 : 0.06) * logn(it.id, 0.2));
      });
      for (let z = 0; z < HOMEZ; z++) CHIPS[(d * NZ + z) * 2 + a] = sr(sec * 0.09 * CHIP_PREF[a][ZONES[z].id] * wob(0.15));
    }
  }

  /* ── Community: the 47 communities people post in (the 8 families are their groupings) ── */
  const COMM_CAT = { "local-food": "food", cafes: "cafe", "new-openings": "food", "family-dining": "food", heritage: "heritage", "old-madinah": "heritage", "makkah-old": "heritage", craft: "craft",
    museums: "culture", "photo-c": "craft", "visitor-service": "volunteer", "haram-service": "volunteer", "neighborhood-init": "volunteer", "health-vol": "volunteer", "env-vol": "volunteer", students: "learn",
    workshops: "learn", clubs: "learn", "kids-learning": "family", families: "family", market: "market", sport: "sport", newcomers: "services", "services-c": "services", "quiet-club": "learn",
    campaigns: "heritage", "first-umrah": "heritage", "hajj-logistics": "services", "after-umrah": "heritage" };
  const COMM_VIS = { visitors: 0.75, hajj: 0.7, food: 0.35, culture: 0.4, volunteer: 0.15, learn: 0.12, living: 0.08, hoods: 0.12 };
  const COMMS = C.communities.filter((c) => c.kind !== "family").map((c, i) => ({ ...c, i, z: c.nb ? zoneOf(c.nb) : ZI.cw, cat: COMM_CAT[c.id] || null, vis: COMM_VIS[c.family] ?? 0.2 }));
  const NCO = COMMS.length;
  const KCUBE = new Int32Array(DAYS * NCO * 2 * 5);
  reseed("community");
  COMMS.forEach((cm, j) => {
    const g = Math.max(40, cm.members);
    for (let d = 0; d < DAYS; d++) for (let a = 0; a < 2; a++) {
      const share = a ? cm.vis : 1 - cm.vis;
      const act = g * 0.0042 * share * growth(d) * seasonAud(d, a) * DOW_F[a][DOW[d]] * (FLAGS[d].ramadan && cm.family === "volunteer" ? 1.8 : 1) * wob(0.22);
      const o = ((d * NCO + j) * 2 + a) * 5;
      const posts = sr(act);
      const q = sr(posts * (a ? 0.62 : 0.3));
      KCUBE[o] = posts;
      KCUBE[o + 4] = Math.min(posts, q);
      KCUBE[o + 1] = sr(Math.min(posts, q) * (a ? 0.4 : 1.55) * wob(0.15));
      KCUBE[o + 2] = sr(g * 0.0011 * share * growth(d) * seasonAud(d, a) * (FLAGS[d].campaign ? 1.5 : 1) * wob(0.25));
      KCUBE[o + 3] = sr(posts * 2.6 * wob(0.2));
    }
  });
  /* the post mix: residents recommend and answer, visitors ask (the app's contribution types) */
  const POST_MIX = [
    { recommendation: 0.21, tip: 0.17, update: 0.16, experience_report: 0.15, question: 0.17, photo: 0.07, post_story: 0.07 },
    { question: 0.46, experience_report: 0.17, tip: 0.1, recommendation: 0.08, photo: 0.11, post_story: 0.05, update: 0.03 },
  ];

  /* ── Visitor Centers (illustrative operations: the app has no centres; all figures are demo) ── */
  const CENTERS = CM.centers.map((c, i) => ({ ...c, i, z: zoneOf(c.nb) }));
  const NV = CENTERS.length;
  /* served · wait minutes (sum) · service minutes (sum) · CSAT answers · CSAT points · solved at first contact · within 10 min · escalated */
  const VCUBE = new Float64Array(DAYS * NV * 2 * 8);
  reseed("centers");
  CENTERS.forEach((ce, j) => {
    for (let d = 0; d < DAYS; d++) {
      const load = ce.base * (0.55 + 0.45 * growth(d)) * seasonAud(d, 1) * DOW_F[1][DOW[d]] * wob(0.08);
      const util = load / (ce.desks * 45);
      const wait = 2.4 + 7 * util * util * wob(0.12);
      const svc = 6.4 * wob(0.08);
      const csat = Math.max(3.4, Math.min(4.9, 4.7 - 0.045 * Math.max(0, wait - 4) + 0.035 * nrm()));
      const sla = Math.max(0.5, Math.min(0.99, 1 - 0.028 * Math.max(0, wait - 3) + 0.012 * nrm()));
      for (let a = 0; a < 2; a++) {
        const served = sr(load * (a ? 0.88 : 0.12));
        const o = ((d * NV + j) * 2 + a) * 8;
        VCUBE[o] = served;
        VCUBE[o + 1] = served * wait;
        VCUBE[o + 2] = served * svc * (a ? 1.05 : 0.85);
        const ans = sr(served * 0.22);
        VCUBE[o + 3] = ans;
        VCUBE[o + 4] = ans * Math.min(5, csat + (a ? 0 : 0.06));
        VCUBE[o + 5] = sr(served * (0.86 - 0.012 * Math.max(0, wait - 6)));
        VCUBE[o + 6] = sr(served * sla);
        VCUBE[o + 7] = sr(served * 0.035);
      }
    }
  });
  const VC_TOPICS = [
    { id: "ziyarah", name: CM.vcZiyarah, mix: [0.12, 0.24] },
    { id: "directions", name: { ar: "الاتجاهات والتنقل", en: "Directions and getting around" }, mix: [0.14, 0.2] },
    { id: "transport", name: { ar: "النقل والحافلات", en: "Transport and buses" }, mix: [0.1, 0.12] },
    { id: "stays", name: { ar: "الإقامة والسكن", en: "Stays and accommodation" }, mix: [0.06, 0.1] },
    { id: "app", name: { ar: "مساعدة في تطبيق " + RC.terms.app.ar, en: "Help with the " + RC.terms.app.en + " app" }, mix: [0.2, 0.11] },
    { id: "experiences", name: { ar: "التجارب والفعاليات", en: "Experiences and events" }, mix: [0.18, 0.08] },
    { id: "lost", name: { ar: "المفقودات", en: "Lost and found" }, mix: [0.06, 0.07] },
    { id: "access", name: { ar: "خدمات كبار السن وذوي الإعاقة", en: "Older people and accessibility" }, mix: [0.14, 0.08] },
  ];
  const VC_LANGS = [
    { id: "ar", name: { ar: "العربية", en: "Arabic" }, share: 0.47 }, { id: "ur", name: { ar: "الأردية", en: "Urdu" }, share: 0.14 },
    { id: "id", name: { ar: "الإندونيسية", en: "Indonesian" }, share: 0.12 }, { id: "en", name: { ar: "الإنجليزية", en: "English" }, share: 0.11 },
    { id: "tr", name: { ar: "التركية", en: "Turkish" }, share: 0.06 }, { id: "ms", name: { ar: "الملايوية", en: "Malay" }, share: 0.05 },
    { id: "fr", name: { ar: "الفرنسية", en: "French" }, share: 0.05 },
  ];

  /* ── Offers: the app's 64 offers, counted only while each one runs (all start on 1 September 2026) ── */
  const OFFERS = C.offers.map((of, i) => ({ ...of, i, ob: OBJ[of.obj], d0: Math.max(0, idx(of.start)), d1: Math.min(DAYS - 1, idx(of.end)), ends: idx(of.end) }));
  const NO = OFFERS.length;
  const OCUBE = new Int32Array(DAYS * NO * 2 * 3);   /* impressions, opens, redemptions */
  reseed("offers");
  OFFERS.forEach((of, j) => {
    const ob = of.ob;
    for (let d = of.d0; d <= of.d1; d++) for (let a = 0; a < 2; a++) {
      const base = DAU[a][d] * 0.0085 * ob.w[a] / 2.2 * (of.exclusive ? 1.35 : 1) * (of.when === "weekend" && (DOW[d] >= 4) ? 1.4 : 1) * wob(0.15);
      const o = ((d * NO + j) * 2 + a) * 3;
      const imp = sr(base * 9), op = sr(base * 1.1);
      OCUBE[o] = imp; OCUBE[o + 1] = op;
      OCUBE[o + 2] = sr(op * (of.kind === "percent" ? 0.16 : of.kind === "package" ? 0.11 : 0.13) * (a ? 1.1 : 1));
    }
  });

  /* ── Partners and operators: the app's illustrative providers and the illustrative venues that
        carry offers. Public institutions in the app are never shown as partners. ── */
  const TIERS = [
    { id: "basic", fee: 0, name: { ar: "أساسية", en: "Basic" } },
    { id: "plus", fee: 299, name: { ar: "بلس", en: "Plus" } },
    { id: "pro", fee: 799, name: { ar: "برو", en: "Pro" } },
  ];
  const COMMUNITY_OPS = new Set(["vol-hadiyah", "vol-hayy", "club-qira", "club-photo", "club-mashy"]);
  const PARTNERS = [];
  C.providers.filter((p) => !p.real).forEach((p) => {
    const objs = OBJS.filter((ob) => ob.o.provider === p.id);
    const community = COMMUNITY_OPS.has(p.id);
    const tier = community ? 0 : u01(p.id + "tier") < 0.45 ? 2 : 1;
    PARTNERS.push({ id: p.id, kind: community ? "community" : "operator", name: p.name, role: p.kind, objs, offers: [], tier,
      since: Math.floor(30 + u01(p.id + "on") * 690), z: objs.length ? objs[0].z : ZI.cw, c: objs.length ? objs[0].c : CI.services });
  });
  OFFERS.forEach((of) => {
    const ob = of.ob;
    if (PARTNERS.some((p) => p.objs.includes(ob))) { PARTNERS.find((p) => p.objs.includes(ob)).offers.push(of); return; }
    PARTNERS.push({ id: "venue-" + ob.id, kind: "venue", name: ob.o.name, role: null, objs: [ob], offers: [of], tier: of.exclusive ? 2 : u01(ob.id + "t") < 0.55 ? 1 : 0,
      since: Math.floor(40 + u01(ob.id + "on") * (LAUNCH.offers - 41)), z: ob.z, c: ob.c });   /* every venue joins before its offer starts */
  });
  PARTNERS.forEach((p, i) => {
    p.i = i;
    p.response = +(p.kind === "community" ? 3 + u01(p.id + "r") * 9 : 0.6 + u01(p.id + "r") * 5.4).toFixed(1);
    p.accept = p.kind === "community" ? null : +(0.82 + u01(p.id + "a") * 0.16).toFixed(3);
    p.cancel = p.kind === "community" ? null : +(0.02 + u01(p.id + "c") * 0.06).toFixed(3);
  });
  const ROLE_VENUE = { food: { ar: "مطعم", en: "Restaurant" }, cafe: { ar: "مقهى", en: "Café" }, stay: { ar: "إقامة", en: "Stay" }, market: { ar: "متجر وسوق", en: "Shop and market" },
    services: { ar: "خدمة", en: "Service" }, family: { ar: "ترفيه عائلي", en: "Family venue" }, heritage: { ar: "بيت تراثي", en: "Heritage house" }, sport: { ar: "صالة رياضية", en: "Sports hall" } };
  PARTNERS.forEach((p) => { if (!p.role) p.role = ROLE_VENUE[CATS[p.c].id] || { ar: "شريك", en: "Partner" }; });

  /* the money (all demo): commission and fees per channel */
  const FEES = { experience: 0.12, product: 0.1, serviceLead: 12, redemption: 3, placement: 20 };

  /* ══════════════ queries ══════════════ */
  const PERIODS = [
    { id: "7d", name: { ar: "آخر ٧ أيام", en: "Last 7 days" }, days: 7, gran: "day" },
    { id: "30d", name: { ar: "آخر ٣٠ يومًا", en: "Last 30 days" }, days: 30, gran: "day" },
    { id: "90d", name: { ar: "آخر ٩٠ يومًا", en: "Last 90 days" }, days: 90, gran: "week" },
    { id: "12m", name: { ar: "آخر ١٢ شهرًا", en: "Last 12 months" }, from: "2025-11-01", to: "2026-10-27", prevFrom: "2024-11-01", prevTo: "2025-10-27", gran: "month" },
    { id: "ramadan", name: { ar: "رمضان ١٤٤٧هـ", en: "Ramadan 1447 AH" }, from: "2026-02-18", to: "2026-03-19", prevFrom: "2025-03-01", prevTo: "2025-03-29", gran: "day",
      prevName: { ar: "رمضان ١٤٤٦هـ", en: "Ramadan 1446 AH" } },
  ];
  const PERIOD = byId(PERIODS);
  function range(pid) {
    const p = PERIOD[pid] || PERIOD["30d"];
    if (p.from) return { p, d0: idx(p.from), d1: idx(p.to), p0: idx(p.prevFrom), p1: idx(p.prevTo), gran: p.gran };
    const d1 = DAYS - 1, d0 = d1 - p.days + 1;
    return { p, d0, d1, p0: d0 - p.days, p1: d0 - 1, gran: p.gran };
  }
  /* buckets for a trend: days, weeks counted back from the end, or calendar months */
  function buckets(d0, d1, gran) {
    const out = [];
    if (gran === "day") for (let d = d0; d <= d1; d++) out.push({ a: d, b: d });
    else if (gran === "week") { for (let e = d1; e >= d0; e -= 7) out.unshift({ a: Math.max(d0, e - 6), b: e }); }
    else {
      let a = d0;
      while (a <= d1) {
        const dt = new Date(START + a * DAY), next = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1);
        const b = Math.min(d1, Math.round((next - START) / DAY) - 1);
        out.push({ a, b }); a = b + 1;
      }
    }
    return out;
  }
  /* how many days, on average, one person is active within a window of L days */
  const freq = (L, a) => (a ? 1 + 3.2 * (1 - Math.exp(-(L - 1) / 6)) : 1 + 0.32 * Math.pow(Math.max(0, L - 1), 0.82));

  function masks(f) {
    const zm = new Uint8Array(NZ), cm = new Uint8Array(NC), am = new Uint8Array(2);
    for (let z = 0; z < NZ; z++) zm[z] = f.area === "all" || ZONES[z].id === f.area ? 1 : 0;
    for (let c = 0; c < NC; c++) cm[c] = f.category === "all" || CATS[c].id === f.category ? 1 : 0;
    am[0] = f.audience === "visitor" ? 0 : 1; am[1] = f.audience === "resident" ? 0 : 1;
    return { zm, cm, am };
  }

  const cache = new Map();
  const remember = (key, fn) => { if (!cache.has(key)) { if (cache.size > 400) cache.clear(); cache.set(key, fn()); } return cache.get(key); };
  const fkey = (f) => [f.period, f.area, f.category, f.audience].join("|");

  /* the main cube over a day window: totals, by area, category, audience, group and day */
  function cubeAgg(f, d0, d1) {
    return remember("cube|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const { zm, cm, am } = masks(f);
      const tot = new Float64Array(NM + 6), byZ = Array.from({ length: NZ }, () => new Float64Array(NM + 6)),
        byC = Array.from({ length: NC }, () => new Float64Array(NM + 6)), byA = [new Float64Array(NM + 6), new Float64Array(NM + 6)],
        byGA = Array.from({ length: G }, () => [new Float64Array(NM), new Float64Array(NM)]),
        days = d1 - d0 + 1, byD = [Array.from({ length: NM + 6 }, () => new Float64Array(days)), Array.from({ length: NM + 6 }, () => new Float64Array(days))];
      for (let g = 0; g < G; g++) {
        const gr = GROUPS[g];
        if (!zm[gr.z] || !cm[gr.c]) continue;
        for (let a = 0; a < 2; a++) {
          if (!am[a]) continue;
          const acc = byGA[g][a];
          for (let d = d0; d <= d1; d++) {
            const o = at(d, g, a), dd = d - d0, row = byD[a];
            for (let m = 0; m < NM; m++) { const v = CUBE[o + m]; acc[m] += v; row[m][dd] += v; }
            const x = CUBE[o + 7];
            row[NM][dd] += x * gr.vpa[a]; row[NM + 1][dd] += x * gr.bpa[a]; row[NM + 2][dd] += x * gr.spa[a]; row[NM + 3][dd] += x * gr.epa[a];
            row[NM + 4][dd] += x * gr.xpa[a]; row[NM + 5][dd] += CUBE[o + 4] * gr.vpe[a];
          }
          const ext = [acc[7] * gr.vpa[a], acc[7] * gr.bpa[a], acc[7] * gr.spa[a], acc[7] * gr.epa[a], acc[7] * gr.xpa[a], acc[4] * gr.vpe[a]];
          for (const t of [tot, byZ[gr.z], byC[gr.c], byA[a]]) { for (let m = 0; m < NM; m++) t[m] += acc[m]; for (let e = 0; e < 6; e++) t[NM + e] += ext[e]; }
        }
      }
      return { tot, byZ, byC, byA, byGA, byD, d0, d1, days };
    });
  }
  /* derived measures: GMV (booking value), bookings, service requests, Market experience actions,
     actions and views on experiences and activities */
  const XM = { GMV: NM, BK: NM + 1, SR: NM + 2, EX: NM + 3, XT: NM + 4, VT: NM + 5 };

  function uniques(agg) { return agg.byA[0][0] / freq(agg.days, 0) + agg.byA[1][0] / freq(agg.days, 1); }

  /* per-record totals over a window, exactly the record's share of its group's cells */
  function objectRows(f, d0, d1) {
    return remember("obj|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const agg = cubeAgg(f, d0, d1), rows = [];
      for (let g = 0; g < G; g++) {
        const gr = GROUPS[g], ga = agg.byGA[g];
        if (!ga[0][0] && !ga[1][0] && !ga[0][4] && !ga[1][4]) continue;
        gr.objs.forEach((ob, j) => {
          const r = { ob, views: 0, saves: 0, plans: 0, actions: 0, completes: 0, gmv: 0, bookings: 0, byA: [0, 0], actA: [0, 0] };
          for (let a = 0; a < 2; a++) {
            const s = gr.share[a][j], t = ga[a];
            const v = t[4] * s[0];
            r.views += v; r.saves += t[5] * s[1]; r.plans += t[6] * s[2]; r.actions += t[7] * s[3]; r.completes += t[8] * s[4]; r.byA[a] += v; r.actA[a] += t[7] * s[3];
            if (ob.bookable) { r.bookings += t[7] * s[3] * 0.64; r.gmv += t[7] * s[3] * 0.64 * ob.o.price * ob.party; }
          }
          rows.push(r);
        });
      }
      return rows;
    });
  }

  /* share of a day's user-days in the selected areas (splits what has no area of its own) */
  function zoneShareDay(d, zm, a) {
    let s = 0, t = 0;
    for (let z = 0; z < NZ; z++) { const v = UZ[(d * NZ + z) * 2 + a]; t += v; if (zm[z]) s += v; }
    return t ? s / t : 0;
  }
  function productAgg(f, d0, d1) {
    return remember("prod|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const { zm, am } = masks(f);
      const rows = PRODUCTS.map((p) => ({ p, views: 0, requests: 0, units: 0, gmv: 0, byA: [0, 0] })), byD = new Float64Array(d1 - d0 + 1), byDg = new Float64Array(d1 - d0 + 1);
      const allZ = f.area === "all";
      for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
        if (!am[a]) continue;
        const zs = allZ ? 1 : zoneShareDay(d, zm, a);
        if (!zs) continue;
        for (let p = 0; p < NP; p++) {
          if (f.category !== "all" && PRODUCTS[p].catApp !== f.category) continue;
          const o = ((d * NP + p) * 2 + a) * 3, r = rows[p];
          const req = PCUBE[o + 1] * zs, un = PCUBE[o + 2] * zs;
          r.views += PCUBE[o] * zs; r.requests += req; r.units += un; r.gmv += un * PRODUCTS[p].price; r.byA[a] += req;
          byD[d - d0] += req; byDg[d - d0] += un * PRODUCTS[p].price;
        }
      }
      return { rows, byD, byDg, tot: rows.reduce((s, r) => ({ views: s.views + r.views, requests: s.requests + r.requests, units: s.units + r.units, gmv: s.gmv + r.gmv }), { views: 0, requests: 0, units: 0, gmv: 0 }) };
    });
  }
  function cityAgg(f, d0, d1) {
    return remember("city|" + [f.area, f.audience, d0, d1].join("|"), () => {
      const { zm, am } = masks(f);
      const rows = CITY.map((it) => ({ it, views: 0, requests: 0, byA: [0, 0], viewsA: [0, 0] })), chips = new Float64Array(NZ), chipsA = Array.from({ length: NZ }, () => [0, 0]);
      const days = d1 - d0 + 1, byD = { home: new Float64Array(days), opp: new Float64Array(days) };
      for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
        if (!am[a]) continue;
        CITY.forEach((it, j) => {
          if (!zm[it.z]) return;
          const o = ((d * NCI + j) * 2 + a) * 2, r = rows[j];
          r.views += CCUBE[o]; r.requests += CCUBE[o + 1]; r.byA[a] += CCUBE[o + 1]; r.viewsA[a] += CCUBE[o]; byD[it.kind][d - d0] += CCUBE[o + 1];
        });
        for (let z = 0; z < HOMEZ; z++) if (zm[z]) { const v = CHIPS[(d * NZ + z) * 2 + a]; chips[z] += v; chipsA[z][a] += v; }
      }
      return { rows, chips, chipsA, byD };
    });
  }
  function communityAgg(f, d0, d1) {
    return remember("comm|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const { zm, am } = masks(f);
      const rows = COMMS.map((cm) => ({ cm, posts: 0, answers: 0, joins: 0, helpful: 0, questions: 0, byA: [0, 0], postsA: [0, 0] })), days = d1 - d0 + 1;
      const byD = [new Float64Array(days), new Float64Array(days)], byFam = {};
      COMMS.forEach((cm, j) => {
        if (!zm[cm.z]) return;
        if (f.category !== "all" && cm.cat !== f.category) return;
        const r = rows[j], fam = byFam[cm.family] || (byFam[cm.family] = new Float64Array(days));
        for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
          if (!am[a]) continue;
          const o = ((d * NCO + j) * 2 + a) * 5;
          fam[d - d0] += KCUBE[o];
          r.posts += KCUBE[o]; r.answers += KCUBE[o + 1]; r.joins += KCUBE[o + 2]; r.helpful += KCUBE[o + 3]; r.questions += KCUBE[o + 4];
          r.postsA[a] += KCUBE[o]; byD[a][d - d0] += KCUBE[o];
        }
      });
      return { rows: rows.filter((r) => zm[r.cm.z] && (f.category === "all" || r.cm.cat === f.category)), byD, byFam };
    });
  }
  function centerAgg(f, d0, d1) {
    return remember("vc|" + [f.area, f.audience, d0, d1].join("|"), () => {
      const { zm, am } = masks(f);
      const rows = CENTERS.map((ce) => ({ ce, v: new Float64Array(8), byA: [0, 0] })), days = d1 - d0 + 1;
      const byD = Array.from({ length: 8 }, () => new Float64Array(days)), perDay = CENTERS.map(() => Array.from({ length: days }, () => new Float64Array(8)));
      CENTERS.forEach((ce, j) => {
        if (!zm[ce.z]) return;
        for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
          if (!am[a]) continue;
          const o = ((d * NV + j) * 2 + a) * 8;
          for (let m = 0; m < 8; m++) { const v = VCUBE[o + m]; rows[j].v[m] += v; byD[m][d - d0] += v; perDay[j][d - d0][m] += v; }
          rows[j].byA[a] += VCUBE[o];
        }
      });
      const tot = new Float64Array(8);
      rows.forEach((r) => r.v.forEach((v, m) => (tot[m] += v)));
      return { rows: rows.filter((r) => zm[r.ce.z]), tot, byD, perDay };
    });
  }
  function offerAgg(f, d0, d1) {
    return remember("off|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const { zm, cm, am } = masks(f);
      const rows = [], days = d1 - d0 + 1, byD = new Float64Array(days), placement = new Float64Array(days);
      OFFERS.forEach((of, j) => {
        if (!zm[of.ob.z] || !cm[of.ob.c]) return;
        const r = { of, imp: 0, opens: 0, red: 0, liveDays: 0 };
        for (let d = Math.max(d0, of.d0); d <= Math.min(d1, of.d1); d++) {
          r.liveDays++;
          if (of.exclusive) placement[d - d0] += FEES.placement;
          for (let a = 0; a < 2; a++) {
            if (!am[a]) continue;
            const o = ((d * NO + j) * 2 + a) * 3;
            r.imp += OCUBE[o]; r.opens += OCUBE[o + 1]; r.red += OCUBE[o + 2]; byD[d - d0] += OCUBE[o + 2];
          }
        }
        rows.push(r);
      });
      return { rows, byD, placement };
    });
  }
  /* partner subscriptions accrue daily from the day a partner joined; split by audience like its views */
  function subscriptions(f, d0, d1) {
    return remember("subs|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const { zm, cm } = masks(f), days = d1 - d0 + 1, byD = new Float64Array(days);
      let total = 0, active = 0;
      PARTNERS.forEach((p) => {
        if (!zm[p.z] || !cm[p.c]) return;
        const fee = TIERS[p.tier].fee / 30.4;
        const aud = f.audience === "all" ? 1 : p.objs.length ? p.objs.reduce((s, ob) => s + ob.w[f.audience === "visitor" ? 1 : 0], 0) / p.objs.reduce((s, ob) => s + ob.w[0] + ob.w[1], 0) : 0.5;
        if (p.since <= d1) active++;
        for (let d = Math.max(d0, p.since); d <= d1; d++) { byD[d - d0] += fee * aud; total += fee * aud; }
      });
      return { byD, total, active };
    });
  }
  /* revenue by channel and day (all demo) */
  function revenue(f, d0, d1) {
    return remember("rev|" + [f.area, f.category, f.audience, d0, d1].join("|"), () => {
      const agg = cubeAgg(f, d0, d1), pr = productAgg(f, d0, d1), of = offerAgg(f, d0, d1), sb = subscriptions(f, d0, d1), days = d1 - d0 + 1;
      const ch = { experience: new Float64Array(days), product: new Float64Array(days), service: new Float64Array(days), offers: new Float64Array(days), subscriptions: new Float64Array(days) };
      for (let i = 0; i < days; i++) {
        ch.experience[i] = (agg.byD[0][XM.GMV][i] + agg.byD[1][XM.GMV][i]) * FEES.experience;
        ch.product[i] = pr.byDg[i] * FEES.product;
        ch.service[i] = (agg.byD[0][XM.SR][i] + agg.byD[1][XM.SR][i]) * FEES.serviceLead;
        ch.offers[i] = of.byD[i] * FEES.redemption + (f.audience === "all" ? of.placement[i] : of.placement[i] * 0.5);
        ch.subscriptions[i] = sb.byD[i];
      }
      const sum = (a) => a.reduce((s, v) => s + v, 0);
      const totals = Object.fromEntries(Object.entries(ch).map(([k, v]) => [k, sum(v)]));
      const gmv = agg.tot[XM.GMV] + pr.tot.gmv;
      return { ch, totals, total: Object.values(totals).reduce((s, v) => s + v, 0), gmv, expGmv: agg.tot[XM.GMV], prodGmv: pr.tot.gmv };
    });
  }
  /* a smooth monthly revenue target for the demo plan */
  function revenueTarget(f, d0, d1) {
    const r = revenue(f, d0, d1);
    return buckets(d0, d1, "month").map((b, i) => {
      let s = 0;
      for (const v of Object.values(r.ch)) for (let d = b.a; d <= b.b; d++) s += v[d - d0];
      return { b, actual: s, target: s * (0.94 + 0.16 * u01("target" + b.a + f.area + f.category + f.audience)) };
    });
  }

  /* weekday × hour activity, from the sessions in the window (Ramadan shifts to the night) */
  const HOURS = {
    resident: [0.6, 0.35, 0.2, 0.12, 0.15, 0.35, 0.8, 1.2, 1.5, 1.7, 1.75, 1.6, 1.3, 1.35, 1.4, 1.35, 1.55, 1.9, 2.1, 2.3, 2.6, 2.7, 2.3, 1.4],
    visitor: [0.9, 0.55, 0.35, 0.5, 1.1, 1.5, 1.8, 2.0, 2.0, 1.8, 1.6, 1.3, 1.0, 1.1, 1.25, 1.2, 1.3, 1.5, 1.7, 1.9, 2.2, 2.4, 2.2, 1.6],
    ramadan: [2.2, 2.4, 2.1, 1.6, 0.8, 0.4, 0.35, 0.5, 0.7, 0.8, 0.85, 0.8, 0.75, 0.8, 0.85, 0.95, 1.05, 1.2, 0.9, 1.6, 2.4, 2.9, 3.0, 2.6],
  };
  Object.values(HOURS).forEach((h) => { const s = h.reduce((x, y) => x + y, 0); h.forEach((v, i) => (h[i] = v / s)); });
  function heat(f, d0, d1) {
    const agg = cubeAgg(f, d0, d1), out = Array.from({ length: 7 }, () => new Float64Array(24));
    for (let d = d0; d <= d1; d++) for (let a = 0; a < 2; a++) {
      const s = agg.byD[a][M.S][d - d0];
      if (!s) continue;
      const prof = FLAGS[d].ramadan ? HOURS.ramadan : a ? HOURS.visitor : HOURS.resident, row = out[DOW[d]];
      const fri = DOW[d] === 5;
      for (let h = 0; h < 24; h++) row[h] += s * prof[h] * (fri && h >= 11 && h <= 13 ? 0.55 : fri && h >= 14 && h <= 17 ? 1.2 : 1);
    }
    return out;
  }

  /* weekly cohorts of new users and how many come back */
  function cohorts(f, d1) {
    const RET = [[1, 0.58, 0.49, 0.45, 0.42, 0.4, 0.38, 0.37], [1, 0.21, 0.12, 0.09, 0.075, 0.065, 0.06, 0.055]];
    const rows = [];
    for (let k = 7; k >= 0; k--) {
      const b1 = d1 - k * 7, b0 = b1 - 6;
      if (b0 < 0) continue;
      const agg = cubeAgg(f, b0, b1);
      const nA = [agg.byA[0][M.N], agg.byA[1][M.N]], size = nA[0] + nA[1];
      const weeks = [];
      for (let w = 0; w <= k; w++) {
        const r = (nA[0] * RET[0][w] * logn("ret" + b0 + w + "r", 0.05) + nA[1] * RET[1][w] * logn("ret" + b0 + w + "v", 0.08)) / (size || 1);
        weeks.push(w === 0 ? 1 : Math.min(0.99, r));
      }
      rows.push({ start: b0, size, weeks });
    }
    return rows;
  }

  window.RuhModel = {
    C, DAYS, START, END, iso, idx, AUD, CATS, ZONES, ZI, NZ, HOMEZ, OBJS, OBJ, GROUPS, PRODUCTS, CITY, COMMS, CENTERS, VC_TOPICS, VC_LANGS, OFFERS,
    PARTNERS, TIERS, FEES, EXP_TYPES, NM, PERIODS, PERIOD, LAUNCH, SEASONS, FLAGS, DOW, POST_MIX, M, XM, ZONE_OF_DISTRICT,
    range, buckets, freq, fkey, cubeAgg, uniques, objectRows, productAgg, cityAgg, communityAgg, centerAgg, offerAgg, subscriptions, revenue, revenueTarget,
    heat, cohorts, u01, logn,
  };
})();
