/* «فرص مكة» / Makkah Opportunities, in Chromium, for both experiences in Arabic and English:
   · the four bottom tabs are unchanged; Makkah Opportunities is a Home section (after "This week"
     for a resident, after "Build your trip" for a visitor) with two separate cards, never a tab
   · Live in Makkah: rent / own / extended stay, attribute and area filters (combined), the area's own
     description, a detail page with rooms, size, terms and features; no demo or sample wording
     and no home shows a price
   · Invest in Makkah: the four categories and a location filter, a detail page with its profile; no
     amount, return, guarantee, ranking or owner anywhere, and the directory says it is not an
     investment service
   · Register interest and Request details / more information are recorded on the device, say so
     before and after, never say "sent", show their status in «طلباتي», can be edited (one record per
     item), filtered, withdrawn, survive a reload, and are reachable from Profile
   · the Assistant answers a housing, an investment (including a returns question) and a my-requests
     question with the matching items and a link to the right screen, and still treats a hotel as a stay
   Accounts are created through the real sign-up screens, one per persona and language.
   Usage: node scripts/opportunities-check.mjs   (LANGS=ar,en  WIDTH=390) */
import { launchBrowser, serveBuild, outDir } from "./lib/browser.mjs";
import { mkdirSync } from "node:fs";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WIDTH = +(process.env.WIDTH || 390);
const OUT = outDir("opportunities");
mkdirSync(OUT, { recursive: true });
const site = await serveBuild();
const browser = await launchBrowser();
const runtime = [];
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "✓" : "✗"} ${name}${!cond && detail ? " — " + detail : ""}`); };
const MONEY_ON_OPPS = /(ريال|SAR|٪|%|عائد|عوائد|أرباح|ارباح|ربح|ROI|return on|returns|profit|yield|انتفاع|usufruct|مضمون|guarantee|الأفضل|best opportunity|ranked)/i;
const PRICE = /(ريال|SAR|\d+\s?(ر\.س|SR))/;
const DEMO_WORDS = /(مثال توضيحي|أمثلة توضيحية|توضيحي|تجريبي|ديمو|نموذج أولي|\bdemo\b|illustrative|prototype|\bsample\b|\bmock\b)/i;
const SENT = /(تم الإرسال|أُرسل إلى|أرسلنا|sent to the|has been sent|we sent|we've sent)/i;

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
    /* the screen without its information notes (which name what is *not* shown: amounts, returns) */
    const plain = () => page.evaluate(() => { const c = document.querySelector("[data-screen]")?.cloneNode(true); if (!c) return ""; c.querySelectorAll("[data-info-note]").forEach((e) => e.remove()); return c.textContent || ""; });
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
    const email = `opps.${who}.${lang}.${Date.now()}@example.com`, password = "opps-makkah-2026";
    const dismiss = async () => { for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {}); };
    const signUp = async () => {
      await page.getByText(/^(ابدأ|Enter EyeMakkah)$/).first().click(); await W(500);
      await page.locator(`[data-lang="${lang}"]`).click(); await page.locator("[data-auth-email]").waitFor();
      await page.locator("[data-create-account]").click();
      await page.locator('[data-signup-method="email"]').click();
      await page.locator("[data-signup-email]").fill(email);
      await page.locator("[data-signup-password]").fill(password);
      await page.locator("[data-signup-confirm]").fill(password);
      await page.locator("[data-signup-submit]").click();
      await page.locator('[data-auth-screen="profile-setup"]').waitFor({ timeout: 10000 });
      await page.locator("#profile-firstName").fill(T("سارة", "Sara"));
      await page.locator("#profile-lastName").fill(T("القرشي", "Al-Qurashi"));
      await page.locator("#profile-age").fill("31");
      await page.locator("#profile-nationality").selectOption("SA");
      await page.locator(`[data-profile-mode="${who}"]`).click(); await W(250);
      if (who === "visitor") {
        await page.locator("[data-profile-stay]").first().click();
        await page.locator("[data-profile-party]").first().click();
      } else {
        const nb = page.locator("#profile-nb"); if (await nb.count()) await nb.selectOption({ index: 1 });
      }
      const ints = page.locator("[data-profile-interest]"); for (let i = 0; i < 2; i++) await ints.nth(i).click();
      await page.locator("[data-profile-submit]").click();
      await page.locator("[data-home-greeting]").waitFor({ timeout: 15000 }); await W(600); await dismiss();
    };
    const signIn = async () => {
      if (await page.locator("[data-home-greeting]").count()) return;
      const start = page.getByText(/^(ابدأ|Enter EyeMakkah)$/).first();
      if (await start.count()) { await start.click(); await W(500); }
      const pickLang = page.locator(`[data-lang="${lang}"]`); if (await pickLang.count()) await pickLang.click();
      await page.locator("[data-auth-email]").waitFor();
      await page.locator("[data-auth-email]").fill(email); await page.locator("[data-auth-password]").fill(password); await page.locator("[data-auth-submit]").click();
      await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(600); await dismiss();
    };
    const homeCount = () => page.locator("[data-home]").count();
    /* in English, nothing on these screens is left in Arabic (a person's own note excepted) */
    const english = async (where) => { if (lang !== "en") return; const t = (await text()).replace(/«[^»]*»/g, ""); const m = t.match(/[\u0600-\u06FF][^\n]{0,40}/); ok(`${tag}: ${where} is fully in English`, !m, m?.[0]); };
    try {
      await page.goto(site.url, { waitUntil: "networkidle" }); await W(700);
      await signUp();

      /* tabs and Home */
      stage = "home";
      const navs = await page.$$eval("[data-nav]", (els) => els.map((e) => e.getAttribute("data-nav")).join(","));
      ok(`${tag}: the four bottom tabs are unchanged`, navs === "home,discover,community,plan", navs);
      const mods = await page.$$eval("[data-home-module]", (els) => els.map((e) => e.getAttribute("data-home-module")));
      const after = who === "visitor" ? "build-trip" : "this-week";
      ok(`${tag}: Makkah Opportunities on Home, after ${after}`, mods.includes("city-ops") && (!mods.includes(after) || mods.indexOf("city-ops") === mods.indexOf(after) + 1), mods.join(","));
      ok(`${tag}: two separate cards, Live and Invest`, (await page.locator('[data-city-card="live"]').count()) === 1 && (await page.locator('[data-city-card="invest"]').count()) === 1);
      ok(`${tag}: the section is titled «${T("فرص مكة", "Makkah Opportunities")}»`, (await page.locator('[data-home-module="city-ops"]').innerText()).includes(T("فرص مكة", "Makkah Opportunities")));

      /* Live in Makkah */
      stage = "live";
      await page.locator('[data-city-card="live"]').scrollIntoViewIfNeeded(); await page.locator('[data-city-card="live"]').click(); await W(600);
      ok(`${tag}: the Live card opens Live in Makkah`, (await page.locator('[data-city-tab="live"][aria-pressed="true"]').count()) === 1 && (await page.locator("[data-live]").count()) === 1);
      ok(`${tag}: the bottom navigation stays on the listing`, (await page.locator("[data-nav]").count()) >= 4);
      ok(`${tag}: seven homes`, (await homeCount()) === 7, String(await homeCount()));
      ok(`${tag}: no demo or sample wording on the listing`, !DEMO_WORDS.test(await text()), ((await text()).match(DEMO_WORDS) || [])[0]);
      ok(`${tag}: no price on the listing`, !PRICE.test(await text()));
      await english("Live in Makkah");
      const firstDeal = await page.locator("[data-home]").first().innerText();
      if (who === "visitor") ok(`${tag}: a visitor sees extended stays first`, firstDeal.includes(T("إقامة ممتدة", "Extended stay")), firstDeal.slice(0, 60));
      await page.locator('[data-home-deal="rent"] button').click(); await W();
      ok(`${tag}: the For rent filter`, (await homeCount()) === 2, String(await homeCount()));
      await page.locator('[data-home-deal="own"] button').click(); await W();
      ok(`${tag}: the To own filter`, (await homeCount()) === 2, String(await homeCount()));
      await page.locator('[data-home-deal="stay"] button').click(); await W();
      ok(`${tag}: the Extended stay filter`, (await homeCount()) === 3, String(await homeCount()));
      await page.locator('[data-home-attr="haram"] button').click(); await W();
      ok(`${tag}: type and attribute filters combine (extended stay + close to the Haram)`, (await homeCount()) === 1 && (await page.locator('[data-home="HOM-05"]').count()) === 1);
      await page.locator('[data-home-attr="family"] button').click(); await W();
      ok(`${tag}: a choice with no match says so and offers to clear`, (await homeCount()) === 0 && (await page.getByRole("button", { name: T("أزل الخيارات", "Clear the options") }).count()) === 1);
      await page.getByRole("button", { name: T("أزل الخيارات", "Clear the options") }).click(); await W();
      ok(`${tag}: clearing the options shows every home`, (await homeCount()) === 7);
      await page.locator('[data-home-attr="furnished"] button').click(); await W();
      ok(`${tag}: the Furnished filter`, (await homeCount()) === 4, String(await homeCount()));
      await page.locator('[data-home-attr="furnished"] button').click(); await W();
      await page.locator('[data-home-area="awali"] button').click(); await W();
      ok(`${tag}: homes by area, with the area's own description`, (await homeCount()) === 1 && (await page.locator("[data-area-note]").count()) === 1);
      await page.locator('[data-home-area="all"] button').click(); await W();
      await page.locator('[data-home="HOM-03"]').scrollIntoViewIfNeeded(); await page.locator('[data-home="HOM-03"]').click(); await W(600);
      const hp = await text();
      ok(`${tag}: a home page shows rooms, size, terms and features`, (await page.locator("[data-estate]").count()) === 1 && hp.includes(T("تفاصيل السكن", "Home details")) && hp.includes(T("تمليك", "Ownership")) && /380/.test(hp.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))));
      ok(`${tag}: a home page has no price and no demo wording, and says EyeMakkah is not a broker`, !PRICE.test(hp) && !DEMO_WORDS.test(hp) && hp.includes(T("ليس وسيطًا عقاريًا", "not a property broker")));
      await english("a home page");
      ok(`${tag}: the detail page hides the bottom navigation`, (await page.locator("[data-nav]").count()) === 0);
      ok(`${tag}: two actions — register interest and request details`, (await page.locator('[data-request-open="home"]').count()) === 2);
      await page.locator('[data-request-open="home"][data-purpose="info"]').click(); await W(400);
      const sheet = await page.locator('[data-request-sheet="home"]').locator("xpath=..").innerText();
      ok(`${tag}: the sheet opens on Request details and says it is saved in My requests`, (await page.locator('[data-request-purpose="info"] [aria-pressed="true"]').count()) === 1 && new RegExp(T("يُحفظ طلبك في «طلباتي»", "saved in My requests")).test(sheet) && !DEMO_WORDS.test(sheet) && !SENT.test(sheet));
      await page.locator("#request-note").fill(T("ننتقل بعد شهرين، أسرة من خمسة", "We move in two months, a family of five"));
      await page.locator("[data-request-submit]").click(); await W(400);
      ok(`${tag}: recorded, and the done screen never says sent`, (await page.locator("[data-request-done]").count()) === 1 && !SENT.test(await page.locator("[data-request-done]").innerText()));
      await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: the home page shows the recorded request`, (await page.locator('[data-request-open="home"]').count()) === 1 && (await page.locator('[data-request-open="home"]').innerText()).includes(T("طلبك مسجّل", "Request recorded")));
      await back();
      ok(`${tag}: the card on the listing shows it too`, (await page.locator('[data-home="HOM-03"]').innerText()).includes(T("طلبك مسجّل", "Request recorded")));
      await page.locator('[data-home="HOM-05"]').scrollIntoViewIfNeeded(); await page.locator('[data-home="HOM-05"]').click(); await W(600);
      await page.locator('[data-request-open="home"][data-purpose="interest"]').click(); await W(300); await page.locator("[data-request-submit]").click(); await W(300);
      await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: Register interest recorded on another home`, (await page.locator('[data-request-open="home"]').innerText()).includes(T("اهتمامك مسجّل", "Interest registered")));
      await back();

      /* Invest in Makkah */
      stage = "invest";
      await page.locator('[data-city-tab="invest"]').click(); await W(500);
      ok(`${tag}: seven opportunities`, (await page.locator("[data-opp]").count()) === 7);
      ok(`${tag}: no demo or sample wording on the directory`, !DEMO_WORDS.test(await text()), ((await text()).match(DEMO_WORDS) || [])[0]);
      ok(`${tag}: the directory says it is not an investment service`, new RegExp(T("ليس جهة استثمار", "not an investment company")).test(await text()));
      await english("Invest in Makkah");
      const inv = await plain();
      ok(`${tag}: no amount, return, guarantee or ranking on the directory`, !MONEY_ON_OPPS.test(inv), (inv.match(MONEY_ON_OPPS) || [])[0]);
      for (const [cat, n] of [["commercial", 1], ["hospitality", 2], ["retail", 2], ["development", 2]]) {
        await page.locator(`[data-opp-cat="${cat}"] button`).click(); await W(300);
        ok(`${tag}: the ${cat} category`, (await page.locator("[data-opp]").count()) === n, String(await page.locator("[data-opp]").count()));
      }
      await page.locator('[data-opp-cat="all"] button').click(); await W(300);
      await page.locator('[data-opp-area="misfalah"] button').click(); await W(300);
      ok(`${tag}: opportunities by location`, (await page.locator("[data-opp]").count()) === 1 && (await page.locator('[data-opp="OPP-05"]').count()) === 1);
      await page.locator('[data-opp-area="all"] button').click(); await W(300);
      await page.locator('[data-opp="OPP-03"] [data-opp-interest]').click(); await W(400);
      await page.locator("[data-request-submit]").click(); await W(300); await page.getByText(T("تم", "Done"), { exact: true }).click(); await W(300);
      ok(`${tag}: Register interest from the card changes the card`, (await page.locator('[data-opp="OPP-03"] [data-opp-interest]').innerText()).includes(T("اهتمامك مسجّل", "Interest registered")));
      await page.locator('[data-opp="OPP-01"] [data-opp-explore]').click(); await W(600);
      const op = await plain();
      ok(`${tag}: an opportunity page shows its profile`, (await page.locator("[data-opp-page]").count()) === 1 && op.includes(T("ملف الفرصة", "Opportunity profile")) && op.includes(T("طبيعة المشاركة", "Kind of involvement")));
      await english("an opportunity page");
      ok(`${tag}: an opportunity page has no amounts, returns or owner`, !MONEY_ON_OPPS.test(op) && !/(المالك|الجهة المالكة|owner:)/i.test(op), (op.match(MONEY_ON_OPPS) || [])[0]);
      await page.locator('[data-request-open="opp"][data-purpose="info"]').click(); await W(400);
      const osheet = await page.locator('[data-request-sheet="opp"]').locator("xpath=..").innerText();
      ok(`${tag}: requesting more information says it is not an investment or a commitment`, new RegExp(T("ليس استثمارًا ولا التزامًا", "not an investment or a commitment")).test(osheet));
      await page.locator("[data-request-submit]").click(); await W(300);
      await page.locator("[data-request-view]").click(); await W(500);
      ok(`${tag}: «View my requests» opens My requests`, (await page.locator("[data-requests]").count()) === 1);
      await page.screenshot({ path: `${OUT}/${lang}-${who}-requests.png` });

      /* My requests */
      stage = "requests";
      ok(`${tag}: four requests, newest first`, (await page.locator("[data-request-row]").count()) === 4 && (await page.locator("[data-request-row]").first().getAttribute("data-request-ref")) === "OPP-01");
      const reqText = await text();
      await english("My requests");
      ok(`${tag}: each shows its kind, purpose and status`, (await page.locator("[data-request-status]").count()) === 4 && reqText.includes(T("طلب معلومات", "Information request")) && reqText.includes(T("تسجيل اهتمام", "Registered interest")));
      ok(`${tag}: the note is kept`, reqText.includes(T("ننتقل بعد شهرين، أسرة من خمسة", "We move in two months, a family of five")));
      ok(`${tag}: My requests explains editing and withdrawing, with no demo wording`, reqText.includes(T("تعدّله أو تسحبه", "edit or withdraw")) && !DEMO_WORDS.test(reqText) && !SENT.test(reqText));
      await page.locator('[data-requests-filter="home"] button').click(); await W(300);
      ok(`${tag}: filter My requests by homes`, (await page.locator("[data-request-row]").count()) === 2);
      await page.locator('[data-requests-filter="opp"] button').click(); await W(300);
      ok(`${tag}: filter My requests by opportunities`, (await page.locator("[data-request-row]").count()) === 2);
      await page.locator('[data-requests-filter="all"] button').click(); await W(300);
      /* editing keeps one record per item */
      await page.locator('[data-request-row][data-request-ref="HOM-03"] button.lift').click(); await W(600);
      await page.locator('[data-request-open="home"]').click(); await W(300);
      await page.locator('[data-request-purpose="interest"] button').click(); await page.locator("[data-request-submit]").click(); await W(300);
      await page.locator("[data-request-view]").click(); await W(500);
      ok(`${tag}: editing a request updates it in place`, (await page.locator("[data-request-row]").count()) === 4 && (await page.locator('[data-request-row][data-request-ref="HOM-03"]').innerText()).includes(T("تسجيل اهتمام", "Registered interest")));

      /* persistence: reload and sign in again; then from Profile; withdraw */
      stage = "persistence";
      await page.reload({ waitUntil: "networkidle" }); await W(900);
      await signIn();
      await page.locator("[data-profile-entry]").click(); await W(500);
      ok(`${tag}: Profile counts the requests`, (await page.locator("[data-profile-requests]").innerText()).match(/[0-9٠-٩]+/)?.[0] === T("٤", "4"));
      await page.locator("[data-profile-requests] button").click(); await W(500);
      ok(`${tag}: four requests kept after reload, reachable from Profile`, (await page.locator("[data-request-row]").count()) === 4);
      await page.locator('[data-request-row][data-request-ref="OPP-03"] [data-request-withdraw]').click(); await W(400);
      ok(`${tag}: a request can be withdrawn`, (await page.locator("[data-request-row]").count()) === 3);

      /* the Assistant */
      stage = "assistant";
      await tab("home");
      const ask = async () => { await page.locator("[data-assistant-card]").getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(600); };
      await ask();
      for (const [q, kind, link, expect] of [
        [T("أبغى شقة للإيجار في مكة", "an apartment for rent in Makkah"), "home", T("افتح «عِش في مكة»", "Open Live in Makkah"), '[data-city-tab="live"][aria-pressed="true"]'],
        [T("فرص استثمارية في مكة", "investment opportunities in Makkah"), "opp", T("افتح «استثمر في مكة»", "Open Invest in Makkah"), '[data-city-tab="invest"][aria-pressed="true"]']]) {
        await page.locator("form input").fill(q); await page.locator("form button[type=submit]").click(); await W(1000);
        const last = page.locator("[data-screen] .up").last();
        ok(`${tag}: Assistant «${q}» answers with the items, without demo wording`, (await last.locator(`[data-agent-city="${kind}"] button`).count()) >= 1 && !DEMO_WORDS.test(await last.innerText()), (await last.innerText()).slice(0, 140));
        await last.getByRole("button", { name: link, exact: true }).click(); await W(600);
        ok(`${tag}: Assistant link «${link}» opens the screen`, (await page.locator(expect).count()) === 1);
        await back();
        if (!(await page.locator("form input").count())) { await tab("home"); await ask(); }
      }
      await page.locator("form input").fill(T("كم العائد لو استثمرت في مقهى؟", "what returns would I get investing in a cafe?")); await page.locator("form button[type=submit]").click(); await W(1000);
      const money = await page.locator("[data-screen] .up").last().innerText();
      ok(`${tag}: a returns question gets no figures or advice`, new RegExp(T("ما أقدّم أرقامًا", "I don't give figures")).test(money) && !/(\d+\s?%|٪)/.test(money), money.slice(0, 140));
      await page.locator("form input").fill(T("وش طلباتي", "show my requests")); await page.locator("form button[type=submit]").click(); await W(1000);
      const mine = await page.locator("[data-screen] .up").last().innerText();
      ok(`${tag}: «my requests» lists them and links to My requests`, mine.includes(T("طلبات", "requests")) && (await page.locator("[data-screen] .up").last().getByRole("button", { name: T("افتح طلباتي", "Open my requests"), exact: true }).count()) === 1, mine.slice(0, 140));
      await page.locator("form input").fill(T("أبغى فندق قريب من الحرم", "a hotel near the Haram")); await page.locator("form button[type=submit]").click(); await W(1000);
      ok(`${tag}: a hotel is still a stay search, not housing`, (await page.locator("[data-screen] .up").last().locator("[data-agent-city]").count()) === 0);
    } catch (e) { ok(`${tag}: journey ran to the end`, false, `${stage}: ${e.message.split("\n")[0]}`); await page.screenshot({ path: `${OUT}/${lang}-${who}-error.png` }).catch(() => {}); }
    await ctx.close();
  }
}

console.log(`\n${pass}/${pass + fail} checks passed · ${runtime.length} runtime errors`);
if (runtime.length) console.log(runtime.slice(0, 8));
await browser.close(); await site.close();
process.exit(fail || runtime.length ? 1 : 0);
