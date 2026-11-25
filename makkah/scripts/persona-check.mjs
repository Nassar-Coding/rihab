/* One app, two experiences: end-to-end checks of the resident and visitor personas,
   in Arabic and English, at 360 and 390 px.
   · the two demo accounts work on a fresh device and after storage is cleared
   · Home, Discover, Community, My Plan and the Assistant compose differently per persona
   · each persona gets its own accent theme, and the tokens don't leak
   · the persona is fixed: no control changes it, and it survives sign-out / sign-in
   · a new visitor signs up without being asked for a neighbourhood
   · real places stay honest (no hours or offers claimed) and carry no source/photo talk
   Usage: node scripts/persona-check.mjs   (LANGS=ar,en  WIDTHS=360,390) */
import { launchBrowser, serveBuild } from "./lib/browser.mjs";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WIDTHS = (process.env.WIDTHS || "360,390").split(",").map(Number);
const site = await serveBuild();
const browser = await launchBrowser();
let pass = 0, fail = 0;
const runtime = [];
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const W = (page, ms = 350) => page.waitForTimeout(ms);

const RESIDENT_ORDER = ["new-around", "in-area", "this-week", "food", "community", "hobbies", "initiatives", "daily"];
const VISITOR_ORDER = ["by-interest", "must-do", "for-you", "today", "food", "culture", "nearby", "build-trip", "visitor-services", "tips"];
const inOrder = (got, want) => { const seq = got.filter((x) => want.includes(x)); return seq.length >= want.length - 2 && seq.every((x, i) => i === 0 || want.indexOf(x) > want.indexOf(seq[i - 1])); };

