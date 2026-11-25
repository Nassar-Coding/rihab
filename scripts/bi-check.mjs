/* QA for Rihab Business Intelligence — one city at a time, on the built site (.out/bi).
   1. The model: every breakdown adds up to its total (areas, categories, audiences, days, records,
      channels), a filtered slice equals the matching row of the unfiltered view, every load gives
      the same numbers, and the content snapshot matches the app.
   2. The browser: the entry flow (welcome → language → sign-in, a wrong password, sign-out); every
      dashboard in Arabic and English under every period and a set of filter combinations — no
      errors, no NaN/undefined, no overflow, the right language only, the demo labels where they
      belong; the same figure on every dashboard that shows it; filters, deep links, the map,
      table views, CSV export, Ask the data; and seven viewports from 360 to 1920 px.
   The entry is the Rihab BI sign-in at the site root; a city's dashboards are at /<city>/.
   Usage: node scripts/bi-check.mjs makkah|madinah [--dir .out/bi] [--quick] [--verbose] */
import http from "node:http";
import vm from "node:vm";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { launch as launchBrowser } from "./lib/browser.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const CITY = args[0];
if (!["makkah", "madinah"].includes(CITY)) { console.error("usage: node scripts/bi-check.mjs makkah|madinah [--quick] [--verbose]"); process.exit(2); }
const DIR = resolve(args.includes("--dir") ? args[args.indexOf("--dir") + 1] : join(REPO, ".out", "bi"));
/* each check names an area by its role; the city supplies the area */
const A = CITY === "madinah"
  ? { quba: "quba", central: "central", uhud: "uhud", jamiah: "jamiah", kingfahd: "king-fahd", awali: "awali" }
  : { quba: "aziziyah", central: "haram-area", uhud: "misfalah", jamiah: "zahir", kingfahd: "naseem", awali: "awali" };
