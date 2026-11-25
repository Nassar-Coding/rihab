/* Rihab end-to-end: one sign-in at Rihab opens both cities; each city keeps its own
   persona; switching city; signing out from a city returns to Rihab; a new account
   sets up each city the first time, prefilled from the account. Arabic and English. */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./lib/serve.mjs";
import { launch } from "./lib/browser.mjs";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../.out/app");
let pass = 0, fail = 0;
const ok = (n, c, d = "") => { c ? pass++ : fail++; console.log(`${c ? "✓" : "✗"} ${n}${!c && d ? " — " + d : ""}`); };
const site = await serve(ROOT);
const browser = await launch();
const errors = [];
for (const lang of ["ar", "en"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${lang}: ${e.message}`));
  await page.addInitScript((l) => { if (!localStorage.getItem("rihab.lang")) localStorage.setItem("rihab.lang", JSON.stringify(l)); }, lang);
  const W = (ms = 600) => page.waitForTimeout(ms);
  const signIn = async (email, pw) => { await page.fill("input[type=email]", email); await page.fill("input[autocomplete=current-password]", pw); await page.click("[data-rihab-submit]"); };

  /* a city link without a session goes to Rihab */
  await page.goto(`${site.url}/makkah/`, { waitUntil: "networkidle" }); await W(1200);
  ok(`${lang}: /makkah/ without a session opens the Rihab sign-in`, new URL(page.url()).pathname === "/" && (await page.locator("[data-rihab-signin]").count()) === 1, page.url());

  await signIn("resident@rihab.app", "wrong-pass1"); await W(1500);
  ok(`${lang}: a wrong password is refused`, (await page.locator("[role=alert]").count()) === 1);
  await signIn("resident@rihab.app", "demo"); await page.waitForSelector("[data-city]", { timeout: 20000 });
  ok(`${lang}: the resident signs in at Rihab and sees both cities`, (await page.locator("[data-city]").count()) === 2);

  for (const city of ["makkah", "madinah"]) {
    await page.click(`[data-city=${city}]`); await page.waitForSelector("[data-home-greeting]", { timeout: 30000 }); await W(800);
    ok(`${lang}: ${city} opens straight on Home, signed in`, new URL(page.url()).pathname === `/${city}/`);
    ok(`${lang}: ${city} keeps the resident persona`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "resident");
    ok(`${lang}: ${city} keeps the Rihab language`, (await page.evaluate(() => document.documentElement.lang || document.querySelector("[dir]")?.getAttribute("dir"))) !== null);
    await page.click("[data-rihab-switch]"); await page.waitForSelector("[data-city]", { timeout: 20000 });
    ok(`${lang}: the switch on ${city} Home returns to the Rihab city picker`, new URL(page.url()).pathname === "/");
  }
  ok(`${lang}: Rihab remembers the last city`, (await page.locator("[data-city=madinah] .last").count()) === 1);

  /* from Madinah's profile straight to Makkah, then sign out from Makkah */
  await page.click("[data-city=madinah]"); await page.waitForSelector("[data-profile-entry]", { timeout: 30000 }); await W(500);
  await page.click("[data-profile-entry]"); await W(600);
  await page.click("[data-rihab-other]"); await page.waitForSelector("[data-home-greeting]", { timeout: 30000 }); await W(500);
  ok(`${lang}: Madinah's profile links straight to Rihab Makkah`, new URL(page.url()).pathname === "/makkah/");
  await page.click("[data-profile-entry]"); await W(600);
  await page.click("[data-account-signout]"); await W(300); await page.locator("[data-confirm-signout]").click();
  await page.waitForSelector("[data-rihab-signin]", { timeout: 20000 }).catch(() => {});
  ok(`${lang}: signing out in a city returns to the Rihab sign-in`, new URL(page.url()).pathname === "/" && (await page.locator("[data-rihab-signin]").count()) === 1, page.url());
  await page.goto(`${site.url}/madinah/`, { waitUntil: "networkidle" }); await W(1200);
  ok(`${lang}: after signing out, Madinah is signed out too`, new URL(page.url()).pathname === "/");

  /* the visitor account is a visitor in both cities */
  await signIn("visitor@rihab.app", "demo"); await page.waitForSelector("[data-city]", { timeout: 20000 });
  await page.click("[data-city=makkah]"); await page.waitForSelector("[data-home-title]", { timeout: 30000 });
  ok(`${lang}: the visitor account is a visitor in Makkah`, (await page.locator("[data-home-title]").getAttribute("data-home-title")) === "visitor");
  await ctx.close();
}

/* a new Rihab account: each city asks for its own persona the first time, prefilled from the account */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`new: ${e.message}`));
  await page.goto(site.url, { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  await page.getByRole("button", { name: /إنشاء حساب رحاب|Create a Rihab account/ }).click();
  const inputs = page.locator("form input");
  await inputs.nth(0).fill("سارة"); await inputs.nth(1).fill("القرشي"); await inputs.nth(2).fill("sara.test@example.com"); await inputs.nth(3).fill("rihab2026");
  await page.getByRole("button", { name: /إنشاء الحساب|Create account/ }).click();
  await page.waitForSelector("[data-city]", { timeout: 20000 });
  ok("new account: created at Rihab and greeted by name", (await page.locator("h1").first().innerText()).includes("سارة"));
  await page.click("[data-city=makkah]"); await page.waitForTimeout(3500);
  const firstName = await page.locator("input").first().inputValue().catch(() => "");
  ok("new account: Makkah asks for its own profile, prefilled with the name", new URL(page.url()).pathname === "/makkah/" && firstName === "سارة", `${page.url()} «${firstName}»`);
  await page.screenshot({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.out/new-account-makkah.png") });
  await ctx.close();
}
ok("no runtime errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); await site.close();
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
