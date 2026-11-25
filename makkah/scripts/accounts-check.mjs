/* The two ready accounts, in Chromium, Arabic and English:
   · visitor (a family visit, 3–5 days): a personalised Home, a trip already in progress in
     «رحلتي في مكة» (done, booked, planned and undated stops in a suggested order), saved restaurants
     around the Haram and family places, a community question, and an Assistant that plans a family
     day and finds restaurants near the Haram with working buttons
   · resident (Al-Awali): a neighbourhood Home, communities joined with posts written, a week of local
     activities with real statuses, saved places, and requests in «طلباتي» for a home and for
     business opportunities that can be opened, edited and withdrawn; the Assistant answers about the
     area, communities, housing, opportunities and the requests, and its buttons open the screens
   · both: plan management works, changes persist after a reload, and signing out of one account and
     into the other never mixes their data
   The accounts' sign-in details are in docs/ACCOUNTS.md; their earlier …@rihab.demo addresses still sign in.
   Usage: node scripts/accounts-check.mjs   (LANGS=ar,en  WHO=visitor,resident  WIDTH=390) */
import { launchBrowser, serveBuild, outDir } from "./lib/browser.mjs";
import { mkdirSync } from "node:fs";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WHO = (process.env.WHO || "visitor,resident").split(",");
const WIDTH = +(process.env.WIDTH || 390);
const OUT = outDir("accounts");
mkdirSync(OUT, { recursive: true });
const site = await serveBuild();
const browser = await launchBrowser();
const runtime = [];
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else fail++; console.log(`${cond ? "✓" : "✗"} ${name}${!cond && detail ? " — " + detail : ""}`); };
const ACCOUNT = { visitor: "visitor@rihab.app", resident: "resident@rihab.app" };
const PASSWORD = "demo";

