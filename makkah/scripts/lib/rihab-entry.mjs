/* Rihab: a city app has no sign-in of its own. Without a session, /<city>/ sends the
   visitor to the Rihab entry (/), where they sign in (or create a Rihab account) and
   pick the city. QA reaches the city the same way. */
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CITY = basename(resolve(dirname(fileURLToPath(import.meta.url)), "..", ".."));
/* the Rihab app as built by the repository's build (node build/build.mjs app) */
export const RIHAB_APP = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".out", "app");
/* a static file from the Rihab build; "/x/" serves /x/index.html */
export const rihabFile = (root, urlPath) => resolve(root, "." + decodeURIComponent(urlPath.split("?")[0]).replace(/\/$/, "/index.html"));

/* the Rihab sign-in, in the given language */
export async function rihabLang(page, lang) {
  await page.locator("[data-rihab-signin], [data-rihab-signup], [data-city]").first().waitFor({ timeout: 15000 });
  if (lang && (await page.evaluate(() => document.documentElement.lang)) !== lang) {
    await page.locator("[data-rihab-lang]").click(); await page.waitForTimeout(250);
  }
}
/* sign in at Rihab (unless already signed in) and open this city */
export async function rihabSignIn(page, email, password, { lang, city = CITY } = {}) {
  await rihabLang(page, lang);
  if (await page.locator("[data-rihab-signin]").count()) {
    await page.locator("[data-rihab-signin] input[type=email]").fill(email);
    await page.locator("[data-rihab-signin] input[autocomplete=current-password]").fill(password);
    await page.locator("[data-rihab-submit]").click();
  }
  await page.locator(`[data-city="${city}"]`).click({ timeout: 20000 });
}
/* create a Rihab account and open this city (which then asks for its own profile) */
export async function rihabSignUp(page, { firstName, lastName, email, password, lang, city = CITY }) {
  await rihabLang(page, lang);
  await page.locator("[data-rihab-create]").click();
  const f = page.locator("[data-rihab-signup] input");
  await f.nth(0).fill(firstName); await f.nth(1).fill(lastName); await f.nth(2).fill(email); await f.nth(3).fill(password);
  await page.locator("[data-rihab-signup] button.btn").click();
  await page.locator(`[data-city="${city}"]`).click({ timeout: 20000 });
}
