/* Rihab release: builds both sites and packages each as its own Vercel drag-and-drop ZIP.
     release/Rihab_App_Vercel/  and  release/Rihab_App_Vercel.zip   — the Rihab app (/, /makkah/, /madinah/)
     release/Rihab_BI_Vercel/   and  release/Rihab_BI_Vercel.zip    — Rihab Business Intelligence
   Each folder holds the site at its root, ready for vercel.com/new (Framework Preset: Other,
   empty Build Command and Output Directory), with a README and BUILD_INFO.txt.
   Usage: node scripts/package.mjs   (needs the zip command) */
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REL = join(ROOT, "release");
execFileSync(process.execPath, [join(ROOT, "build/build.mjs")], { cwd: ROOT, stdio: "inherit" });
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT }).toString().trim(); } catch { return "unknown"; } })();
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : [p]; }).sort();

const STEPS_AR = `## النشر على Vercel

١. افتح https://vercel.com/new واختر رفع مجلد (Deploy without Git).
٢. ارفع هذا المجلد كما هو (بعد فك الضغط).
٣. اختر Framework Preset: **Other**، واترك Build Command و Output Directory فارغين.
٤. اضغط Deploy.

للتحديث لاحقًا: ارفع النسخة الجديدة إلى **نفس المشروع** ليبقى الرابط نفسه. البيانات المحفوظة في المتصفح
(الحسابات والخطط) لا تُمسح.`;
const STEPS_EN = `## Deploying on Vercel

1. Open https://vercel.com/new and choose to deploy a folder (without Git).
2. Upload this folder as it is (unzipped).
3. Framework Preset: **Other**; leave Build Command and Output Directory empty.
4. Deploy.

To update later, upload the new version to the **same project** so the address stays the same.
Data saved in the browser (accounts, plans) is kept.`;

const PACKS = [
  { name: "Rihab_App_Vercel", from: ".out/app", extra: (out) => {
      cpSync(join(ROOT, "makkah/PHOTO_SOURCES.md"), join(out, "makkah/PHOTO_SOURCES.md"));
      cpSync(join(ROOT, "madinah/PHOTO_SOURCES.md"), join(out, "madinah/PHOTO_SOURCES.md"));
    },
    readme: `# رحاب — Rihab

منصة واحدة لمكة المكرمة والمدينة المنورة: تسجيل دخول واحد في رحاب، ثم اختيار المدينة، ثم تطبيقها بهويته.
One platform for Makkah and Madinah: one Rihab sign-in, a city picker, then each city's app in its own identity.

| المسار · Path | |
|---|---|
| \`/\` | مدخل رحاب: تسجيل الدخول وإنشاء الحساب واختيار المدينة · The Rihab entry: sign-in, a new account, the city picker |
| \`/makkah/\` | رحاب مكة · Rihab Makkah |
| \`/madinah/\` | رحاب المدينة · Rihab Madinah |

حسابا العرض: resident@rihab.app (ساكن) و visitor@rihab.app (زائر)، بكلمة مرور العرض المرفقة مع التسليم.
Demo accounts: resident@rihab.app (resident) and visitor@rihab.app (visitor), with the demo password given with the delivery.

${STEPS_AR}

${STEPS_EN}
` },
  { name: "Rihab_BI_Vercel", from: ".out/bi",
    readme: `# رحاب — ذكاء الأعمال · Rihab Business Intelligence

لوحات تنفيذية لرحاب مكة ورحاب المدينة. تسجيل دخول رحاب لذكاء الأعمال، ثم اختيار المدينة، ثم لوحاتها بهويتها.
الأرقام محاكاة للعرض.
Executive dashboards for Rihab Makkah and Rihab Madinah. The Rihab BI sign-in, a city picker, then that city's
dashboards in its own identity. All figures are simulated.

| المسار · Path | |
|---|---|
| \`/\` | تسجيل الدخول واختيار المدينة · Sign-in and the city picker |
| \`/makkah/\` | لوحات رحاب مكة · Rihab Makkah dashboards |
| \`/madinah/\` | لوحات رحاب المدينة · Rihab Madinah dashboards |

حساب العرض: bi@rihab.app، بكلمة مرور العرض المرفقة مع التسليم. حسابات التطبيق لا تدخل هنا.
Demo account: bi@rihab.app, with the demo password given with the delivery. App accounts do not sign in here.

${STEPS_AR}

${STEPS_EN}
` },
];

rmSync(REL, { recursive: true, force: true });
mkdirSync(REL, { recursive: true });
for (const p of PACKS) {
  const out = join(REL, p.name);
  cpSync(join(ROOT, p.from), out, { recursive: true });
  if (p.extra) p.extra(out);
  writeFileSync(join(out, "README.md"), p.readme);
  const list = files(out).map((f) => relative(out, f));
  writeFileSync(join(out, "BUILD_INFO.txt"), `${p.name}\nbuilt: ${new Date().toISOString()}\ncommit: ${commit}\nfiles: ${list.length + 1}\n\n${list.concat("BUILD_INFO.txt").sort().join("\n")}\n`);
  const zip = join(REL, `${p.name}.zip`);
  if (existsSync(zip)) rmSync(zip);
  execFileSync("zip", ["-q", "-X", "-r", zip, "."], { cwd: out });
  console.log(`package: release/${p.name}.zip — ${(statSync(zip).size / 1048576).toFixed(1)} MB, ${list.length + 1} files`);
}
