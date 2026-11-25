/* The Market and City Opportunities, in Chromium, for both experiences in Arabic and English:
   · five bottom tabs, with «السوق» / Market in the middle; City Opportunities on Home, not a tab
   · the Market's three categories: experiences and services are the shared inventory (their own
     decision pages, booking or a service request), products are a demo catalogue with a request sheet
   · Live in Madinah and Invest in Madinah: every home and opportunity carries the demo label; no price
     on a home, and no amount, return, ranking or usufruct wording anywhere on an opportunity
   · requests and registered interest are recorded on the device, say so, show their status, survive a
     reload and sign-in, can be withdrawn, and are reachable from the Market and from Profile
   · the Assistant answers a product, a home and an opportunity question with a link to the right screen
   Usage: node scripts/market-check.mjs   (LANGS=ar,en  WIDTH=390) */
import { launchBrowser, serveBuild, outDir } from "./lib/browser.mjs";
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
const MONEY_ON_OPPS = /(ريال|SAR|٪|%|عائد|عوائد|أرباح|ارباح|ربح|ROI|return on|returns|profit|yield|انتفاع|usufruct|مضمون|guarantee)/i;
const PRICE = /(ريال|SAR)/;

for (const lang of LANGS) {
  for (const who of ["resident", "visitor"]) {
    const tag = `${lang}/${who}`;
    const T = (a, e) => (lang === "en" ? e : a);
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    page.on("pageerror", (e) => runtime.push(`${tag}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) runtime.push(`${tag}: console ${m.text()}`); });
    const W = (n = 400) => page.waitForTimeout(n);
    const text = () => page.locator("[data-screen]").innerText();
    /* the screen without its marked demo notices (which name what is *not* shown: amounts, returns) */
    const plain = () => page.evaluate(() => { const c = document.querySelector("[data-screen]")?.cloneNode(true); if (!c) return ""; c.querySelectorAll("[data-demo]").forEach((e) => e.remove()); return c.textContent || ""; });
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
      await page.getByText(/^(ابدأ|Enter Ruh Al Madinah)$/).first().click(); await W(500);
      await page.locator(`[data-lang="${lang}"]`).click(); await page.locator('[data-auth-screen="login"]').waitFor();
      await page.locator("[data-auth-email]").fill(`${who}@ruhalmadinah.demo`); await page.locator("[data-auth-password]").fill("demo"); await page.locator("[data-auth-submit]").click();
      await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(600);
      for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
    };
    try {
      await page.goto(site.url, { waitUntil: "networkidle" }); await W(700);
      await signIn();

      /* tabs and Home */
      const navs = await page.$$eval("[data-nav]", (els) => els.map((e) => e.getAttribute("data-nav")).join(","));
      ok(`${tag}: five tabs, Market in the middle`, navs === "home,discover,market,community,plan", navs);
      ok(`${tag}: the Market tab is labelled in the reading language`, (await page.locator('[data-nav="market"]').innerText()).trim() === T("السوق", "Market"));
      const mods = await page.$$eval("[data-home-module]", (els) => els.map((e) => e.getAttribute("data-home-module")));
      const after = who === "visitor" ? "build-trip" : "this-week";
      ok(`${tag}: City Opportunities on Home, after ${after}`, mods.includes("city-ops") && (!mods.includes(after) || mods.indexOf("city-ops") > mods.indexOf(after)), mods.join(","));
      ok(`${tag}: two distinct City Opportunities cards`, (await page.locator('[data-city-card="live"]').count()) === 1 && (await page.locator('[data-city-card="invest"]').count()) === 1);

      /* Market: experiences */
      await tab("market");
      ok(`${tag}: Market opens on Experiences`, (await page.locator('[data-market-tab="experiences"][aria-pressed="true"]').count()) === 1);
      const expCount = await page.locator("[data-screen] .lift").count();
      ok(`${tag}: experiences listed from the shared inventory`, expCount >= 8, String(expCount));
      stage = "experiences"; await chip(T("فعاليات", "Events")).click(); await W();
      const ev = await text();
      ok(`${tag}: the Events filter shows events`, new RegExp(T("فعالية", "Event")).test(ev));
      await page.locator("[data-screen] .lift").first().click(); await W(700);
      ok(`${tag}: an experience opens its decision page`, (await page.locator("[data-object-meta]").count()) === 1);
      await back();

      /* Market: services — a service is requested, the request recorded on the device */
      await page.locator('[data-market-tab="services"]').click(); await W();
      const svc = await text();
      ok(`${tag}: services include guides, transport and translation`, new RegExp(T("مرشد", "guide"), "i").test(svc) && new RegExp(T("نقل", "transport"), "i").test(svc) && new RegExp(T("مترجم", "interpreter"), "i").test(svc));
      stage = "services"; await chip(T("ترجمة", "Translation")).click(); await W();
      await page.locator("[data-screen] .lift").first().click(); await W(700);
      await page.getByRole("button", { name: T("اطلب الخدمة", "Request this service") }).click(); await W(400);
      ok(`${tag}: the service request sheet says it stays on the device`, (await page.locator('[data-request-sheet="service"]').count()) === 1 && new RegExp(T("لا يُرسل", "not sent")).test(await page.locator("[data-demo]").last().innerText()));
      await page.locator("[data-request-submit]").click(); await W(400);
      ok(`${tag}: service request recorded`, (await page.locator("[data-request-done]").count()) === 1);
      await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: the service page shows the recorded request`, (await page.getByRole("button", { name: T("طلبك مسجّل — عدّله", "Request recorded — edit it") }).count()) === 1);
      await back();

      /* Market: products */
      await page.locator('[data-market-tab="products"]').click(); await W();
      const products = await page.locator("[data-product]").count();
      ok(`${tag}: ten products`, products === 10, String(products));
      ok(`${tag}: every product carries the demo label`, (await page.locator("[data-product] [data-demo]").count()) === products);
      stage = "products"; await chip(T("تمور", "Dates")).click(); await W();
      ok(`${tag}: the Dates filter`, (await page.locator("[data-product]").count()) === 3);
      await page.locator('[data-product="PRD-01"]').click(); await W(600);
      const pp = await text();
      ok(`${tag}: a product page shows its price as a demo price`, PRICE.test(await page.locator("[data-product-price]").innerText()) && new RegExp(T("سعر للعرض التجريبي", "Demo price")).test(pp));
      await page.locator('[data-request-open="product"]').click(); await W(400);
      await page.getByLabel(T("أكثر", "More"), { exact: true }).click(); await page.getByLabel(T("أكثر", "More"), { exact: true }).click(); await W(150);
      ok(`${tag}: quantity stepper`, /(٣|3)/.test(await page.locator("[data-request-qty]").innerText()));
      await page.locator("#request-note").fill(T("للهدية لو سمحت", "As a gift, please"));
      await page.locator("[data-request-submit]").click(); await W(400);
      ok(`${tag}: the done screen never says sent`, (await page.locator("[data-request-done]").count()) === 1 && !/(تم الإرسال|أُرسل إلى|sent to the seller|has been sent)/i.test(await page.locator("[data-request-done]").innerText()));
      await page.getByText(T("اعرض طلباتي", "View my requests"), { exact: true }).click(); await W(500);
      const reqText = await text();
      ok(`${tag}: My requests lists the product with its quantity and note`, (await page.locator('[data-request-row="product"]').count()) === 1 && /(٣|3)/.test(await page.locator('[data-request-row="product"]').innerText()) && reqText.includes(T("للهدية لو سمحت", "As a gift, please")));
      ok(`${tag}: My requests says it is a demo kept on the device`, (await page.locator("[data-requests] [data-demo]").count()) >= 1);

      /* Live in Madinah */
      await tab("home");
      await page.locator('[data-city-card="live"]').scrollIntoViewIfNeeded(); await page.locator('[data-city-card="live"]').click(); await W(600);
      ok(`${tag}: Live in Madinah opens with five homes`, (await page.locator("[data-home]").count()) === 5);
      ok(`${tag}: every home carries the demo label`, (await page.locator("[data-home] [data-demo]").count()) === 5);
      ok(`${tag}: no price on any home`, !PRICE.test(await text()));
      stage = "live"; await chip(T("للإيجار", "For rent")).click(); await W();
      ok(`${tag}: the For rent filter`, (await page.locator("[data-home]").count()) === 1);
      await chip(T("الكل", "All")).click(); await W();
      await chip(T("قباء", "Quba")).click(); await W();
      ok(`${tag}: homes by neighbourhood, with the area's own description`, (await page.locator("[data-home]").count()) === 1 && new RegExp(T("اكتشف الحي", "Explore the area")).test(await text()));
      await page.locator('[data-home="HOM-04"]').click(); await W(600);
      ok(`${tag}: a home page has no price`, !PRICE.test(await text()));
      await page.locator('[data-request-open="home"]').click(); await W(300); await page.locator("[data-request-submit]").click(); await W(300);
      await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: Request details recorded on the home page`, (await page.locator('[data-request-open="home"]').innerText()).includes(T("طلبك مسجّل", "Request recorded")));
      await back();

      /* Invest in Madinah */
      await page.locator('[data-city-tab="invest"]').click(); await W(500);
      ok(`${tag}: five opportunities`, (await page.locator("[data-opp]").count()) === 5);
      ok(`${tag}: every opportunity carries the demo label`, (await page.locator("[data-opp] [data-demo]").count()) === 5);
      stage = "invest"; const inv = await plain();
      ok(`${tag}: the directory says it is not an investment service`, new RegExp(T("ليس جهة استثمار", "not an investment company")).test(await text()));
      ok(`${tag}: no amount, return, ranking or usufruct on the directory`, !MONEY_ON_OPPS.test(inv), (inv.match(MONEY_ON_OPPS) || [])[0]);
      await page.locator('[data-opp="OPP-03"] [data-opp-interest]').click(); await W(400);
      await page.locator("[data-request-submit]").click(); await W(300); await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: Register interest changes the card`, (await page.locator('[data-opp="OPP-03"] [data-opp-interest]').innerText()).includes(T("اهتمامك مسجّل", "Interest registered")));
      await page.locator('[data-opp="OPP-01"] [data-opp-explore]').click(); await W(600);
      const op = await plain();
      ok(`${tag}: an opportunity page has no amounts or returns`, !MONEY_ON_OPPS.test(op), op.slice(Math.max(0, op.search(MONEY_ON_OPPS) - 80), op.search(MONEY_ON_OPPS) + 30));
      ok(`${tag}: an opportunity page names no owner`, !/(المالك|الجهة المالكة|owner|developer:)/i.test(op));
      await page.screenshot({ path: `${OUT}/${lang}-${who}-opportunity.png` });

      /* persistence: reload and sign in again; then from Profile; withdraw */
      stage = "persistence";
      await page.reload({ waitUntil: "networkidle" }); await W(800);
      if (!(await page.locator("[data-home-greeting]").count())) await signIn();
      await page.locator("[data-profile-entry]").click(); await W(500);
      await page.locator("[data-profile-requests] button").click(); await W(500);
      const rows = await page.locator("[data-request-row]").count();
      ok(`${tag}: four requests kept after reload, reachable from Profile`, rows === 4, String(rows));
      await page.locator('[data-request-row="opp"]').getByRole("button", { name: T("اسحب", "Withdraw") }).click(); await W(400);
      ok(`${tag}: a request can be withdrawn`, (await page.locator("[data-request-row]").count()) === 3);

      /* the Assistant links to the new screens */
      stage = "assistant";
      await tab("home");
      await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(500);
      for (const [q, link, expect] of [[T("أبغى أشتري تمر عجوة", "I want to buy Ajwa dates"), T("افتح المنتجات", "Open Products"), '[data-market-tab="products"][aria-pressed="true"]'],
        [T("أبغى شقة للإيجار", "an apartment for rent"), T("افتح «عِش في المدينة»", "Open Live in Madinah"), '[data-city-tab="live"][aria-pressed="true"]'],
        [T("فرص استثمارية في المدينة", "investment opportunities in Madinah"), T("افتح «استثمر في المدينة»", "Open Invest in Madinah"), '[data-city-tab="invest"][aria-pressed="true"]']]) {
        await page.locator("form input").fill(q); await page.locator("form button[type=submit]").click(); await W(900);
        const bubble = await page.locator("[data-screen] .up").last().innerText();
        ok(`${tag}: Assistant «${q}» answers with the demo items`, (await page.locator("[data-screen] .up").last().locator("[data-agent-market] [data-demo]").count()) >= 1, bubble.slice(0, 120));
        await page.locator("[data-screen]").getByRole("button", { name: link, exact: true }).last().click(); await W(600);
        ok(`${tag}: Assistant link «${link}» opens the screen`, (await page.locator(expect).count()) === 1);
        await back();
        if (!(await page.locator("form input").count())) { await tab("home"); await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(500); }
      }
    } catch (e) { ok(`${tag}: journey ran to the end`, false, `${stage}: ${e.message.split("\n")[0]}`); await page.screenshot({ path: `${OUT}/${lang}-${who}-error.png` }).catch(() => {}); }
    await ctx.close();
  }
}

console.log(`\n${pass}/${pass + fail} checks passed · ${runtime.length} runtime errors`);
if (runtime.length) console.log(runtime.slice(0, 8));
await browser.close(); await site.close();
process.exit(fail || runtime.length ? 1 : 0);
