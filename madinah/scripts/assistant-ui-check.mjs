/* The Assistant in the browser, for both personas in Arabic and English: what it answers is only half
   of it — its chips and card buttons must do what they say in the real app.
   · the persona's starter chips are shown and lead somewhere
   · a visitor's day plan is added to My Plan with one tap, and appears there
   · a card's Save and Add to my plan buttons change that place's state, and Details opens its page
   · "how do I get to …" opens that place
   · "ask the community about …" opens the composer with the question already written
   · a request it doesn't understand still offers a way on
   · no runtime errors, nothing wider than the screen
   Usage: node scripts/assistant-ui-check.mjs   (WIDTH=390) */
import { launchBrowser, serveBuild } from "./lib/browser.mjs";

const WIDTH = Number(process.env.WIDTH || 390);
const site = await serveBuild();
const browser = await launchBrowser();
let pass = 0, fail = 0;
const runtime = [];
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const W = (page, ms = 350) => page.waitForTimeout(ms);

async function open(persona, lang) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 820 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => runtime.push(`${persona}/${lang}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|ERR_|net::/.test(m.text())) runtime.push(`${persona}/${lang}: ${m.text()}`); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(site.url, { waitUntil: "domcontentloaded" });
  await page.getByText(/^(ابدأ|Enter Ruh Al Madinah)$/).first().click();
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('[data-auth-screen="login"]').waitFor(); await W(page, 300);
  await page.locator("[data-auth-email]").fill(`${persona}@ruhalmadinah.demo`);
  await page.locator("[data-auth-password]").fill("demo");
  await page.locator("[data-auth-submit]").click();
  await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(page, 400);
  page.ctx = ctx;
  return page;
}
const openAssistant = async (page) => { await page.locator('[data-nav="home"]').click(); await W(page, 300); await page.getByRole("button", { name: /^(اسأل|Ask)$/ }).first().click(); await W(page, 500); };
const chips = (page) => page.locator("form").locator("xpath=preceding-sibling::div[1]").locator("button");
const lastAnswer = (page) => page.locator("[data-screen] .up").last();
async function ask(page, q) {
  const before = await page.locator("[data-screen] .up").count();
  await page.locator("form input").fill(q);
  await page.locator("form button[type=submit]").click();
  await page.waitForFunction((n) => document.querySelectorAll("[data-screen] .up").length > n, before, { timeout: 5000 }).catch(() => {});
  await W(page, 300);
  return (await lastAnswer(page).innerText().catch(() => "")) || "";
}
const overflow = (page) => page.evaluate(() => { const s = document.querySelector("[data-screen]"); return (s ? s.scrollWidth - s.clientWidth : 0) > 1 || document.documentElement.scrollWidth > window.innerWidth + 1; });

for (const [persona, lang] of [["visitor", "en"], ["visitor", "ar"], ["resident", "ar"], ["resident", "en"]]) {
  const en = lang === "en", tag = `${persona}/${lang}`;
  console.log(`\n── ${tag} ──`);
  const page = await open(persona, lang);
  await openAssistant(page);
  const starters = await chips(page).allInnerTexts();
  ok(`${tag}: starter chips for the persona`, starters.length >= 2 && (persona === "visitor" ? starters.some((s) => /(يوم واحد|one day)/i.test(s)) : starters.some((s) => /(نهاية الأسبوع|weekend)/i.test(s))), starters.join(" | "));

  if (persona === "visitor") {
    /* the day-plan chip, then "add the steps to my plan" */
    await chips(page).first().click(); await W(page, 900);
    const addSteps = lastAnswer(page).getByRole("button", { name: /^(أضف الخطوات لخطتي|Add the steps to my plan)$/ });
    ok(`${tag}: the day-plan chip builds a plan`, (await addSteps.count()) === 1, (await lastAnswer(page).innerText()).slice(0, 160));
    if (await addSteps.count()) {
      await addSteps.click(); await W(page, 600);
      await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 300);
      await page.locator('[data-nav="plan"]').click(); await W(page, 700);
      const planText = await page.locator("[data-screen]").innerText();
      ok(`${tag}: the plan's steps are in My Plan`, /(متحف وبستان الصفية|As-Safiyyah Museum)/.test(planText), planText.slice(0, 200));
      await openAssistant(page);
    }
    /* a swap chip after a plan */
    await ask(page, en ? "plan my day" : "رتب لي يومي");
    const swap = (await chips(page).allInnerTexts()).find((s) => /(غير لي خطوة|Swap one step)/.test(s));
    ok(`${tag}: a plan offers "swap a step"`, !!swap);
    if (swap) { await chips(page).filter({ hasText: swap }).first().click(); await W(page, 900); ok(`${tag}: the swap chip changes a step`, /(غيّرت الخطوة|swapped the)/.test(await lastAnswer(page).innerText())); }
  }

  /* card buttons on a list */
  await ask(page, en ? "cafes in Al-Aziziyah" : "مقاهي في العزيزية");
  const card = lastAnswer(page);
  const save = card.getByRole("button", { name: /^(احفظ|Save)$/ }).first();
  ok(`${tag}: a list shows place cards with buttons`, (await save.count()) === 1);
  if (await save.count()) {
    await save.click(); await W(page, 700);
    ok(`${tag}: Save marks the place saved`, (await page.locator("[data-screen] .up").last().getByRole("button", { name: /^(محفوظ|Saved)$/ }).count()) >= 1 || /(حفظت|saved)/i.test(await lastAnswer(page).innerText()));
    const add = page.locator("[data-screen] .up").last().getByRole("button", { name: /^(أضف إلى خطتي|Add to my plan)$/ }).first();
    if (await add.count()) { await add.click(); await W(page, 700); ok(`${tag}: Add to my plan adds it`, /(أضفت|added|موجود في «خطتي»|already in My Plan)/i.test(await lastAnswer(page).innerText())); }
    const details = page.locator("[data-screen] .up").last().getByRole("button", { name: /^(التفاصيل|Details)$/ }).first();
    if (await details.count()) { await details.click(); await W(page, 800); ok(`${tag}: Details opens the place`, (await page.locator("[data-screen]").innerText()).length > 0 && !(await page.locator("form input[aria-label]").count())); await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 400); }
  }

  /* directions to a named place open it */
  await ask(page, en ? "how do I get to Quba Mosque" : "كيف أروح مسجد قباء");
  await W(page, 900);
  ok(`${tag}: "how do I get to Quba Mosque" opens it`, /(مسجد قباء|Quba Mosque)/.test(await page.locator("[data-screen]").innerText()) && !(await page.locator("form input[aria-label]").count()));
  await page.getByLabel(/^(رجوع|Back)$/).first().click().catch(() => {}); await W(page, 400);
  if (!(await page.locator("form input").count())) await openAssistant(page);

  /* asking the community: the composer opens with the question */
  await ask(page, en ? "ask the community about the best mandi in town" : "اسأل المجتمع عن أفضل مطعم مندي");
  const write = lastAnswer(page).getByRole("button", { name: /^(اكتب مساهمتك|Write your post)$/ });
  ok(`${tag}: "ask the community" offers the composer`, (await write.count()) === 1);
  if (await write.count()) {
    await write.click(); await W(page, 600);
    const draft = await page.locator("textarea").first().inputValue().catch(() => "");
    ok(`${tag}: the composer holds the question`, /(مندي|mandi)/i.test(draft) && !/(اسأل المجتمع|ask the community)/i.test(draft), draft);
    await page.keyboard.press("Escape"); await W(page, 300);
    await page.getByLabel(/^(إغلاق|Close)$/).first().click().catch(() => {}); await W(page, 300);
  }

  /* not understood: still a way on */
  await ask(page, "qwxz vbnm");
  ok(`${tag}: a request it doesn't understand still offers chips`, (await chips(page).count()) >= 1);
  ok(`${tag}: the Assistant fits the width`, !(await overflow(page)));
  await page.ctx.close();
}

ok("no runtime errors", runtime.length === 0, runtime.slice(0, 3).join(" | "));
await browser.close(); await site.close?.();
console.log(`\nAssistant UI: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
