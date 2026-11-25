/* Regression checks for the approved audit corrections (CR-003 … CR-014, N1, N2, N4, N5).
   Both demo personas, Arabic and English, at 360 and 390 px. The clock is pinned to the
   moment the sample schedules were written around (see lib/browser.mjs), except where a
   check sets its own moment to test real dates.
   Usage: node scripts/audit-fixes-check.mjs   (LANGS=ar,en  WIDTHS=360,390) */
import { rihabLang, rihabSignIn } from "./lib/rihab-entry.mjs";
import { launchBrowser, serveBuild, REPO } from "./lib/browser.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const LANGS = (process.env.LANGS || "ar,en").split(",");
const WIDTHS = (process.env.WIDTHS || "360,390").split(",").map(Number);
const site = await serveBuild();
const browser = await launchBrowser();
let pass = 0, fail = 0;
const runtime = [];
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const W = (page, ms = 350) => page.waitForTimeout(ms);
const ARABIC = /[\u0600-\u06FF]/;

/* the photographs of the holy mosques (data URL heads) */
const SRC = readFileSync(join(REPO, "RihabMadinah-app.jsx"), "utf8");
const SACRED = ["the_prophets_mosque", "quba_mosque"]
  .map((k) => SRC.match(new RegExp(`\\n  ${k}: \\{[^\\n]*?src: "(data:image/webp;base64,.{60})`))?.[1]).filter(Boolean);
if (SACRED.length !== 2) throw new Error("holy-mosque photographs not found in the source");

async function newPage(width, lang, now) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  if (now !== undefined) await ctx.addInitScript((n) => { window.RIHAB_MADINAH_NOW = n; }, now);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => runtime.push(`${lang}@${width}: ${e.message}`));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.lang = lang; page.ctx = ctx;
  return page;
}
async function signIn(page, who) {
  await page.goto(site.url, { waitUntil: "domcontentloaded" });
    await rihabLang(page, page.lang);
    await rihabSignIn(page, `${who}@rihab.app`, "demo");
  await page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }); await W(page, 500);
  for (const b of await page.locator("[data-device-message] button[aria-label]").all()) await b.click().catch(() => {});
}
const tab = async (page, t) => {
  for (let i = 0; i < 4 && !(await page.locator(`[data-nav="${t}"]`).isVisible().catch(() => false)); i++) {
    const b = page.getByLabel(/^(رجوع|Back|إغلاق|Close)$/).first();
    if (!(await b.count())) break;
    await b.click().catch(() => {}); await W(page, 400);
  }
  await page.locator(`[data-nav="${t}"]`).click(); await W(page, 600);
};
const screenText = (page) => page.locator("[data-screen]").innerText();
const back = async (page) => { await page.getByLabel(/^(رجوع|Back)$/).first().click(); await W(page, 600); };
async function openByName(page, name, query = name, nth = null) {
  await tab(page, "home");
  await page.getByText(/ابحث عن مكان|Search for a place/).first().click(); await W(page, 300);
  await page.keyboard.type(query); await W(page, 800);
  const hit = page.getByText(name, { exact: true });
  const n = await hit.count();
  if (!n) return false;
  await (nth != null ? hit.nth(nth) : n > 1 ? hit.nth(1) : hit.first()).click(); await W(page, 800);
  return true;
}
async function ask(page, q) {
  await tab(page, "home");
  await page.locator("[data-assistant-card] button").last().click(); await W(page, 600);
  const input = page.getByLabel(/^(اسأل رحاب المدينة|Ask Rihab Madinah)$/).first();
  await input.fill(q); await input.press("Enter"); await W(page, 1000);
  const msgs = await page.locator("[data-screen]").innerText();
  await back(page);
  return msgs.slice(msgs.lastIndexOf(q) + q.length);
}