const CITY_ITEMS = CITY === "madinah" ? 10 : 14;   /* homes + business opportunities in the app */
const QUICK = args.includes("--quick"), VERBOSE = args.includes("--verbose");
let pass = 0;
const fails = [];
const ok = (cond, msg) => { if (cond) pass++; else { fails.push(msg); if (VERBOSE) console.log("  ✗ " + msg); } };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ═════════ 1. the model ═════════ */
function loadModel() {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const f of [`${CITY}/city.js`, `${CITY}/data/content.js`, "shared/js/model.js"]) vm.runInContext(readFileSync(join(DIR, f), "utf8"), ctx, { filename: f });
  return ctx.window.RuhModel;
}
const M = loadModel();
const M2 = loadModel();
{
  const sum = (arr, k) => arr.reduce((s, x) => s + (k ? x[k] : x), 0);
  const fp = (m) => { const f = { area: "all", category: "all", audience: "all" }; const r = m.range("12m"); const a = m.cubeAgg(f, 0, m.DAYS - 1); return [...a.tot].map((v) => Math.round(v)).join(",") + "|" + Math.round(m.revenue(f, r.d0, r.d1).total) + "|" + Math.round(m.centerAgg(f, 0, m.DAYS - 1).tot[0]); };
  ok(fp(M) === fp(M2), "model: two loads give the same figures");
  const AREAS = ["all", A.quba, A.central, A.uhud], CATS = ["all", "food", "heritage", "stay"], AUDS = ["all", "resident", "visitor"];
  let combos = 0;
  for (const pid of M.PERIODS.map((p) => p.id)) {
    const r = M.range(pid);
    for (const area of AREAS) for (const category of CATS) for (const audience of AUDS) {
      if (QUICK && (category === "stay" || area === A.uhud)) continue;
      combos++;
      const f = { period: pid, area, category, audience }, a = M.cubeAgg(f, r.d0, r.d1), tag = [pid, area, category, audience].join("/");
      for (let m = 0; m < a.tot.length; m++) {
        ok(near(sum(a.byZ.map((z) => z[m])), a.tot[m]), `model ${tag}: areas add up (measure ${m})`);
        ok(near(sum(a.byC.map((z) => z[m])), a.tot[m]), `model ${tag}: categories add up (measure ${m})`);
        ok(near(a.byA[0][m] + a.byA[1][m], a.tot[m]), `model ${tag}: audiences add up (measure ${m})`);
        ok(near(sum(a.byD[0][m]) + sum(a.byD[1][m]), a.tot[m], 1e-5), `model ${tag}: days add up (measure ${m})`);
      }
      const objs = M.objectRows(f, r.d0, r.d1);
      ok(near(sum(objs, "views"), a.tot[M.M.V], 1e-6) && near(sum(objs, "actions"), a.tot[M.M.X], 1e-6), `model ${tag}: records add up to views and actions`);
      ok(near(sum(objs.filter((x) => M.EXP_TYPES.has(x.ob.o.type)), "actions"), a.tot[M.XM.XT], 1e-6), `model ${tag}: experience actions match their records`);
      ok(near(sum(objs, "gmv"), a.tot[M.XM.GMV], 1e-6), `model ${tag}: booking value matches its records`);
      const rev = M.revenue(f, r.d0, r.d1);
      ok(near(sum(Object.values(rev.totals)), rev.total), `model ${tag}: revenue channels add up`);
      ok(Object.values(rev.ch).every((arr) => arr.every((v) => Number.isFinite(v) && v >= 0)), `model ${tag}: revenue is finite and not negative`);
      ok(near(M.uniques(a), a.byA[0][0] / M.freq(a.days, 0) + a.byA[1][0] / M.freq(a.days, 1)), `model ${tag}: active users = residents + visitors`);
      if (area === "all") {
        /* every slice equals the matching row of the whole */
        for (const z of [A.quba, A.central]) { const s = M.cubeAgg({ ...f, area: z }, r.d0, r.d1); ok(near(s.tot[M.M.U], a.byZ[M.ZI[z]][M.M.U]) && near(s.tot[M.M.X], a.byZ[M.ZI[z]][M.M.X]), `model ${tag}: ${z} slice = its row`); }
        const zr = M.ZONES.reduce((s, z) => s + M.revenue({ ...f, area: z.id }, r.d0, r.d1).total, 0);
        ok(near(zr, rev.total, 1e-6), `model ${tag}: revenue by area adds up`);
        const pa = M.productAgg(f, r.d0, r.d1), pz = M.ZONES.reduce((s, z) => s + M.productAgg({ ...f, area: z.id }, r.d0, r.d1).tot.requests, 0);
        ok(near(pz, pa.tot.requests, 1e-6), `model ${tag}: product requests by area add up`);
        const ca = M.communityAgg(f, r.d0, r.d1), cz = M.ZONES.reduce((s, z) => s + sum(M.communityAgg({ ...f, area: z.id }, r.d0, r.d1).rows, "posts"), 0);
        ok(near(cz, sum(ca.rows, "posts")), `model ${tag}: community posts by area add up`);
        const vc = M.centerAgg(f, r.d0, r.d1);
        ok(near(sum(vc.rows.map((x) => x.v[0])), vc.tot[0]), `model ${tag}: centres add up`);
      }
      if (category === "all") { const s = M.cubeAgg({ ...f, category: "food" }, r.d0, r.d1); ok(near(s.tot[M.M.V], a.byC[M.CATS.findIndex((c) => c.id === "food")][M.M.V]), `model ${tag}: food slice = its row`); }
      if (audience === "all") { const s0 = M.cubeAgg({ ...f, audience: "resident" }, r.d0, r.d1), s1 = M.cubeAgg({ ...f, audience: "visitor" }, r.d0, r.d1); ok(near(s0.tot[M.M.V] + s1.tot[M.M.V], a.tot[M.M.V]), `model ${tag}: residents + visitors = everyone`); }
      /* City Opportunities carries no money anywhere in the model */
      const city = M.cityAgg(f, r.d0, r.d1);
      ok(city.rows.every((x) => Object.keys(x).every((k) => !/price|gmv|revenue|value|amount|return/i.test(k))), `model ${tag}: City Opportunities has no money fields`);
    }
  }
  /* real content, both languages, and the launch dates */
  const named = (x) => x && x.ar && x.en && x.ar.trim() && x.en.trim();
  ok(M.C.objects.every((o) => named(o.name)) && M.C.districts.every((d) => named(d.name)) && M.C.categories.every((c) => named(c.name)), "content: every name exists in Arabic and English");
  ok(M.ZONES.length === 16 && M.CATS.length === 14 && M.PRODUCTS.length === 10 && M.CITY.length === CITY_ITEMS, `content: 15 home areas (+ city-wide), 14 categories, 10 products, ${CITY_ITEMS} homes and opportunities`);
  ok(M.PARTNERS.every((p) => !(M.C.providers.find((x) => x.id === p.id) || {}).real) && M.PARTNERS.every((p) => p.objs.every((ob) => !ob.o.real) || p.kind !== "venue"), "content: no public institution or real business is a partner");
  ok(M.OBJS.filter((ob) => ob.o.real).every((ob) => !ob.bookable), "content: real places earn no booking value");
  const pr0 = M.productAgg({ area: "all", category: "all", audience: "all" }, 0, M.LAUNCH.market - 1);
  ok(pr0.tot.requests === 0, "model: no product requests before the Market opened");
  const c0 = M.cityAgg({ area: "all", audience: "all" }, 0, M.LAUNCH.city - 1);
  ok(c0.rows.every((x) => x.views === 0), "model: no City Opportunities data before it opened");
  const o0 = M.offerAgg({ area: "all", category: "all", audience: "all" }, 0, M.LAUNCH.offers - 1);
  ok(o0.rows.every((x) => x.red === 0), "model: no offer redemptions before the offers started");
  const content = spawnSync(process.execPath, [join(REPO, "scripts", "bi-content.mjs"), CITY, "--check"], { encoding: "utf8" });
  ok(content.status === 0, `content: bi/${CITY}/data/content.js matches the app (` + (content.stdout || content.stderr).trim() + ")");
  console.log(`model: ${combos} filter combinations checked`);
}