async function newPage(width, lang) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => runtime.push(`${lang}@${width}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_|net::/.test(m.text())) runtime.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.lang = lang; page.ctx = ctx;
  return page;
}
async function start(page) {
  await page.goto(site.url, { waitUntil: "domcontentloaded" });
  await page.getByText(/^(ابدأ|Enter رحاب مكة)$/).first().click();
  await page.locator(`[data-lang="${page.lang}"]`).click();
  await page.locator('[data-auth-screen="login"]').waitFor(); await W(page, 300);
}
async function signIn(page, email, password) {
  await page.locator("[data-auth-email]").fill(email);
  await page.locator("[data-auth-password]").fill(password);
  await page.locator("[data-auth-submit]").click();
  await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(page, 500);
}
async function signOut(page) {
  await page.locator('[data-nav="home"]').click(); await W(page, 250);
  await page.locator("[data-profile-entry]").click(); await W(page);
  await page.locator("[data-account-signout]").click(); await W(page);
  await page.locator("[data-confirm-signout]").click(); await page.locator('[data-auth-screen="login"]').waitFor(); await W(page, 300);
}
const tab = async (page, t) => { await page.locator(`[data-nav="${t}"]`).click(); await W(page, 600); };
const modules = (page) => page.$$eval("[data-home-module]", (els) => els.map((e) => e.getAttribute("data-home-module")));
const theme = (page) => page.evaluate(() => { const r = document.querySelector("[data-app]"); const cs = getComputedStyle(r); return { persona: r.getAttribute("data-persona"), accent: cs.getPropertyValue("--accent-primary").trim(), deep: cs.getPropertyValue("--accent-deep").trim() }; });
const overflow = (page) => page.evaluate(() => { const s = document.querySelector("[data-screen]"); return (s ? s.scrollWidth - s.clientWidth : 0) > 1 || document.documentElement.scrollWidth > window.innerWidth + 1; });
async function ask(page, q) {
  await page.locator('[data-nav="home"]').click(); await W(page, 300);
  await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(page, 400);
  const intro = await page.locator("[data-assistant-persona]").getAttribute("data-assistant-persona").catch(() => null);
  await page.locator("form input").fill(q);
  await page.locator("form button[type=submit]").click(); await W(page, 900);
  const text = await page.locator("[data-screen]").innerText();
  await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 300);
  return { intro, text };
}

for (const width of WIDTHS) for (const lang of LANGS) {
  const en = lang === "en";
  const tag = `${lang}@${width}`;
  console.log(`\n── ${tag} ──`);

  /* resident demo */
  let page = await newPage(width, lang);
  await start(page);
  ok(`${tag}: shared entry (no persona theme before sign-in)`, (await theme(page)).persona === "entry");
  await signIn(page, "resident@rihab.app", "demo");
  const rTheme = await theme(page);
  ok(`${tag}: resident theme is Palm Green`, rTheme.persona === "resident" && rTheme.accent.toUpperCase() === "#315C49" && rTheme.deep.toUpperCase() === "#244638", JSON.stringify(rTheme));
  ok(`${tag}: resident Home title`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "resident");
  const rMods = await modules(page);
  ok(`${tag}: resident Home section order`, inOrder(rMods, RESIDENT_ORDER), rMods.join(","));
  ok(`${tag}: resident Home has no visitor sections`, !rMods.some((m) => ["must-do", "by-interest", "build-trip", "tips"].includes(m)));
  ok(`${tag}: resident time chips (today / week / weekend)`, (await page.locator("[data-time-chips]").count()) === 1);
  ok(`${tag}: resident Home fits the width`, !(await overflow(page)));
  await tab(page, "discover");
  ok(`${tag}: resident Discover starts from the area`, (await page.locator('[data-discover-entry="resident"]').count()) === 1 && (await page.locator('[data-discover-chips="resident"] button').first().innerText()).match(/اليوم|Today/));
  await tab(page, "community");
  ok(`${tag}: resident Community is participation-first`, (await page.locator('[data-community-framing="participation"]').count()) === 1 && (await page.locator("[data-hood-community]").count()) === 1);
  await tab(page, "plan");
  ok(`${tag}: resident My Plan is the week`, (await page.locator('[data-plan-title="plan"]').count()) === 1 && (await page.locator("[data-plan-week]").count()) === 1);
  const rAsk = await ask(page, en ? "switch me to visitor" : "خلني زائر");
  ok(`${tag}: resident Assistant is a local-life companion`, rAsk.intro === "local");
  ok(`${tag}: Assistant refuses to switch the persona`, /(لا يتغيّر|can't be changed)/.test(rAsk.text));
  await page.locator("[data-profile-entry]").click(); await W(page);
  ok(`${tag}: account shows the resident type`, /(ساكن في مكة|Makkah resident)/.test(await page.locator("[data-account-mode]").innerText()));
  await page.locator("[data-account-edit]").click(); await W(page, 400);
  ok(`${tag}: persona is locked in Edit details`, (await page.locator('[data-profile-mode-locked="resident"]').count()) === 1 && (await page.locator("[data-profile-mode]").count()) === 0);
  await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 300);
  await page.getByLabel(/^(رجوع|Back)$/).first().click().catch(() => {}); await W(page, 300);
  await signOut(page);
  ok(`${tag}: theme returns to the shared brand after sign-out`, (await theme(page)).persona === "entry");

  /* visitor demo, same browser profile */
  await signIn(page, "visitor@rihab.app", "demo");
  const vTheme = await theme(page);
  ok(`${tag}: visitor theme is Brass`, vTheme.persona === "visitor" && vTheme.accent.toUpperCase() === "#B8893D" && vTheme.accent.toUpperCase() !== rTheme.accent.toUpperCase(), JSON.stringify(vTheme));
  ok(`${tag}: visitor Home title`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "visitor");
  const vMods = await modules(page);
  ok(`${tag}: visitor Home section order`, inOrder(vMods, VISITOR_ORDER), vMods.join(","));
  ok(`${tag}: visitor Home has no resident sections`, !vMods.some((m) => ["new-around", "in-area", "this-week", "community", "hobbies", "initiatives"].includes(m)));
  ok(`${tag}: visit context (duration, company, interests) is visible`, /(٣–٥ أيام|3–5 days)/.test(await page.locator("[data-visit-context]").innerText()) && /(عائلة مع أطفال|Family with children)/.test(await page.locator("[data-visit-context]").innerText()));
  ok(`${tag}: visitor isn't asked for live location`, (await page.locator("[data-where-now]").count()) === 1);
  ok(`${tag}: visitor Home fits the width`, !(await overflow(page)));
  ok(`${tag}: Home differs between personas`, rMods.join() !== vMods.join());
  await tab(page, "discover");
  ok(`${tag}: visitor Discover starts from interests, time and company`, (await page.locator('[data-discover-entry="visitor"]').count()) === 1);
  await tab(page, "community");
  ok(`${tag}: visitor Community is guidance-first`, (await page.locator('[data-community-framing="guidance"]').count()) === 1 && (await page.locator("[data-ask-locals]").count()) === 1);
  await tab(page, "plan");
  ok(`${tag}: visitor My Plan reads as a trip`, (await page.locator('[data-plan-title="trip"]').count()) === 1 && (await page.locator("[data-trip-section]").count()) >= 1);
  ok(`${tag}: trip plan items stay "planned" — nothing booked`, !/(^|\n)(مؤكد|Confirmed)(\n|$)/.test(await page.locator("[data-screen]").innerText()));
  const vAsk = await ask(page, en ? "switch me to resident" : "حوّلني لساكن");
  ok(`${tag}: visitor Assistant is a trip companion`, vAsk.intro === "trip");
  ok(`${tag}: visitor Assistant refuses to switch`, /(لا يتغيّر|can't be changed)/.test(vAsk.text));
  const near = await ask(page, en ? "what's near me now?" : "وش قريب مني الآن؟");
  ok(`${tag}: no guessed location for "near me"`, /(لا نستخدم موقعك|don't use your live location)/.test(near.text));
  await page.locator("[data-profile-entry]").click(); await W(page);
  ok(`${tag}: account still a visitor after the Assistant`, /(زائر لمكة|Makkah visitor)/.test(await page.locator("[data-account-mode]").innerText()));
  await page.locator("[data-account-edit]").click(); await W(page, 400);
  ok(`${tag}: visitor persona locked in Edit details`, (await page.locator('[data-profile-mode-locked="visitor"]').count()) === 1 && (await page.locator("[data-profile-mode]").count()) === 0);
  await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 300);
  await page.getByLabel(/^(رجوع|Back)$/).first().click().catch(() => {}); await W(page, 300);
  await signOut(page);
  await signIn(page, "visitor@rihab.app", "demo");
  ok(`${tag}: persona survives sign-out / sign-in`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "visitor" && (await theme(page)).persona === "visitor");

  /* real places stay honest */
  await page.getByText(en ? "Search for a place, an experience or a community" : "ابحث عن مكان أو تجربة أو مجتمع").first().click(); await W(page, 300);
  await page.locator("input").first().fill(en ? "Jarir Bookstore" : "مكتبة جرير"); await W(page, 800);
  const hit = page.getByText(en ? "Jarir Bookstore — Al Awali" : "مكتبة جرير — فرع العوالي", { exact: true });
  await (await hit.count() > 1 ? hit.nth(1) : hit.first()).click(); await W(page, 700);
  const top = (await page.locator("[data-screen]").innerText()).split(/وبعدها؟|And after\?/)[0];
  const pageText = await page.evaluate(() => document.querySelector(".em")?.innerText || "");
  ok(`${tag}: real venue shows no hours / prices / offers and no source or photo talk`, (await page.locator("[data-place-sources]").count()) === 0 && !/(مفتوح الآن|Open now|ريال|SAR|خصم|% off)/.test(top)
    && !/(من أين جاءت|Where this information|المصدر والسياق|Source and context|لا نعرض صورة|No photo shown|صورة سياقية|Context photo|شعار |\blogo\b)/i.test(pageText));

  /* demo accounts after the browser's storage is cleared */
  await page.evaluate(() => localStorage.clear());
  await start(page);
  await signIn(page, "resident@rihab.app", "demo");
  ok(`${tag}: resident demo works after storage is cleared`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "resident");
  await signOut(page);
  await signIn(page, "visitor@rihab.app", "demo");
  ok(`${tag}: visitor demo works after storage is cleared`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "visitor");
  await page.locator('[data-nav="plan"]').click(); await W(page, 400);
  const plan = await page.evaluate(() => { const uid = JSON.parse(localStorage.getItem("rihab.session.v1")).uid; return JSON.parse(localStorage.getItem(`rihab.makkah.plan.v1.${uid}`)).plan.map((p) => `${p.state}:${p.source}`); });
  ok(`${tag}: visitor account starts with its prepared trip (done, booked, planned and saved stops)`, plan.length >= 8 && plan.every((x) => x.endsWith(":prepared")) && ["completed", "registered", "going", "planned", "saved"].every((st) => plan.some((x) => x.startsWith(st + ":"))), JSON.stringify(plan));
  await page.ctx.close();

  /* a new visitor: no neighbourhood question, interests + duration + company required */
  page = await newPage(width, lang);
  await start(page);
  await page.locator("[data-create-account]").click(); await page.locator('[data-signup-method="email"]').click(); await W(page);
  const email = `visitor.${lang}.${width}.${Date.now()}@example.com`;
  await page.locator("[data-signup-email]").fill(email);
  await page.locator("[data-signup-password]").fill("makkah2026");
  await page.locator("[data-signup-confirm]").fill("makkah2026");
  await page.locator("[data-signup-submit]").click();
  await page.locator('[data-auth-screen="profile-setup"]').waitFor();
  await page.locator("#profile-firstName").fill(en ? "Lina" : "لينا");
  await page.locator("#profile-lastName").fill(en ? "Saleh" : "صالح");
  await page.locator("#profile-age").fill("29");
  await page.locator("#profile-nationality").selectOption("JO");
  await page.locator('[data-profile-mode="visitor"]').click(); await W(page, 250);
  ok(`${tag}: visitor sign-up asks no neighbourhood`, (await page.locator("#profile-nb").count()) === 0);
  await page.locator("[data-profile-submit]").click(); await W(page, 300);
  ok(`${tag}: visitor sign-up needs interests, duration and company`, (await page.locator('[data-field-error="profile-interests"]').count()) === 1 && (await page.locator('[data-field-error="profile-stay"]').count()) === 1 && (await page.locator('[data-field-error="profile-party"]').count()) === 1);
  await page.locator('[data-profile-interest="food"]').click();
  await page.locator('[data-profile-interest="market"]').click();
  await page.locator('[data-profile-stay="short"]').click();
  await page.locator('[data-profile-party="couple"]').click();
  await page.locator("[data-profile-submit]").click();
  await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(page, 500);
  ok(`${tag}: new visitor lands on the visitor experience`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "visitor" && (await theme(page)).persona === "visitor");
  ok(`${tag}: new visitor's choices shape Home`, /(زوجان|Couple)/.test(await page.locator("[data-visit-context]").innerText()));
  await page.ctx.close();
}

console.log(`\n${pass}/${pass + fail} checks passed · ${runtime.length} runtime errors`);
if (runtime.length) console.log(runtime.slice(0, 8));
await browser.close(); await site.close();
process.exit(fail || runtime.length ? 1 : 0);