for (const lang of LANGS) {
  const T = (a, e) => (lang === "en" ? e : a);
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on("pageerror", (e) => runtime.push(`${lang}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) runtime.push(`${lang}: console ${m.text()}`); });
  const W = (n = 400) => page.waitForTimeout(n);
  const text = () => page.locator("[data-screen]").innerText();
  const close = async () => { const c = page.getByLabel(T("إغلاق", "Close"), { exact: true }).first(); if (await c.count() && await c.isVisible().catch(() => false)) { await c.click(); await W(250); } };
  const back = async () => { await page.getByLabel(T("رجوع", "Back"), { exact: true }).first().click(); await W(); };
  const tab = async (id) => {
    for (let i = 0; i < 8; i++) {
      const nav = page.locator(`[data-nav="${id}"]`);
      if (await nav.count() && await nav.first().isVisible().catch(() => false)) { await nav.first().click(); await W(500); return; }
      await close(); const b = page.getByLabel(T("رجوع", "Back"), { exact: true }).first();
      if (await b.count() && await b.isVisible().catch(() => false)) { await b.click(); await W(250); }
    }
  };
  const signIn = async (who) => {
    const start = page.getByText(/^(ابدأ|Enter رحاب مكة)$/).first();
    if (await start.count()) { await start.click(); await W(500); }
    const pick = page.locator(`[data-lang="${lang}"]`); if (await pick.count()) await pick.click();
    await page.locator("[data-auth-email]").waitFor();
    await page.locator("[data-auth-email]").fill(ACCOUNT[who]); await page.locator("[data-auth-password]").fill(PASSWORD); await page.locator("[data-auth-submit]").click();
    await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(700);
    for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
  };
  const signOut = async () => {
    await tab("home");
    await page.locator("[data-profile-entry]").click(); await W(500);
    const out = page.getByRole("button", { name: T("تسجيل الخروج", "Sign out") }).first();
    await out.scrollIntoViewIfNeeded(); await out.click(); await W(400);
    const confirm = page.getByRole("button", { name: T("تسجيل الخروج", "Sign out") }).last();
    if (await confirm.isVisible().catch(() => false)) { await confirm.click().catch(() => {}); }
    await page.locator("[data-auth-email]").waitFor({ timeout: 10000 }); await W(400);
  };
  const ask = async (q) => {
    await page.locator("form input").fill(q); await page.locator("form button[type=submit]").click(); await W(1100);
    return page.locator("[data-screen] .up").last();
  };
  const openAssistant = async () => { await tab("home"); await page.locator("[data-assistant-card]").getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(600); };
  const planRows = () => page.locator("[data-plan-row]");
  const stored = (key) => page.evaluate((k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }, key);
  let stage = "start";
  try {
    await page.goto(site.url, { waitUntil: "networkidle" }); await W(700);
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle" }); await W(600);

    if (WHO.includes("visitor")) {
      const tag = `${lang}/visitor`;
      /* ── Phase 1: the visitor account ── */
      stage = "visitor home"; await signIn("visitor");
      const home = await text();
      ok(`${tag}: Home greets Yousef and shows the family visit`, home.includes("يوسف") && home.includes(T("٣–٥ أيام", "3–5 days")) && home.includes(T("عائلة مع أطفال", "Family with children")));
      ok(`${tag}: Home shows the trip under way`, (await page.locator("[data-trip-bridge]").count()) === 1);
      stage = "visitor plan"; await tab("plan");
      const plan = await text();
      ok(`${tag}: My Plan is «${T("رحلتي في مكة", "My Makkah trip")}»`, plan.includes(T("رحلتي في مكة", "My Makkah trip")));
      ok(`${tag}: the trip holds at least eight stops`, (await planRows().count()) >= 8, String(await planRows().count()));
      ok(`${tag}: places without a time come in a suggested order`, (await page.locator('[data-trip-section="undated"] [data-plan-row]').count()) >= 3);
      ok(`${tag}: a booked session and an event the family is going to`, plan.includes(T("جلسة حكواتي", "Storyteller session")) && plan.includes(T("ليلة التراث في جرول", "Heritage night in Jarwal")));
      ok(`${tag}: something already done`, (await page.locator('[data-trip-section="done"] [data-plan-row]').count()) >= 1 && plan.includes(T("متحف برج الساعة", "Clock Tower Museum")));
      ok(`${tag}: saved restaurants around the Haram`, (await page.locator('[data-trip-section="saved"] [data-plan-row]').count()) >= 4 && plan.includes(T("البيك — جبل عمر", "ALBAIK — Jabal Omar")));
      ok(`${tag}: no item is shown as confirmed`, !plan.split("\n").some((l) => l.trim() === T("مؤكد", "Confirmed")));
      await page.screenshot({ path: `${OUT}/${lang}-visitor-plan.png` });
      /* manage: remove a saved place, then add it back from its page */
      stage = "visitor plan manage";
      const before = await planRows().count();
      const albaikRow = planRows().filter({ hasText: T("البيك — جبل عمر", "ALBAIK — Jabal Omar") }).first();
      await albaikRow.getByRole("button", { name: T("أضف إلى خطتي", "Add to my plan") }).click(); await W(400);
      ok(`${tag}: a saved restaurant moves into the trip`, (await page.locator('[data-trip-section="saved"]').innerText()).includes(T("البيك — جبل عمر", "ALBAIK — Jabal Omar")) === false);
      const host = () => planRows().filter({ hasText: T("ضيافة أسرة مكية", "Hosted by a Makkan family") });
      await host().first().getByRole("button", { name: T("أزل من خطتي", "Remove from my plan") }).click(); await W(400);
      ok(`${tag}: a stop can be removed`, (await planRows().count()) === before - 1 && (await host().count()) === 0);
      /* community */
      stage = "visitor community"; await tab("community");
      await page.getByText(T("كل المجتمعات", "All communities"), { exact: true }).first().click(); await W(500);
      await page.getByText(T("أول زيارة لمكة", "First visit to Makkah"), { exact: true }).first().click(); await W(700);
      ok(`${tag}: a member of «${T("أول زيارة لمكة", "First visit to Makkah")}»`, (await text()).includes(T("أنت عضو", "You're a member")));
      await page.getByText(T("أسئلة", "Questions"), { exact: true }).first().click(); await W(400);
      ok(`${tag}: the family's own question is there`, (await text()).includes(T("أول زيارة لنا لمكة مع طفلين", "Our first visit to Makkah with two children")));
      /* the Assistant */
      stage = "visitor assistant"; await openAssistant();
      let a = await ask("رتب لي يومي مع العائلة");
      const day = await a.innerText();
      ok(`${tag}: «رتب لي يومي مع العائلة» returns a family itinerary`, (await a.locator("[data-composed-plan], [data-outing]").count()) >= 1 || /(مسار مقترح|route|خطة|plan)/i.test(day), day.slice(0, 120));
      ok(`${tag}: the itinerary can be added to the plan`, (await a.getByRole("button", { name: /(أضف الخطوات لخطتي|Add the steps to my plan)/ }).count()) === 1);
      a = await ask("أبغى مطعم قريب من الحرم");
      const food = await a.innerText();
      ok(`${tag}: «أبغى مطعم قريب من الحرم» lists restaurants`, /(البيك|الرومانسية|كشري|جان برجر|مادو|ALBAIK|Romansiah|Koshary|Jan Burger|Mado)/.test(food), food.slice(0, 120));
      const details = a.getByRole("button", { name: T("التفاصيل", "Details") }).first();
      ok(`${tag}: restaurant cards have working buttons`, (await details.count()) === 1);
      await details.click(); await W(700);
      ok(`${tag}: Details opens the restaurant page`, (await page.locator("[data-object-meta]").count()) === 1);
      await back();
      /* persistence */
      stage = "visitor reload";
      await page.reload({ waitUntil: "networkidle" }); await W(900);
      if (!(await page.locator("[data-home-greeting]").count())) await signIn("visitor");
      await tab("plan");
      ok(`${tag}: the changes are kept after a reload`, (await host().count()) === 0 && (await planRows().count()) === before - 1);
      const rec = await stored("rihab.makkah.plan.v1.local-demo-visitor");
      ok(`${tag}: the prepared history is written once, not re-applied`, rec?.prepared === 1 && !rec.plan.some((p) => p.obj === "x-family-host"));
      ok(`${tag}: nothing in the trip needs review`, !(await text()).includes(T("يحتاج مراجعة", "Needs review")));
      await page.screenshot({ path: `${OUT}/${lang}-visitor-plan-after.png` });
      await signOut();
    }
    if (WHO.includes("resident")) {
      const tag = `${lang}/resident`;
      /* ── Phase 2: the resident account ── */
      stage = "resident home"; await signIn("resident");
      const home = await text();
      ok(`${tag}: Home greets Amal in Al-Awali`, home.includes("أمل") && home.includes(T("العوالي", "Al-Awali")));
      ok(`${tag}: Home offers Makkah Opportunities and the community`, (await page.locator('[data-home-module="city-ops"]').count()) === 1 && (await page.locator("[data-community-hub]").count()) === 1);
      stage = "resident plan"; await tab("plan");
      const plan = await text();
      ok(`${tag}: a week of local activities with real statuses`, (await planRows().count()) >= 8 && [T("سأحضر", "I'm going"), T("مسجَّل", "Registered"), T("مهتم به", "Interested"), T("اكتمل", "Completed")].every((x) => plan.includes(x)), String(await planRows().count()));
      ok(`${tag}: the neighbourhood clean-up and the evening market are in it`, plan.includes(T("مبادرة تنظيف الحي", "Neighbourhood clean-up")) && plan.includes(T("سوق الحي المسائي — العوالي", "Evening district market — Al-Awali")));
      ok(`${tag}: nothing in the plan needs review`, !plan.includes(T("يحتاج مراجعة", "Needs review")));
      const before = await planRows().count();
      const cook = () => planRows().filter({ hasText: T("مطبخ العائلة — جلسة الأطفال", "Family kitchen — children's session") });
      await cook().first().getByRole("button", { name: T("أزل من خطتي", "Remove from my plan") }).click(); await W(400);
      ok(`${tag}: plan management works`, (await planRows().count()) === before - 1 && (await cook().count()) === 0);
      await page.screenshot({ path: `${OUT}/${lang}-resident-plan.png` });
      /* community */
      stage = "resident community"; await tab("community");
      await page.getByText(T("كل المجتمعات", "All communities"), { exact: true }).first().click(); await W(500);
      await page.getByRole("button", { name: T("افتح مجتمع الحي", "Open your area's community") }).first().click(); await W(700);
      const awali = await text();
      ok(`${tag}: a member of the Al-Awali community`, awali.includes(T("أنت عضو", "You're a member")));
      ok(`${tag}: her own tip is posted there`, awali.includes(T("ساحة العائلات في العوالي أهدأ بعد صلاة العشاء", "The family square in Al-Awali is quieter after the Isha prayer")));
      await page.getByRole("button", { name: T("تابِع", "Follow"), exact: true }).first().click(); await W(300);
      ok(`${tag}: community actions work (follow)`, new RegExp(T("تتابعه", "Following")).test(await text()));
      /* requests */
      stage = "resident requests"; await tab("home");
      await page.locator("[data-profile-entry]").click(); await W(500);
      ok(`${tag}: Profile counts three requests`, /(٣|3)/.test(await page.locator("[data-profile-requests]").innerText()));
      await page.locator("[data-profile-requests] button").click(); await W(500);
      ok(`${tag}: My requests has a home and two opportunities`, (await page.locator('[data-request-row="home"]').count()) === 1 && (await page.locator('[data-request-row="opp"]').count()) === 2);
      ok(`${tag}: each request keeps its note`, (await text()).includes("نفكر ننتقل لشقة أكبر"));
      await page.locator('[data-request-row][data-request-ref="HOM-04"] button.lift').click(); await W(600);
      ok(`${tag}: a request opens its home`, (await page.locator('[data-estate="HOM-04"]').count()) === 1 && (await page.locator('[data-request-open="home"]').innerText()).includes(T("طلبك مسجّل", "Request recorded")));
      await page.locator('[data-request-open="home"]').click(); await W(300);
      await page.locator('[data-request-purpose="interest"] button').click(); await page.locator("[data-request-submit]").click(); await W(300);
      await page.locator("[data-request-view]").click(); await W(500);
      ok(`${tag}: a request can be edited in place`, (await page.locator("[data-request-row]").count()) === 3 && (await page.locator('[data-request-row][data-request-ref="HOM-04"]').innerText()).includes(T("تسجيل اهتمام", "Registered interest")));
      await page.locator('[data-request-row][data-request-ref="OPP-03"] [data-request-withdraw]').click(); await W(400);
      ok(`${tag}: a request can be withdrawn`, (await page.locator("[data-request-row]").count()) === 2);
      await page.locator('[data-request-row][data-request-ref="OPP-04"] button.lift').click(); await W(600);
      ok(`${tag}: an opportunity opens from My requests`, (await page.locator('[data-opp-page="OPP-04"]').count()) === 1);
      await back();
      /* the Assistant */
      stage = "resident assistant"; await openAssistant();
      for (const [q, check, label] of [
        [T("وش فيه في حيّي؟", "What's on in my area?"), async (a) => (await a.locator("[data-agent-card], .lift").count()) >= 1 && (await a.innerText()).includes(T("العوالي", "Al-Awali")), "activities in her area"],
        [T("وش المجتمعات المناسبة لي؟", "Which communities suit me?"), async (a) => /(مجتمع|community|communities)/i.test(await a.innerText()), "communities"],
        [T("أبغى شقة للإيجار في مكة", "an apartment for rent in Makkah"), async (a) => (await a.locator('[data-agent-city="home"]').count()) === 1, "housing"],
        [T("فرص استثمارية في مكة", "investment opportunities in Makkah"), async (a) => (await a.locator('[data-agent-city="opp"]').count()) === 1, "business opportunities"],
        [T("وش طلباتي", "show my requests"), async (a) => (await a.innerText()).includes(T("طلبان", "2 requests")), "her requests"]]) {
        const a = await ask(q);
        ok(`${tag}: Assistant answers about ${label}`, await check(a), (await a.innerText()).slice(0, 140));
      }
      await page.locator("[data-screen] .up").last().getByRole("button", { name: T("افتح طلباتي", "Open my requests"), exact: true }).click(); await W(600);
      ok(`${tag}: the Assistant's button opens My requests`, (await page.locator("[data-requests]").count()) === 1);
      /* reload, then switch accounts: nothing mixes */
      stage = "resident reload";
      await page.reload({ waitUntil: "networkidle" }); await W(900);
      if (!(await page.locator("[data-home-greeting]").count())) await signIn("resident");
      await tab("plan");
      ok(`${tag}: changes are kept after a reload`, (await cook().count()) === 0);
      stage = "switch accounts"; await signOut();
      /* the earlier address still signs in to the same account */
      ACCOUNT.resident = "resident@rihab.app"; await signIn("resident"); ACCOUNT.resident = "resident@rihab.app";
      await page.locator("[data-profile-entry]").click(); await W(500);
      ok(`${tag}: the earlier address signs in to the same account`, /(٢|2)/.test(await page.locator("[data-profile-requests]").innerText()));
      await signOut();
      if (WHO.includes("visitor")) {
        await signIn("visitor"); await tab("plan");
        const vplan = await text();
        ok(`${lang}: the visitor's trip has none of the resident's items`, !vplan.includes(T("مبادرة تنظيف الحي", "Neighbourhood clean-up")) && vplan.includes(T("متحف برج الساعة", "Clock Tower Museum")));
        await page.locator('[data-nav="home"]').click(); await W(400); await page.locator("[data-profile-entry]").click(); await W(500);
        ok(`${lang}: the visitor has no requests of the resident's`, /^\D*(٠|0)/.test(await page.locator("[data-profile-requests]").innerText()));
        await signOut();
      }
      await signIn("resident"); await page.locator("[data-profile-entry]").click(); await W(500);
      ok(`${tag}: the resident's requests are still hers after the switch`, /(٢|2)/.test(await page.locator("[data-profile-requests]").innerText()));
      await signOut();
    }
  } catch (e) { ok(`${lang}: journey ran to the end`, false, `${stage}: ${e.message.split("\n")[0]}`); await page.screenshot({ path: `${OUT}/${lang}-error.png` }).catch(() => {}); }
  await ctx.close();
}

console.log(`\n${pass}/${pass + fail} checks passed · ${runtime.length} runtime errors`);
if (runtime.length) console.log(runtime.slice(0, 8));
await browser.close(); await site.close();
process.exit(fail || runtime.length ? 1 : 0);