/* ═════════ 2. the browser ═════════ */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = resolve(join(DIR, p));
  if (!(f === DIR || f.startsWith(DIR + sep)) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const ROOT_URL = `http://127.0.0.1:${server.address().port}/`;
const BASE = ROOT_URL + CITY + "/";
const SESSION = JSON.stringify({ uid: "local-bi-analyst", provider: "password", local: true, idToken: "local", refreshToken: "local", email: "bi@rihab.app" });
const browser = await launchBrowser();
const PAGES = ["overview", "audiences", "engagement", "community", "experiences", "market", "city", "centers", "partners", "commercial", "geography", "reports"];
const LATIN_OK = ".wm-en, .wm-mk, .lang-sw, [lang=en], [dir=ltr], .code, .sr, .user-m small";
async function open(lang, hash, vp = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(ROOT_URL);
  await page.evaluate(([l, s]) => { localStorage.setItem("rihab.bi.session.v1", s); localStorage.setItem("rihab.lang", JSON.stringify(l)); }, [lang, SESSION]);
  await page.goto(BASE + (hash || "#/overview"));
  await page.reload();
  await page.waitForSelector(".shell");
  return { ctx, page, errors };
}
const go = (page, hash) => page.evaluate((h) => { history.replaceState(null, "", h); window.dispatchEvent(new PopStateEvent("popstate")); }, hash);
/* what a rendered dashboard must and must not contain */
async function audit(page, lang) {
  return page.evaluate(({ lang, LATIN_OK }) => {
    const main = document.querySelector(".main"), txt = main.innerText;
    const walk = (re, skip) => { const bad = []; const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest(skip) || el.closest("script,style")) continue; const v = n.nodeValue.replace(/\b(CSV|PDF)\b|\b[A-Z]{2,4}-\d{2,3}\b/g, ""); if (re.test(v)) bad.push(n.nodeValue.trim().slice(0, 40)); } return bad; };
    return {
      h1: document.querySelector(".top h1")?.textContent || "",
      broken: /\bNaN\b|undefined|Infinity|\[object/.test(txt),
      errorState: !!document.querySelector(".state-view[role=alert]"),
      empty: document.querySelectorAll(".state-view[role=status]").length,
      overflow: document.documentElement.scrollWidth - innerWidth,
      emptyPanels: [...document.querySelectorAll(".panel")].filter((p) => !p.querySelector(".p-body, .p-table") || (p.querySelector(".p-body") && !p.querySelector(".p-body").innerHTML.trim())).map((p) => p.id),
      wrongScript: lang === "en" ? walk(/[؀-ۿ]/, ".wm-ar, .lang-sw, [lang=ar]") : walk(/[A-Za-z]{2,}/, LATIN_OK),
      demoTags: document.querySelectorAll("[data-demo], .demo-tag, .dot-demo").length,
      money: /ر\.س|SAR/.test(document.querySelector("#page").innerText),
      kpis: Object.fromEntries([...document.querySelectorAll("[data-kpi][data-v]")].map((k) => [k.dataset.kpi, +k.dataset.v])),
      dir: document.documentElement.dir,
    };
  }, { lang, LATIN_OK });
}

