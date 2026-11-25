/* QA scripts reach the app the way a person does: the Rihab entry (sign-in and the city
   picker), then the city. The first sign-in in a browser profile creates the QA account at
   Rihab and sets up this city's profile through its real screens (resident of Al-Awali);
   later sign-ins in that profile use it. */
import { rihabLang, rihabSignIn, rihabSignUp } from "./rihab-entry.mjs";
let seq = 0;
export const QA_PROFILE = { firstName: "نورة", lastName: "الغامدي", age: "32", nationality: "SA", mode: "resident", nb: "awali", interests: ["food", "culture"] };

/* call before page.goto(): a test page starts signed out (once per tab, so moving from
   Rihab to the city keeps the session); the account itself persists in the browser profile */
export async function prepareQaAccount(page) {
  page.__qa = { email: `qa${++seq}.${Date.now()}@example.com`, password: "qa-madinah-2026", created: false };
  await page.addInitScript(() => {
    try { if (!sessionStorage.getItem("qa.started")) { sessionStorage.setItem("qa.started", "1"); localStorage.removeItem("rihab.session.v1"); } } catch { /* storage unavailable */ }
  });
  return page.__qa;
}

/* at the Rihab entry: sign in (creating the account and this city's profile the first time),
   open the city and wait for Home */
export async function signInQa(page, { lang } = {}) {
  const qa = page.__qa;
  await page.locator("[data-rihab-signin], [data-city], [data-home-greeting]").first().waitFor({ timeout: 15000 });
  if (!(await page.locator("[data-home-greeting]").count())) {
    if (!qa.created) {
      const p = QA_PROFILE;
      await rihabSignUp(page, { firstName: p.firstName, lastName: p.lastName, email: qa.email, password: qa.password, lang });
      await page.locator('[data-auth-screen="profile-setup"]').waitFor({ timeout: 15000 });
      await page.locator("#profile-firstName").fill(p.firstName);
      await page.locator("#profile-lastName").fill(p.lastName);
      await page.locator("#profile-age").fill(p.age);
      await page.locator("#profile-nationality").selectOption(p.nationality);
      await page.locator(`[data-profile-mode="${p.mode}"]`).click();
      await page.locator("#profile-nb").selectOption(p.nb);
      for (const i of p.interests) await page.locator(`[data-profile-interest="${i}"]`).click();
      await page.locator("[data-profile-submit]").click();
      qa.created = true;
    } else {
      await rihabSignIn(page, qa.email, qa.password, { lang });
    }
  }
  await page.locator("[data-home-greeting]").waitFor({ timeout: 15000 });
  /* account emails delivered to the device would sit over the top of the screen */
  for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
  await page.waitForTimeout(400);
}

export { rihabLang };
export async function closeQaServer() { /* nothing to close: accounts live on the device */ }
