/* Consumer-copy check: the shipped app must not talk about its own data process.
   Signs in to both demo accounts (resident, visitor) in Arabic and English, walks
   Home, Discover, Community, My Plan, the account screen, notifications, a spread of
   place pages (real places with each kind of visual, sample places, an offer, an
   activity) and the Assistant, and scans the rendered text for sourcing, provenance,
   verification, confidence, review dates, image classification, missing-data
   justifications and prototype disclaimers.

   Every match fails the check, except a direct Assistant answer to a question the
   person asked about unknown details (hours, prices), which may say plainly that the
   information isn't available.

   Usage: node scripts/consumer-copy-check.mjs   (LANGS=ar,en  WIDTH=390) */
import { launchBrowser, serveBuild, outDir } from "./lib/browser.mjs";
import { mkdirSync } from "node:fs";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WIDTH = +(process.env.WIDTH || 390);
const OUT = outDir("consumer-copy");
mkdirSync(OUT, { recursive: true });

/* the internal vocabulary, Arabic and English */
const INTERNAL = [
  /من أين جاءت/, /لا نعرض (صورة|ساعات|أسعار)/, /موثّق|موثق|موثوق/, /لم نتحقق|نتحقق|تحقّق من|تحقق من المصدر|تأكد من الفرع/,
  /مراجعة للمصادر|آخر مراجعة|آخر تحديث/, /سياقية/, /شعار /, /Simple Icons|CC0|CC BY/, /مصدر|مصادر/, /قائمة عامة/,
  /توضيحي|توضيحية|للتوضيح/, /نموذج أولي|هذا النموذج|المنتج الحقيقي/, /مختلقة/, /أماكن حقيقية|حقيقية —|حقيقية في/, /ليست صورة|صورة عامة (للتوضيح|من مكتبة)/,
  /حساب العلامة/, /بيانات نموذج/,
  /Where this information/i, /\bverif(y|ied|ication)\b/i, /\bsources?\b/i, /\blisting\b/i, /\bconfidence\b/i,
  /last (checked|updated|reviewed)/i, /context photo/i, /\blogo\b/i, /illustrative/i, /prototype/i, /made-up/i,
  /real (places|restaurants)/i, /generic photo/i, /provenance/i, /\bCC BY\b|licen[cs]ed under|copyright/i, /no photo shown/i,
];
/* a direct Assistant answer about unknown hours or prices, to a question that asked for them */
const ASKED_UNKNOWN = /(ساعات عمل|أسعار|opening hours|prices)/i;

const site = await serveBuild();
const browser = await launchBrowser();
const findings = [];
const errors = [];
let surfaces = 0;

const PLACES = [
  ["ستاربكس — الدخيل مول", "Starbucks — Al Dakhail Mall"],         // brand mark
  ["برجر كنج — النور مول", "Burger King — Al Noor Mall"],          // brand mark
  ["مشي الفجر على ممشى قباء", "Fajr walk on the Quba Walking Trail"],   // context photo (the walkway it meets on)
  ["زيارة جبل أحد وجبل الرماة مع مرشد", "Guided visit to Mount Uhud and Archers' Hill"],   // context photo
  ["البيك — العزيزية", "ALBAIK — Al Aziziyah"],                    // logo
  ["متحف السلام", "Al-Salam Museum"],                              // category
  ["حديقة الخالدية", "Al-Khalidiyah Park"],                         // category
  ["المسجد النبوي", "The Prophet's Mosque"],                         // exact photo
  ["جبل أحد", "Mount Uhud"],                                        // exact photo
  ["حافلة معالم المدينة", "Madinah Landmarks Bus"],                  // sample, conflicting facts
  ["مطبخ مديني — العوالي", "Madani Home Kitchen — Al-Awali"],       // sample restaurant with offer
  ["مسار قصر عروة في وادي العقيق", "Urwa Palace trail in Wadi Al-Aqiq"],   // sample experience
];
const ASK = [
  ["متى يفتح البيك؟", "When does ALBAIK open?", true],
  ["كم أسعار ستاربكس؟", "How much is Starbucks?", true],
  ["وش فيه قريب مني؟", "What's near me?", false],
  ["أبغى مطعم في العوالي", "I want a restaurant in Al-Awali", false],
  ["فيه عروض اليوم؟", "Any offers today?", false],
  ["رتب لي اليوم", "Plan my day", false],
];