/* the entry flow: the Rihab BI sign-in and city picker at the root, then the city's dashboards */
for (const lang of ["ar", "en"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(ROOT_URL);
  await page.evaluate((l) => localStorage.setItem("rihab.lang", JSON.stringify(l)), lang);
  await page.goto(BASE); await page.waitForSelector("[data-rihab-signin]");
  ok(new URL(page.url()).pathname === "/", `entry ${lang}: a city's dashboards without a session open the Rihab BI sign-in`);
  ok((await page.evaluate(() => document.documentElement.dir)) === (lang === "ar" ? "rtl" : "ltr"), `entry ${lang}: the language sets the direction`);
  await page.fill("input[type=email]", "bi@rihab.app"); await page.fill("input[autocomplete=current-password]", "wrong-pass1");
  await page.click("[data-rihab-submit]"); await page.waitForSelector("[role=alert]");
  ok(!(await page.isVisible("[data-city]")), `entry ${lang}: a wrong password is refused with a message`);
  await page.fill("input[type=email]", "resident@rihab.app"); await page.fill("input[autocomplete=current-password]", "demo");
  await page.click("[data-rihab-submit]"); await page.waitForTimeout(1500);
  ok(!(await page.isVisible("[data-city]")), `entry ${lang}: an app account does not open the business dashboards`);
  await page.fill("input[type=email]", "bi@rihab.app"); await page.fill("input[autocomplete=current-password]", "demo");
  await page.click("[data-rihab-submit]"); await page.waitForSelector("[data-city]");
  await page.click(`[data-city=${CITY}]`); await page.waitForSelector(".shell");
  ok(new URL(page.url()).pathname === `/${CITY}/`, `entry ${lang}: the business account signs in and opens ${CITY}`);
  await page.reload(); await page.waitForSelector(".shell");
  ok((await page.evaluate(() => document.documentElement.lang)) === lang, `entry ${lang}: the session and language survive a reload`);
  const other = CITY === "makkah" ? "madinah" : "makkah";
  await page.click(`[data-city-switch=${other}]`); await page.waitForSelector(".shell");
  ok(new URL(page.url()).pathname === `/${other}/`, `entry ${lang}: the city switch opens the other city`);
  await page.goBack(); await page.waitForSelector(".shell");
  await page.click("details.user summary"); await page.click("[data-logout]");
  await page.waitForSelector("[data-rihab-signin]");
  ok(new URL(page.url()).pathname === "/", `entry ${lang}: sign out returns to the Rihab BI sign-in`);
  ok(errors.length === 0, `entry ${lang}: no errors (${errors.join(" | ")})`);
  await ctx.close();
}

/* every dashboard, both languages, every period and a set of filter combinations */
const COMBOS = QUICK ? [["30d", "all", "all", "all"], ["12m", A.quba, "all", "visitor"]] : [
  ["7d", "all", "all", "all"], ["30d", "all", "all", "all"], ["90d", "all", "all", "all"], ["12m", "all", "all", "all"], ["ramadan", "all", "all", "all"],
  ["30d", A.quba, "all", "all"], ["30d", A.central, "heritage", "visitor"], ["90d", A.awali, "food", "resident"], ["12m", "all", "stay", "visitor"],
  ["ramadan", A.uhud, "all", "resident"], ["7d", A.jamiah, "volunteer", "all"], ["30d", "all", "market", "all"], ["12m", A.kingfahd, "sport", "visitor"],
];
const renders = { n: 0 };
for (const lang of ["ar", "en"]) {
  const { ctx, page, errors } = await open(lang);
  for (const pg of PAGES) for (const [period, area, category, audience] of COMBOS) {
    const q = new URLSearchParams({ period, area, category, audience });
    await go(page, `#/${pg}?${q}`);
    const a = await audit(page, lang), tag = `${lang} ${pg} ${period}/${area}/${category}/${audience}`;
    renders.n++;
    ok(a.h1.length > 0, `${tag}: has a title`);
    ok(!a.broken, `${tag}: no NaN, undefined or Infinity`);
    ok(!a.errorState, `${tag}: no error state`);
    ok(a.overflow <= 0, `${tag}: no horizontal overflow (${a.overflow}px)`);
    ok(a.emptyPanels.length === 0, `${tag}: no empty panel (${a.emptyPanels.join(",")})`);
    ok(a.wrongScript.length === 0, `${tag}: only ${lang === "ar" ? "Arabic" : "English"} text (${a.wrongScript.slice(0, 3).join(" | ")})`);
    if (["centers", "commercial"].includes(pg) && !a.empty) ok(a.demoTags >= 3, `${tag}: demo figures are labelled`);
    if (pg === "city") ok(!a.money, `${tag}: City Opportunities shows no money`);
    if (pg === "overview" && !a.empty) ok(a.kpis.users > 0 && a.kpis.revenue >= 0, `${tag}: the stat tiles carry values`);
  }
  ok(errors.length === 0, `${lang}: no console errors across ${PAGES.length * COMBOS.length} renders (${errors.slice(0, 3).join(" | ")})`);
  await ctx.close();
}
console.log(`browser: ${renders.n} dashboard renders audited`);

/* the same figure on every dashboard that shows it */
{
  const { ctx, page } = await open("en");
  for (const [period, area, category, audience] of [["30d", "all", "all", "all"], ["12m", A.quba, "all", "all"], ["ramadan", "all", "food", "visitor"], ["90d", A.central, "all", "resident"]]) {
    const q = "?" + new URLSearchParams({ period, area, category, audience }), tag = [period, area, category, audience].join("/");
    const read = async (pg) => { await go(page, `#/${pg}${q}`); return (await audit(page, "en")).kpis; };
    const ov = await read("overview"), au = await read("audiences"), mk = await read("market"), cm = await read("commercial"), co = await read("community");
    ok(near(ov.users, au.residents + au.visitors, 1e-9), `consistency ${tag}: active users = residents + visitors`);
    ok(near(ov.market, mk.market, 1e-9), `consistency ${tag}: Market requests agree (overview / Market)`);
    ok(near(ov.revenue, cm.revenue, 1e-9), `consistency ${tag}: revenue agrees (overview / commercial)`);
    ok(near(ov.posts, co.posts, 1e-9), `consistency ${tag}: community posts agree (overview / community)`);
    const answer = await page.evaluate(() => window.RuhAsk.answer("how many active users").text);
    const shown = await page.evaluate((v) => window.RuhFmt.compact(v), ov.users);
    ok(answer.includes(shown), `consistency ${tag}: Ask the data gives the overview's active users (${shown})`);
  }
  await ctx.close();
}

/* interactions: filters, deep links, map, tables, CSV, the Assistant, empty states */
{
  const { ctx, page, errors } = await open("ar");
  await page.selectOption("select[data-filter=period]", "90d"); await page.waitForTimeout(250);
  ok(page.url().includes("period=90d"), "filters: the period goes into the link");
  await page.selectOption("select[data-filter=area]", A.quba); await page.waitForTimeout(250);
  await page.selectOption("select[data-filter=category]", "heritage"); await page.waitForTimeout(250);
  await page.click("[data-audience=visitor]"); await page.waitForTimeout(250);
  ok(page.url().includes("area=" + A.quba) && /category=heritage/.test(page.url()) && /audience=visitor/.test(page.url()), "filters: area, category and audience go into the link");
  ok(await page.isVisible(".map .cell.sel"), "filters: the chosen area is highlighted on the map");
  await page.click("[data-reset]"); await page.waitForTimeout(250);
  ok(!/period=|area=|category=|audience=/.test(page.url()), "filters: reset clears every filter");
  await page.click(`.map .cell[data-set-area=${A.awali}]`); await page.waitForTimeout(250);
  ok(page.url().includes("area=" + A.awali), "map: selecting an area filters the dashboard");
  await page.click("[data-toggle-table=ov-cats]"); await page.waitForTimeout(150);
  ok(await page.isVisible("#ov-cats .p-table table"), "tables: a chart switches to its table");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("[data-csv=ov-cats]")]);
  const csv = readFileSync(await dl.path(), "utf8");
  ok(csv.charCodeAt(0) === 0xfeff && csv.split("\n").length > 3 && dl.suggestedFilename().endsWith(".csv"), "CSV: a panel exports its table with a UTF-8 mark");
  await go(page, "#/reports?period=12m");
  const [dl2] = await Promise.all([page.waitForEvent("download"), page.click("[data-report=daily]")]);
  ok(readFileSync(await dl2.path(), "utf8").split("\n").length === 362, "CSV: the daily report has one row per day of the last 12 months (361) plus the header");
  ok(await page.isVisible("[data-print]"), "reports: print or save as PDF is offered");
  await page.click("a[data-page=market]"); await page.waitForTimeout(300);
  await page.goBack(); await page.waitForTimeout(300);
  ok((await page.textContent(".top h1")) === "التقارير", "history: back returns to the previous dashboard");
  await page.goto(BASE + `#/geography?period=12m&area=${A.quba}&audience=visitor`); await page.reload(); await page.waitForSelector(".shell");
  ok((await page.inputValue("select[data-filter=area]")) === A.quba && (await page.inputValue("select[data-filter=period]")) === "12m", "deep links: a shared link opens with its filters");
  ok(await page.isVisible(".area-card"), "map: the selected area's card shows its description from the app");
  await go(page, "#/city?period=ramadan");
  ok((await audit(page, "ar")).empty === 1, "empty states: City Opportunities before it opened says so");
  await go(page, `#/centers?area=${A.jamiah}`);
  ok((await audit(page, "ar")).empty === 1, "empty states: an area without a Visitor Center says so");
  await go(page, "#/overview");
  await page.click("[data-ask]");
  await page.fill("#ask-in", "أكثر المنتجات طلبا"); await page.press("#ask-in", "Enter"); await page.waitForTimeout(200);
  ok((await page.locator(".msg.bot li").count()) >= 3, "Ask the data: answers with a list from the data");
  await page.click(".msg.bot [data-ask-go]"); await page.waitForTimeout(400);
  ok(page.url().includes("#/market"), "Ask the data: its button opens the matching dashboard");
  const lang = await page.evaluate(() => [window.RuhAsk.answer("top products").text, window.RuhAsk.answer("أكثر المنتجات").text]);
  ok(/^[\x00-\x7F’—–·\s\p{P}\p{N}]*Most requested/u.test(lang[0]) && /[؀-ۿ]/.test(lang[1]), "Ask the data: answers in the language of the question");
  const roi = await page.evaluate(() => window.RuhAsk.answer("what's the return on investment").text);
  ok(/no returns, profits, amounts/.test(roi) && !/SAR|%\s*return/.test(roi), "Ask the data: gives no investment figures");
  const unknown = await page.evaluate(() => window.RuhAsk.answer("weather tomorrow in paris").text);
  ok(/didn't quite get that/.test(unknown), "Ask the data: an unrelated question gets a fallback, not an invented answer");
  await page.keyboard.press("Escape");
  await page.focus(`.map .cell[data-set-area=${A.quba}]`).catch(() => {});
  await go(page, "#/overview");
  await page.locator(".map .cell").first().focus();
  ok(await page.isVisible("#tip"), "accessibility: keyboard focus on a mark shows its tooltip");
  ok(errors.length === 0, `interactions: no console errors (${errors.slice(0, 3).join(" | ")})`);
  await ctx.close();
}