for (const width of WIDTHS) for (const lang of LANGS) {
  const en = lang === "en";
  const T = (a, e) => (en ? e : a);
  for (const who of ["resident", "visitor"]) {
    const tag = `${lang}@${width}/${who}`;
    console.log(`\n── ${tag} ──`);
    const page = await newPage(width, lang);
    await signIn(page, who);

    /* CR-011 · combinable chips, single-choice time group; CR-012 · the label */
    await tab(page, "discover");
    const chip = (label) => page.locator("[data-discover-chips] button", { hasText: new RegExp(`^${label}$`) }).first();
    ok(`${tag}: CR-012 chip reads «${T("ساعة أو أقل", "1 hour or less")}»`, await chip(T("ساعة أو أقل", "1 hour or less")).count() === 1);
    ok(`${tag}: CR-012 old «أقل من ساعة» label gone`, !/أقل من ساعة|Under an hour/.test(await screenText(page)));
    await chip(T("بدون رسوم", "No fees")).click(); await W(page);
    await chip(T("للعائلة", "For families")).click(); await W(page);
    const pressed = async (label) => (await chip(label).getAttribute("aria-pressed")) === "true";
    ok(`${tag}: CR-011 «free» and «family» combine`, await pressed(T("بدون رسوم", "No fees")) && await pressed(T("للعائلة", "For families")));
    ok(`${tag}: CR-011 selected summary shown`, await page.locator("[data-chip-summary]").count() === 1);
    const summary = await page.locator("[data-chip-summary]").innerText().catch(() => "");
    ok(`${tag}: CR-011 the summary names the chips in ${en ? "English" : "Arabic"}`, summary.includes(T("بدون رسوم", "No fees")) && summary.includes(T("للعائلة", "For families")) && (!en || !ARABIC.test(summary)), summary);
    await chip(T("اليوم", "Today")).click(); await W(page, 250);
    await chip(T("هذا الأسبوع", "This week")).click(); await W(page, 250);
    ok(`${tag}: CR-011 time chips stay single-choice`, !(await pressed(T("اليوم", "Today"))) && await pressed(T("هذا الأسبوع", "This week")) && await pressed(T("بدون رسوم", "No fees")));
    await chip(T("هذا الأسبوع", "This week")).click(); await W(page, 250);

    /* CR-003 · Back keeps filters, scroll and map mode */
    const scr = page.locator("[data-screen]");
    await scr.evaluate((el) => { el.scrollTop = Math.min(700, el.scrollHeight - el.clientHeight - 10); }); await W(page, 300);
    const before = await scr.evaluate((el) => el.scrollTop);
    const card = page.locator("[data-screen] button.lift, [data-screen] [data-row-card] button").filter({ visible: true });
    let opened = false;
    for (const c of await card.all()) {
      const box = await c.boundingBox();
      if (box && box.y > 200 && box.y + box.height < 760 && box.x >= 0 && box.x + box.width <= width) { await c.click(); await W(page, 700); opened = await page.getByLabel(/^(رجوع|Back)$/).count() > 0; break; }
    }
    if (opened) {
      await back(page);
      const after = await scr.evaluate((el) => el.scrollTop);
      ok(`${tag}: CR-003 Back keeps the chips`, await pressed(T("بدون رسوم", "No fees")) && await pressed(T("للعائلة", "For families")));
      ok(`${tag}: CR-003 Back keeps the scroll position`, Math.abs(after - before) < 60, `${before} → ${after}`);
    } else ok(`${tag}: CR-003 a result card could be opened`, false);
    await page.locator("[data-discover-map]").click(); await W(page, 500);
    ok(`${tag}: map mode opens`, await page.locator("[data-map]").count() === 1);

    /* N1 + CR-007 · same geography in both languages, spread pins, 44 px, selection, area list */
    const pins = await page.$$eval("[data-pin]", (els) => {
      const box = document.querySelector("[data-map]").getBoundingClientRect();
      return els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.pin, area: e.dataset.pinArea, x: (r.left + r.width / 2 - box.left) / box.width, y: r.top + r.height / 2, cx: r.left + r.width / 2, w: r.width, after: parseFloat(getComputedStyle(e, "::after").left) }; });
    });
    if (pins.length) {
      let minGap = 1e9;
      for (let a = 0; a < pins.length; a++) for (let b = a + 1; b < pins.length; b++) minGap = Math.min(minGap, Math.hypot(pins[a].cx - pins[b].cx, pins[a].y - pins[b].y));
      ok(`${tag}: CR-007 pins' 44 px touch areas don't overlap (closest centres ${Math.round(minGap)} px)`, minGap >= 43.5);
      /* the touch area is measured where a finger lands, not computed from CSS: 21 px out from
         the centre in each direction (a 42 px span inside the 44 px circle) must still hit the pin */
      const short = await page.$$eval("[data-pin]", (els) => els.filter((e) => {
        const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        return [[21, 0], [-21, 0], [0, 21], [0, -21]].some(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !(h === e || e.contains(h)); });
      }).map((e) => e.dataset.pin));
      ok(`${tag}: CR-007 every pin answers a tap across 44 px (${pins.length - short.length}/${pins.length})`, !short.length, short.slice(0, 4).join(", "));
      const topmost = await page.$$eval("[data-pin]", (els) => els.filter((e) => { const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return hit === e || e.contains(hit); }).length);
      ok(`${tag}: CR-007 every pin can be hit (${topmost}/${pins.length})`, topmost === pins.length);
      const awali = pins.filter((p) => p.area === "awali");
      if (awali.length) ok(`${tag}: N1 Al-Awali sits east of the Prophet's Mosque (right side) in ${lang}`, awali.every((p) => p.x > 0.5), awali.map((p) => p.x.toFixed(2)).join(","));
      const shaw = pins.filter((p) => p.area === "sultanah");
      if (shaw.length) ok(`${tag}: N1 Al-Sultanah sits west (left side) in ${lang}`, shaw.every((p) => p.x < 0.5));
      await page.locator("[data-pin]").first().click(); await W(page, 300);
      ok(`${tag}: CR-007 selected pin is marked and labelled`, await page.locator('[data-pin][data-selected="true"]').count() === 1 && await page.locator("[data-pin-label]").count() === 1);
      const openBtn = await page.locator("[data-map-open]").innerText().catch(() => "");
      ok(`${tag}: CR-007 the selection card's button reads in ${en ? "English" : "Arabic"} («${openBtn}»)`, en ? /^Open /.test(openBtn) && !ARABIC.test(openBtn) : /^افتح صفحة /.test(openBtn));
      await page.locator("[data-map-areas]").click(); await W(page, 300);
      const areaChips = page.locator("[data-map-area-list] button");
      ok(`${tag}: CR-007 area list offers every point`, await areaChips.count() === pins.length, `${await areaChips.count()} vs ${pins.length}`);
      await areaChips.last().click(); await W(page, 300);
      ok(`${tag}: CR-007 choosing from the area list selects the pin`, await page.locator('[data-pin][data-selected="true"]').count() === 1);
    } else ok(`${tag}: map shows points`, false);
    await page.locator("[data-discover-map]").click(); await W(page, 300);

    /* CR-003 · Search keeps its text on Back */
    await tab(page, "home");
    await page.getByText(/ابحث عن مكان|Search for a place/).first().click(); await W(page, 300);
    const q = T("قهوة", "coffee");
    await page.keyboard.type(q); await W(page, 900);
    await page.locator("[data-screen] button.lift").filter({ visible: true }).first().click(); await W(page, 700);
    await back(page);
    ok(`${tag}: CR-003 Search keeps «${q}» on Back`, (await page.locator("[data-screen] input").first().inputValue()) === q);
    /* … and the results come back where they were scrolled to */
    await page.locator("[data-screen] input").first().fill(T("مطعم", "restaurant")); await W(page, 900);
    await scr.evaluate((el) => { el.scrollTop = Math.min(1400, el.scrollHeight - el.clientHeight - 10); }); await W(page, 300);
    const sBefore = await scr.evaluate((el) => el.scrollTop);
    let sOpened = false;
    for (const c of await page.locator("[data-screen] button.lift").filter({ visible: true }).all()) {
      const box = await c.boundingBox();
      if (box && box.y > 120 && box.y + box.height < 760) { await c.click(); await W(page, 700); sOpened = true; break; }
    }
    if (sOpened) {
      await back(page);
      const sAfter = await scr.evaluate((el) => el.scrollTop);
      ok(`${tag}: CR-003 search results keep their scroll position on Back`, sBefore > 300 && Math.abs(sAfter - sBefore) < 60, `${sBefore} → ${sAfter}`);
    } else ok(`${tag}: CR-003 a search result could be opened`, false);

    /* CR-005 · one schedule source: the hero and the practical row agree */
    if (await openByName(page, T("ورشة خط للمبتدئين — الجمعة", "Calligraphy for beginners — Friday"))) {
      const meta = await page.locator("[data-object-meta]").innerText();
      const row = await page.locator("[data-schedule-row]").innerText().catch(() => "");
      const day = T("الجمعة", "Friday"), clock = T("٦ م", "6 PM");
      ok(`${tag}: CR-005 Friday workshop hero says ${day} ${clock}`, meta.includes(day) && meta.includes(clock), meta);
      ok(`${tag}: CR-005 practical row agrees`, row.includes(day) && row.includes(clock), row);
      /* CR-008 · joined, but days away: no «Start now» */
      const join = page.getByText(T("انضم — سأحضر", "Join — I'm going"), { exact: true });
      if (await join.count()) { await join.click(); await W(page, 500); }
      ok(`${tag}: CR-008 no «${T("ابدأ الآن", "Start now")}» for a future activity`, await page.getByText(T("ابدأ الآن", "Start now"), { exact: true }).count() === 0);
      ok(`${tag}: CR-008 says when it starts instead`, await page.locator("[data-start-hint]").count() === 1);
      await page.getByText(/^(أزل من خطتي|Remove from my plan)$/).first().click().catch(() => {});
    } else ok(`${tag}: CR-005 workshop found`, false);

    /* CR-006 · no bare service price; N5 · no holy-mosque photo on the rental */
    if (await openByName(page, T("تأجير كرسي متحرك", "Wheelchair rental"))) {
      const meta = await page.locator("[data-object-meta]").innerText();
      ok(`${tag}: CR-006 rental shows «${T("السعر لدى مقدّم الخدمة", "Price from the provider")}»`, meta.includes(T("السعر لدى مقدّم الخدمة", "Price from the provider")), meta);
      const own = (await screenText(page)).split(/\n(وبعدها؟|And after\?)\n/)[0];   // the item itself, not the "what next" rail of other items
      ok(`${tag}: CR-006 no bare amount`, !/(٨٠ ريال|SAR 80)/.test(own));
      const srcs = await page.$$eval("[data-screen] img", (els) => els.map((e) => e.getAttribute("src") || ""));
      ok(`${tag}: N5 no holy-mosque photo on a commercial listing`, !srcs.some((s) => SACRED.some((h) => s.startsWith(h))));
    } else ok(`${tag}: CR-006 rental found`, false);

    /* CR-013 · ended items keep no "now" panels */
    if (await openByName(page, T("معرض الحرف السابق", "The previous crafts exhibition"))) {
      const t = await screenText(page);
      ok(`${tag}: CR-013 ended item has no "why it suits you now"`, !/لماذا قد يناسبك الآن|Why it may suit you now/.test(t));
      ok(`${tag}: CR-013 ended item has no "first time? what to expect"`, !/أول مرة؟ هذا ما تتوقعه|First time\? Here's what to expect/.test(t));
    } else ok(`${tag}: CR-013 ended item found`, false);

    /* CR-013 · a paused or inactive group: no present-tense reasons, no Join or plan, no next date */
    for (const [nm, state] of [[T("نادي المسرح — متوقف مؤقتًا", "Theatre club — paused"), T("متوقف مؤقتًا", "Paused")], [T("نادي الدراجات — السلطانة", "Cycling club — Al-Sultanah"), T("غير نشط", "Inactive")]]) {
      if (!(await openByName(page, nm, nm, 0))) { ok(`${tag}: CR-013 «${nm}» found`, false); continue; }   // the first match is the group (the second can be its community)
      const t = await screenText(page), meta = await page.locator("[data-object-meta]").innerText();
      ok(`${tag}: CR-013 «${nm}» has no "why it suits you now" or "first time"`, !/لماذا قد يناسبك الآن|Why it may suit you now|أول مرة؟ هذا ما تتوقعه|First time\? Here's what to expect/.test(t));
      ok(`${tag}: CR-013 «${nm}» offers no Join or Add to my plan`, !/انضم — سأحضر|Join — I'm going|أضف لخطتي|Add to my plan/.test(t));
      ok(`${tag}: CR-013 «${nm}» shows no next meeting time`, !/(اليوم|غدًا|Today|Tomorrow|today|tomorrow) —|[0-9٠-٩] (ص|م|AM|PM)/.test(meta), meta);
      ok(`${tag}: CR-013 «${nm}» says it is ${state} and offers alternatives`, t.includes(`${state} — ${T("اعرض بدائل", "see alternatives")}`));
    }

    /* CR-006 · a stay offer says what its price covers */
    if (await openByName(page, T("إقامة قريبة من المسجد النبوي", "Stay near the Prophet’s Mosque"))) {
      const t = (await screenText(page)).replace(/\s+/g, " ");
      ok(`${tag}: CR-006 the stay offer price is for the whole package`, en ? /SAR 370 SAR 420 for the whole package/.test(t) : /٣٧٠ ريال ٤٢٠ ريال للباقة كاملة/.test(t), (t.match(/.{0,40}(370|٣٧٠).{0,40}/) || [""])[0]);
      ok(`${tag}: CR-006 the stay itself keeps "${T("السعر لدى مقدّم الخدمة", "Price from the provider")}"`, (await page.locator("[data-object-meta]").innerText()).includes(T("السعر لدى مقدّم الخدمة", "Price from the provider")));
    } else ok(`${tag}: CR-006 the stay near the Prophet's Mosque found`, false);

    /* CR-014 · the Urdu original is the real Urdu text, right-to-left, in either UI language;
       toasts read in the UI language */
    if (await openByName(page, T("مقهى الليل — المنطقة المركزية", "Night Café — Central Area"))) {
      const orig = page.getByText(new RegExp(`^${T("النص الأصلي", "Original text")} — ${T("اردو", "Urdu")}$`)).first();
      if (await orig.count()) {
        await orig.click(); await W(page, 300);
        const ur = page.locator('[data-screen] [lang="ur"]').first();
        const [dir, text] = [await ur.getAttribute("dir").catch(() => null), await ur.innerText().catch(() => "")];
        ok(`${tag}: CR-014 the Urdu original is shown in Urdu, right-to-left`, dir === "rtl" && /[ںہےٹ]/.test(text) && !/[a-z]{3}/i.test(text), `${dir} «${text.slice(0, 50)}»`);
      } else ok(`${tag}: CR-014 Urdu original offered`, false);
      await page.getByLabel(/^(حفظ|Save)$/).first().click(); await W(page, 250);
      const toast = await page.locator("[data-toast]").innerText().catch(() => "");
      ok(`${tag}: toast reads in ${en ? "English" : "Arabic"} («${toast}»)`, !!toast && (en ? !ARABIC.test(toast) : ARABIC.test(toast)));
      await page.getByLabel(/^(حفظ|Save)$/).first().click(); await W(page, 250);   // leave it unsaved
    } else ok(`${tag}: CR-014 Night Café found`, false);

    /* CR-010 · the community heading says only what is below it; CR-014 · original text direction */
    for (const nm of [T("ورشة السدو للمبتدئين", "Sadu weaving for beginners"), T("ساحة ألعاب الحي — الإسكان", "Neighbourhood play area — Al-Iskan"), T("سوق الحي المسائي — العوالي", "Evening district market — Al-Awali")]) {
      if (!(await openByName(page, nm))) { ok(`${tag}: CR-010 ${nm} found`, false); continue; }
      const h = page.locator("[data-community-heading]");
      const kind = await h.getAttribute("data-community-heading"), text = await h.innerText();
      ok(`${tag}: CR-010 heading matches content on «${nm}» (${kind})`, kind === "own" ? /ماذا يقول الناس|What people say/.test(text) : /من المجتمع|From the community/.test(text));
      if (nm.startsWith(T("سوق الحي", "Evening district"))) ok(`${tag}: CR-010 a lone question is not headed "${T("ماذا يقول الناس", "What people say")}"`, kind === "questions" && !/ماذا يقول الناس|What people say/.test(await screenText(page)));
      const orig = page.getByText(/(النص الأصلي|Original text) — English/).first();
      if (await orig.count()) {
        await orig.click(); await W(page, 300);
        const dir = await page.locator('[data-screen] [lang="en"]').first().getAttribute("dir").catch(() => null);
        ok(`${tag}: CR-014 English original reads left-to-right`, dir === "ltr");
      }
    }

    /* CR-009 · the visitor's trip card describes the actual plan */
    if (who === "visitor") {
      await tab(page, "home");
      const card = page.locator("[data-trip-bridge]");
      if (await card.count()) {
        const t = await card.innerText();
        ok(`${tag}: CR-009 trip card no longer claims the plan is split across the stay`, !/مقسّمة على|across \d+ days\./.test(t) || /بموعد|with a set time/.test(t), t);
        ok(`${tag}: CR-009 trip card states timed / untimed items`, /بموعد|بلا موعد|with a set time|without a set time|لا شيء في خطتك|Nothing in your plan/.test(t), t);
        const n = await card.evaluate((e) => ({ dated: +e.dataset.dated, undated: +e.dataset.undated, later: +e.dataset.later }));
        await tab(page, "plan");
        const rows = async (sel) => page.locator(`${sel} [data-plan-row]`).count();
        const plan = { dated: await rows('[data-trip-section^="day-"]'), undated: await rows('[data-trip-section="undated"]'), later: await rows('[data-trip-section="after"]') };
        ok(`${tag}: CR-009 trip card counts match My Plan`, JSON.stringify(n) === JSON.stringify(plan), `${JSON.stringify(n)} vs ${JSON.stringify(plan)}`);
      } else ok(`${tag}: CR-009 trip card present`, false);
    }

    /* N2 · Arabic number agreement on time phrases */
    if (!en) {
      await tab(page, "home"); const h = await screenText(page);
      await tab(page, "discover"); const d = await screenText(page);
      const bad = (h + "\n" + d).match(/(^|[^٠-٩])(١[١-٩]|[٢-٩][٠-٩]) (أيام|ساعات|دقائق)|(^|[^٠-٩])([٣-٩]|١٠) (يوم|ساعة|دقيقة)(?!ً)/m);
      ok(`${tag}: N2 no «٢٥ أيام»-style counts`, !bad, bad?.[0]);
    }

    /* N4 · a named place is answered as that place */
    const a = await ask(page, T("أبغى مكتبة جرير", "I want Jarir Bookstore"));
    ok(`${tag}: N4 «${T("أبغى مكتبة جرير", "I want Jarir Bookstore")}» is about Jarir, not sport`, /جرير|Jarir/.test(a) && !/للرياضة والمشي|حركة ونشاط|exercise|walking/i.test(a), a.slice(0, 160));
    await page.ctx.close();
  }

  /* CR-004 · on any date the demo offers are running (they renew on expiry), and their
     validity reads the same wherever it is shown */
  for (const when of ["2026-10-12T20:30:00+03:00", "2027-06-15T10:00:00+03:00"]) {
    const tag = `${lang}@${width}/${when.slice(0, 10)}`;
    const page = await newPage(width, lang, when);
    await signIn(page, "resident");
    if (await openByName(page, T("مطبخ مديني — العوالي", "Madani Home Kitchen — Al-Awali"))) {
      const t = await screenText(page);
      ok(`${tag}: CR-004 the restaurant's offer is running with a valid date`, /ساري لمدة|Valid \d+ more day|ينتهي (غدًا|خلال)|Ends (tomorrow|in)/.test(t) && !/انتهى العرض|Offer ended/.test(t));
    }
    await tab(page, "discover");
    const deals = page.locator("[data-discover-chips] button", { hasText: /^(عليه عرض|Has an offer)$/ }).first();
    if (await deals.count()) {
      await deals.click(); await W(page, 500);
      const t = await screenText(page);
      ok(`${tag}: CR-004 offers are listed and none is shown as ended`, (await page.locator("[data-screen] button.lift").count()) > 3 && !/انتهى العرض|Offer ended/.test(t));
    }
    await page.ctx.close();
  }

  /* CR-004 · "valid for N days" agrees with the end date at any hour: the count never
     changes within a Madinah day (it used to drop by one at noon) */
  {
    const counts = [];
    for (const hh of ["00:30", "09:00", "11:55", "12:05", "18:00", "23:30"]) {
      const page = await newPage(width, lang, `2026-10-20T${hh}:00+03:00`);
      await signIn(page, "resident");
      if (await openByName(page, T("مطبخ مديني — العوالي", "Madani Home Kitchen — Al-Awali"))) {
        const t = await screenText(page);
        counts.push(`${hh} ${(t.match(en ? /Valid (\d+) more days?/ : /ساري لمدة ([٠-٩]+|يوم واحد|يومين)/) || [])[1]}`);
      } else counts.push(`${hh} —`);
      await page.ctx.close();
    }
    const vals = new Set(counts.map((c) => c.split(" ")[1]));
    ok(`${lang}@${width}: CR-004 the day count holds all day (${counts.join(", ")})`, vals.size === 1 && !vals.has("undefined") && !vals.has("—"));
  }

  /* CR-008 · a weekly activity under way (Wednesdays 7 PM, 90 min) is "Happening now" today,
     not next week; My Plan and the item page agree on «Start now» */
  {
    const page = await newPage(width, lang, "2026-10-14T19:30:00+03:00");
    await signIn(page, "resident");
    if (await openByName(page, T("أساسيات التصوير بالجوال", "Phone photography basics"))) {
      const meta = await page.locator("[data-object-meta]").innerText(), t = await screenText(page);
      ok(`${lang}@${width}: CR-008 the meeting under way shows today's time`, meta.includes(T("اليوم", "Today")) && meta.includes(T("٧ م", "7 PM")), meta);
      ok(`${lang}@${width}: CR-008 … and "${T("جارٍ الآن", "Happening now")}"`, t.includes(T("جارٍ الآن", "Happening now")));
    } else ok(`${lang}@${width}: CR-008 photography basics found`, false);
    await page.ctx.close();
    for (const [when, due] of [["2026-10-14T19:30:00+03:00", true], ["2026-10-14T17:30:00+03:00", false]]) {
      const pg = await newPage(width, lang, when);
      await signIn(pg, "resident");
      const name = T("سوق الحي المسائي — العوالي", "Evening district market — Al-Awali");
      if (await openByName(pg, name)) {
        await pg.getByText(T("أضف لخطتي", "Add to my plan"), { exact: true }).first().click().catch(() => {}); await W(pg, 400);
        const onPage = await pg.getByText(T("ابدأ الآن", "Start now"), { exact: true }).count() > 0;
        const hint = await pg.locator("[data-start-hint]").count() > 0;
        await tab(pg, "plan");
        const row = pg.locator("[data-plan-row]").filter({ hasText: name }).first();
        const inPlan = await row.getByText(T("ابدأ الآن", "Start now"), { exact: true }).count() > 0;
        ok(`${lang}@${width}: CR-008 ${due ? "at 7:30 PM both" : "at 5:30 PM neither"} the page and My Plan offer «${T("ابدأ الآن", "Start now")}» for the planned market`, onPage === due && inPlan === due, `page ${onPage} · plan ${inPlan}`);
        if (!due) ok(`${lang}@${width}: CR-008 the page says when it starts instead`, hint);
      } else ok(`${lang}@${width}: CR-008 market found`, false);
      await pg.ctx.close();
    }
  }

  /* the real clock: the app opens and reads today's date */
  const real = await newPage(width, lang, null);
  await signIn(real, "visitor");
  ok(`${lang}@${width}/real-clock: app runs on the real clock`, (await real.evaluate(() => window.RIHAB_MADINAH_NOW)) == null && (await screenText(real)).length > 200);
  await real.ctx.close();
}

await browser.close(); site.close?.();
console.log(`\n${pass} passed · ${fail} failed · runtime errors: ${runtime.length}`);
if (runtime.length) console.log(runtime.slice(0, 5).join("\n"));
process.exit(fail || runtime.length ? 1 : 0);
