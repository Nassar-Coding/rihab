/* The Rihab Makkah Market, in Chromium, for both experiences in Arabic and English:
   · five bottom tabs, with «السوق» / Market in the middle
   · three categories: experiences and services come from the shared inventory (their own decision
     pages, booking or a service request); products are a catalogue with an indicative price and a
     request sheet with a quantity
   · no demo labels; a request is never said to be sent or paid
   · requests are kept in My requests (alongside the demo resident's own): listed with quantity and note, filtered by kind, kept across a
     reload, reachable from Profile, and can be withdrawn
   · the Assistant answers product, Market and service questions with a link to the right screen
   Usage: node scripts/market-check.mjs   (LANGS=ar,en  WIDTH=390; build first: node build/build.mjs app) */
import { launchBrowser, serveBuild, outDir } from "./lib/browser.mjs";
import { rihabLang, rihabSignIn } from "./lib/rihab-entry.mjs";
import { mkdirSync } from "node:fs";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WIDTH = +(process.env.WIDTH || 390);
const OUT = outDir("market");
mkdirSync(OUT, { recursive: true });
const site = await serveBuild();
const browser = await launchBrowser();
const runtime = [];
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "✓" : "✗"} ${name}${!cond && detail ? " — " + detail : ""}`); };
const PRICE = /(ريال|SAR)/;
const DEMO = /(تجريبي|للعرض التجريبي|\bdemo\b)/i;
const SENT = /(تم الإرسال|أُرسل إلى|تم الدفع|sent to the seller|has been sent|paid)/i;

for (const lang of LANGS) {
  for (const who of ["resident", "visitor"]) {
    const tag = `${lang}/${who}`;
    const T = (a, e) => (lang === "en" ? e : a);
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", (e) => runtime.push(`${tag}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) runtime.push(`${tag}: console ${m.text()}`); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const W = (n = 400) => page.waitForTimeout(n);
    const text = () => page.locator("[data-screen]").innerText();
    const chip = (label) => page.locator(".rail button").filter({ hasText: new RegExp(`^${label}$`) }).first();
    let stage = "start";
    const back = async () => { await page.getByLabel(T("رجوع", "Back"), { exact: true }).first().click(); await W(); };
    const close = async () => { const c = page.getByLabel(T("إغلاق", "Close"), { exact: true }).first(); if (await c.count() && await c.isVisible().catch(() => false)) { await c.click(); await W(250); } };
    const tab = async (id) => {
      for (let i = 0; i < 6; i++) {
        const nav = page.locator(`[data-nav="${id}"]`);
        if (await nav.count() && await nav.first().isVisible().catch(() => false)) { await nav.first().click(); await W(500); return; }
        await close(); const b = page.getByLabel(T("رجوع", "Back"), { exact: true }).first();
        if (await b.count() && await b.isVisible().catch(() => false)) { await b.click(); await W(250); }
      }
    };
    const signIn = async () => {
      await rihabLang(page, lang); await rihabSignIn(page, `${who}@rihab.app`, "demo");
      await page.locator("[data-home-greeting]").waitFor({ timeout: 15000 }); await W(600);
      for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
    };
    try {
      await page.goto(site.url, { waitUntil: "networkidle" }); await W(700);
      await signIn();

      /* five tabs, the Market in the middle */
      const navs = await page.locator("[data-nav]").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("data-nav")))]);
      ok(`${tag}: five bottom tabs with the Market in the middle`, navs.length === 5 && navs[2] === "market", navs.join(","));
      await tab("market");
      ok(`${tag}: the Market opens with its three categories`, (await page.locator("[data-market-tab]").count()) === 3);
      ok(`${tag}: experiences first`, (await page.locator('[data-market-tab="experiences"][aria-pressed="true"]').count()) === 1);
      ok(`${tag}: no demo label in the Market`, !DEMO.test(await text()) && (await page.locator("[data-demo]").count()) === 0);
      await page.screenshot({ path: `${OUT}/${lang}-${who}-market.png` });

      /* experiences: an experience opens its own decision page */
      stage = "experiences";
      const exps = await page.locator("[data-screen] .lift").count();
      ok(`${tag}: experiences listed`, exps >= 3, String(exps));
      await page.locator("[data-screen] .lift").first().click(); await W(700);
      ok(`${tag}: an experience opens its page`, (await page.locator("[data-nav]").filter({ visible: true }).count()) === 0 || (await text()).length > 200);
      await back();

      /* services: a service is requested and recorded */
      stage = "services";
      await page.locator('[data-market-tab="services"]').click(); await W();
      const svc = await text();
      ok(`${tag}: services include guides, transport and translation`, new RegExp(T("مرشد", "guide"), "i").test(svc) && new RegExp(T("نقل", "transport"), "i").test(svc) && new RegExp(T("مترجم", "interpreter|translat"), "i").test(svc));
      await chip(T("ترجمة", "Translation")).click(); await W();
      await page.locator("[data-screen] .lift").first().click(); await W(700);
      await page.getByRole("button", { name: T("اطلب الخدمة", "Request this service") }).click(); await W(400);
      ok(`${tag}: the service request sheet says where the request is kept`, (await page.locator('[data-request-sheet="service"]').count()) === 1 && (await page.locator("[data-info-note]").last().innerText()).includes(T("طلباتي", "My requests")));
      await page.locator("[data-request-submit]").click(); await W(400);
      ok(`${tag}: service request recorded, never said to be sent`, (await page.locator("[data-request-done]").count()) === 1 && !SENT.test(await page.locator("[data-request-done]").innerText()));
      await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: the service page shows the recorded request`, (await page.getByRole("button", { name: T("طلبك مسجّل — عدّله", "Request recorded — edit it") }).count()) === 1);
      await back();

      /* products */
      stage = "products";
      await page.locator('[data-market-tab="products"]').click(); await W();
      const products = await page.locator("[data-product]").count();
      ok(`${tag}: ten products`, products === 10, String(products));
      ok(`${tag}: no product carries a demo label`, (await page.locator("[data-product] [data-demo]").count()) === 0 && !DEMO.test(await text()));
      await chip(T("تمور", "Dates")).click(); await W();
      ok(`${tag}: the Dates filter`, (await page.locator("[data-product]").count()) === 3);
      await page.locator('[data-product="PRD-01"]').click(); await W(600);
      ok(`${tag}: a product page shows an indicative price`, PRICE.test(await page.locator("[data-product-price]").innerText()) && new RegExp(T("سعر تقديري", "Indicative price")).test(await text()));
      ok(`${tag}: a product page has its photo`, (await page.locator("[data-screen] img").count()) >= 1);
      await page.locator('[data-request-open="product"]').first().click(); await W(400);
      await page.getByLabel(T("أكثر", "More"), { exact: true }).click(); await page.getByLabel(T("أكثر", "More"), { exact: true }).click(); await W(150);
      ok(`${tag}: quantity stepper`, /(٣|3)/.test(await page.locator("[data-request-qty]").innerText()));
      await page.locator("#request-note").fill(T("للهدية لو سمحت", "As a gift, please"));
      await page.locator("[data-request-submit]").click(); await W(400);
      ok(`${tag}: the done screen never says sent or paid`, (await page.locator("[data-request-done]").count()) === 1 && !SENT.test(await page.locator("[data-request-done]").innerText()));
      await page.locator("[data-request-view]").click(); await W(500);
      const reqText = await text();
      ok(`${tag}: My requests lists the product with its quantity and note`, (await page.locator('[data-request-row="product"]').count()) === 1 && /(٣|3)/.test(await page.locator('[data-request-row="product"]').innerText()) && reqText.includes(T("للهدية لو سمحت", "As a gift, please")));
      ok(`${tag}: My requests lists the service too`, (await page.locator('[data-request-row="service"]').count()) === 1);
      ok(`${tag}: My requests explains how requests are kept, with no demo label`, (await page.locator("[data-requests] [data-info-note]").count()) >= 1 && !DEMO.test(reqText));
      await page.screenshot({ path: `${OUT}/${lang}-${who}-requests.png` });
      const before = await page.locator("[data-request-row]").count();

      /* persistence: reload; then from Profile; withdraw */
      stage = "persistence";
      await page.reload({ waitUntil: "networkidle" }); await W(900);
      if (!(await page.locator("[data-home-greeting], [data-screen]").count())) await signIn();
      await tab("home");
      await page.locator("[data-profile-entry]").click(); await W(500);
      await page.locator("[data-profile-requests] button").click(); await W(500);
      const rows = await page.locator("[data-request-row]").count();
      ok(`${tag}: requests kept after reload (the account's own and the two new ones), reachable from Profile`, rows === before && rows >= 2, `${before} → ${rows}`);
      await page.locator('[data-request-row="service"]').getByRole("button", { name: T("اسحب", "Withdraw") }).click(); await W(400);
      ok(`${tag}: a request can be withdrawn`, (await page.locator("[data-request-row]").count()) === rows - 1);

      /* the Assistant links to the Market */
      stage = "assistant";
      await tab("home");
      await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(500);
      for (const [q, link, expect] of [[T("أبغى أشتري تمر سكري", "I want to buy Sukkari dates"), T("افتح المنتجات", "Open Products"), '[data-market-tab="products"][aria-pressed="true"]'],
        [T("أبغى أشتري دهن عود", "I want to buy oud oil"), T("افتح المنتجات", "Open Products"), '[data-market-tab="products"][aria-pressed="true"]']]) {
        await page.locator("form input").fill(q); await page.locator("form button[type=submit]").click(); await W(900);
        const bubble = await page.locator("[data-screen] .up").last().innerText();
        ok(`${tag}: Assistant «${q}» answers with Market products`, (await page.locator("[data-screen] .up").last().locator('[data-agent-city="product"]').count()) >= 1 && !DEMO.test(bubble), bubble.slice(0, 140));
        await page.locator("[data-screen]").getByRole("button", { name: link, exact: true }).last().click(); await W(600);
        ok(`${tag}: Assistant link «${link}» opens the screen`, (await page.locator(expect).count()) === 1);
        await back();
        if (!(await page.locator("form input").count())) { await tab("home"); await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(500); }
      }
    } catch (e) {
      ok(`${tag}: flow completed (stage ${stage})`, false, e.message.split("\n")[0]);
      await page.screenshot({ path: `${OUT}/${lang}-${who}-error.png` }).catch(() => {});
    }
    await ctx.close();
  }
}
ok("no runtime errors", runtime.length === 0, runtime.slice(0, 4).join(" | "));
await browser.close(); await site.close();
console.log(`\nmarket-check: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