for (const lang of LANGS) {
  for (const who of ["resident", "visitor"]) {
    const tag = `${lang}/${who}`;
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${tag}: ${e.message}`));
    const W = (n) => page.waitForTimeout(n);
    const en = lang === "en";
    const T = (a, e) => (en ? e : a);
    const allowed = new Set();   // Assistant answers already accepted as replies to a direct question
    const scan = async (where, { asked = false } = {}) => {
      surfaces++;
      /* the «مثال توضيحي» / "Demo example" labels and demo notes on the Market and City Opportunities are
         required disclosures, marked [data-demo]; everything else is scanned */
      const text = await page.evaluate(() => {
        let t = document.querySelector(".app")?.innerText || "";
        for (const e of document.querySelectorAll(".app [data-demo]")) { const d = e.innerText.trim(); if (d) t = t.split(d).join(""); }
        return t;
      });
      for (const line of text.split("\n")) {
        const l = line.trim();
        if (!l) continue;
        const re = INTERNAL.find((r) => r.test(l));
        if (!re) continue;
        if (allowed.has(l)) continue;
        if (asked && ASKED_UNKNOWN.test(l)) { allowed.add(l); continue; }
        findings.push(`${tag} · ${where}: «${l.slice(0, 140)}»`);
      }
    };
    const clearOverlays = async () => {
      for (let i = 0; i < 4; i++) {
        const b = page.getByLabel(/^(إغلاق|رجوع|Close|Back)$/).first();
        if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await W(250); } else break;
      }
    };
    const tab = async (id) => { await clearOverlays(); await page.locator(`[data-nav="${id}"]`).first().click(); await W(600); };

    await page.goto(site.url, { waitUntil: "networkidle" }); await W(700);
    await page.getByText(/^(ابدأ|Enter Ruh Al Madinah)$/).first().click(); await W(400);
    await page.locator(`[data-lang="${lang}"]`).click(); await W(700);
    await page.locator("[data-auth-email]").fill(`${who}@ruhalmadinah.demo`);
    await page.locator("[data-auth-password]").fill("demo");
    await page.locator("[data-auth-submit]").click();
    await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 });
    for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
    await W(500);

    await scan("home");
    await page.screenshot({ path: `${OUT}/${lang}-${who}-home.png` });
    await tab("discover"); await scan("discover");
    await tab("community"); await scan("community");
    await tab("plan"); await scan("plan");
    /* the Market and City Opportunities */
    await tab("market"); await scan("market experiences");
    await page.locator('[data-market-tab="services"]').click(); await W(400); await scan("market services");
    await page.locator('[data-market-tab="products"]').click(); await W(400); await scan("market products");
    await page.locator('[data-product="PRD-01"]').click(); await W(600); await scan("product page");
    await page.locator('[data-request-open="product"]').click(); await W(400); await scan("product request sheet");
    await page.locator("[data-request-sheet]").locator("xpath=ancestor::div[contains(@class,'sheetIn')]").getByLabel(/^(إغلاق|Close)$/).click(); await W(300);
    await tab("home");
    await page.locator('[data-city-card="live"]').scrollIntoViewIfNeeded(); await page.locator('[data-city-card="live"]').click(); await W(600); await scan("live in madinah");
    await page.locator('[data-home="HOM-02"]').click(); await W(600); await scan("home page");
    await clearOverlays(); await tab("home");
    await page.locator('[data-city-card="invest"]').scrollIntoViewIfNeeded(); await page.locator('[data-city-card="invest"]').click(); await W(600); await scan("invest in madinah");
    await page.locator('[data-opp="OPP-01"] [data-opp-explore]').click(); await W(600); await scan("opportunity page");
    await tab("home");
    await page.getByLabel(/^(الإشعارات|Notifications)$/).first().click().catch(() => {}); await W(500); await scan("notifications");
    await tab("home");
    await page.getByLabel(/^(حسابي|My account)$/).first().click().catch(() => {}); await W(600); await scan("account");

    for (const [ar, enName] of PLACES) {
      await tab("home");
      await page.getByText(/ابحث عن مكان|Search for a place/).first().click(); await W(300);
      await page.keyboard.type(T(ar, enName)); await W(800);
      await scan(`search "${T(ar, enName)}"`);
      const exact = page.getByText(T(ar, enName), { exact: true });
      const n = await exact.count();
      if (!n) { findings.push(`${tag} · search "${T(ar, enName)}": no result to open (check skipped)`); continue; }
      await (n > 1 ? exact.nth(1) : exact.first()).click(); await W(800);
      await page.mouse.move(WIDTH / 2, 500);
      for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 900); await W(150); }
      await scan(`page "${T(ar, enName)}"`);
    }

    await tab("home");
    await page.locator("[data-assistant-card] button").last().click(); await W(700);
    await scan("assistant (opened)");
    for (const [a, e, asked] of ASK) {
      const input = page.getByLabel(/^(اسأل روح المدينة|Ask Ruh Al Madinah)$/).first();
      await input.fill(T(a, e)); await input.press("Enter"); await W(900);
      await scan(`assistant "${T(a, e)}"`, { asked });
    }
    await page.screenshot({ path: `${OUT}/${lang}-${who}-assistant.png` });
    await ctx.close();
  }
}
await browser.close(); site.close?.();

console.log(`surfaces scanned: ${surfaces} · runtime errors: ${errors.length}`);
if (errors.length) console.log(errors.slice(0, 5).join("\n"));
if (findings.length) {
  const uniq = [...new Set(findings)];
  console.log(`internal-language findings: ${uniq.length}`);
  console.log(uniq.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("internal-language findings: 0");
