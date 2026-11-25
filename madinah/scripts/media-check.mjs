/* Media-accuracy check: walks the built app in Chromium at 390×844, screenshots the
   main surfaces and several decision pages, records which kind of visual each page
   shows (photo, logo, category tile) and that no page explains it, and reports broken
   images, drawn (non-photographic) media and runtime errors — all must be zero. */
import { launchBrowser, outDir } from "./lib/browser.mjs";
import { prepareQaAccount, signInQa, closeQaServer } from "./lib/qa-session.mjs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
const root = process.env.ROOT || resolve("dist");
const out = process.env.OUT || "/tmp/audit/shots";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json" };
const server = createServer(async (req, res) => {
  const f = resolve(root, req.url === "/" ? "index.html" : "." + req.url.split("?")[0]);
  try { const b = await readFile(f); res.writeHead(200, { "Content-Type": MIME[extname(f)] || "text/plain" }); res.end(b); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(4620, r));
const errs = [];
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g|ERR_|net::|Failed to load resource/.test(m.text())) errs.push("console: " + m.text()); });
const imgs = () => page.evaluate(() => { const a = [...document.querySelectorAll(".app img")]; return { n: a.length, broken: a.filter((i) => i.complete && i.naturalWidth === 0).length, drawn: document.querySelectorAll('.app [data-media="drawn"]').length }; });
let drawnTotal = 0, brokenTotal = 0;
const report = [];
const shot = async (name) => { await page.waitForTimeout(350); const r = await imgs(); drawnTotal += r.drawn; brokenTotal += r.broken; report.push(`${name}: imgs=${r.n} broken=${r.broken} drawn=${r.drawn}`); await page.screenshot({ path: `${out}/${name}.png` }); };
const tab = async (id) => {
  for (let i = 0; i < 8; i++) {
    const nav = page.locator(`[data-nav="${id}"]`);
    if (await nav.count() && await nav.first().isVisible().catch(() => false)) { await nav.first().click(); await page.waitForTimeout(500); return; }
    for (const l of ["إغلاق", "رجوع"]) { const b = page.getByLabel(l); if (await b.count() && await b.first().isVisible().catch(() => false)) { await b.first().click(); await page.waitForTimeout(250); break; } }
  }
};
const open = async (name, label) => {
  await tab("home");
  await page.getByText("ابحث عن مكان أو تجربة أو مجتمع").click(); await page.waitForTimeout(300);
  await page.keyboard.type(name); await page.waitForTimeout(800);
  // open the object itself: its result row carries the exact title, threads only mention it
  const exact = page.getByText(name, { exact: true });
  await (await exact.count() > 1 ? exact.nth(1) : exact.first()).click();
  await page.waitForTimeout(800);
  const cap = await page.evaluate(() => {
    const m = document.querySelector("[data-media]");   // the page's hero visual
    const t = document.querySelector(".app")?.innerText || "";
    const leak = /(من أين جاءت|المصدر والسياق|لا نعرض صورة|صورة سياقية|صورة عامة للتوضيح|الصورة:)/.exec(t);
    return `${m ? m.dataset.media : "(no visual)"}${leak ? " · INTERNAL TEXT: " + leak[0] : ""}`;
  });
  report.push(`  ${name} → ${cap}`);
  await shot(label);
};
if (!page.__qa) await prepareQaAccount(page);
await page.goto("http://127.0.0.1:4620/", { waitUntil: "networkidle" }); await page.waitForTimeout(900);
await shot("01-landing");
await page.getByText(/^(ابدأ|Enter Ruh Al Madinah)$/).first().click(); await page.waitForTimeout(700);
await shot("02-language");
await page.locator('[data-lang="ar"]').click(); await page.waitForTimeout(1100);
await signInQa(page);
await shot("03-home");
await page.mouse.move(195, 500); await page.mouse.wheel(0, 1500); await shot("04-home-scrolled");
await page.mouse.wheel(0, 1600); await shot("05-home-scrolled-2");
await tab("discover"); await shot("06-discover");
await page.mouse.move(195, 500); await page.mouse.wheel(0, 1400); await shot("07-discover-scrolled");
for (const [n, l] of [["المسجد النبوي", "10-prophets-mosque"], ["متحف دار المدينة", "11-dar-al-madinah"], ["جبل أحد", "12-uhud"], ["مسجد قباء", "13-quba"],
  ["مجمع الملك فهد لطباعة المصحف الشريف", "14-quran-complex"], ["صاغة الحي — العوالي", "15-gold-souq"], ["مطبخ مديني — العوالي", "16-restaurant"], ["قهوة الحارة — العنبرية", "17-cafe"],
  ["ورشة فخار — أول قطعة", "18-workshop"], ["حملة تبرع بالدم", "19-event"], ["حافلة معالم المدينة", "20-bus"], ["إقامة قريبة من المسجد النبوي", "21-stay"],
  ["سوق التمور المركزي", "22-dates-market"], ["جبل الرماة", "23-archers-hill"], ["قصر عروة بن الزبير", "24-urwa"], ["البيك — العزيزية", "26-venue-albaik"], ["مكتبة جرير — طريق الملك عبدالله", "27-venue-jarir"], ["حديقة الملك فهد المركزية", "28-park"]]) {
  try { await open(n, l); } catch (e) { report.push(`  ${n} → FAILED ${e.message.split("\n")[0]}`); }
}
await tab("community"); await shot("30-community");
await page.mouse.move(195, 500); await page.mouse.wheel(0, 1500); await shot("31-community-scrolled");
await page.mouse.wheel(0, 1600); await shot("32-community-scrolled-2");
await tab("plan"); await shot("40-plan");
await tab("home"); await page.getByLabel("حسابي").click(); await page.waitForTimeout(600);
await page.mouse.move(195, 500); await page.mouse.wheel(0, 1600); await page.waitForTimeout(300);
await page.getByText("أدوات مقدّم التجربة", { exact: true }).first().click().catch(() => {}); await page.waitForTimeout(700); await shot("50-provider");
console.log(report.join("\n"));
console.log("drawn media:", drawnTotal, "· broken images:", brokenTotal, "· internal-text pages:", report.filter((l) => l.includes("INTERNAL TEXT")).length);
console.log("runtime errors:", errs.length, errs.slice(0, 3));
await browser.close(); server.close(); await closeQaServer();