/* viewports */
const VIEWPORTS = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
for (const [w, h] of QUICK ? VIEWPORTS.slice(1, 3) : VIEWPORTS) for (const lang of ["ar", "en"]) {
  const { ctx, page, errors } = await open(lang, "#/overview", { width: w, height: h });
  for (const pg of PAGES) {
    await go(page, `#/${pg}`);
    const a = await audit(page, lang);
    const outside = await page.evaluate(() => [...document.querySelectorAll(".panel, .kpi, .filters, .report")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).length);
    ok(a.overflow <= 0 && outside === 0, `viewport ${w}×${h} ${lang} ${pg}: fits the screen (overflow ${a.overflow}px, ${outside} boxes outside)`);
  }
  if (w < 1080) {
    ok(await page.isVisible("[data-nav-open]"), `viewport ${w} ${lang}: the menu button shows`);
    await page.click("[data-nav-open]"); await page.waitForTimeout(300);
    ok(await page.isVisible(".nav-open .side"), `viewport ${w} ${lang}: the menu opens`);
    await page.click(".scrim", { position: { x: lang === "ar" ? 12 : w - 12, y: 300 } }); await page.waitForTimeout(300);
    ok(!(await page.isVisible(".nav-open")), `viewport ${w} ${lang}: tapping outside closes the menu`);
  }
  ok(errors.length === 0, `viewport ${w} ${lang}: no console errors`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(`bi-check (${CITY}): ${pass} passed, ${fails.length} failed`);
if (fails.length) { fails.slice(0, 40).forEach((f) => console.log("  ✗ " + f)); process.exit(1); }
