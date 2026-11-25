/* Rihab build. Two sites, each its own Vercel package:

   .out/app — the Rihab app
     /           the Rihab entry (shell/): sign-in and the city picker
     /makkah/    Rihab Makkah  (makkah/, built by makkah/build/build.mjs)
     /madinah/   Rihab Madinah (madinah/, built by madinah/build/build.mjs)

   .out/bi — Rihab Business Intelligence
     /           the Rihab BI sign-in and city picker (the same shell, in business mode)
     /makkah/    the Makkah dashboards, in Rihab Makkah's identity
     /madinah/   the Madinah dashboards, in Rihab Madinah's identity
     /shared/    the dashboards' code, styles and "Ask the data" (bi/shared/)

   Usage: node build/build.mjs [app|bi]   (both when no argument is given) */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const which = process.argv[2] || "all";
const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 10);

/* the shell bundle (shared by both sites), with its two photographs inside it */
async function shellInto(OUT, { mode, title, description }) {
  const r = await build({ entryPoints: [join(ROOT, "shell/src/Shell.jsx")], bundle: true, minify: true, write: false, format: "iife",
    jsx: "automatic", target: ["es2020"], define: { "process.env.NODE_ENV": '"production"' }, legalComments: "none",
    loader: { ".webp": "dataurl" } });
  const js = r.outputFiles[0].contents, v = hash(js);
  await writeFile(join(OUT, `shell.${v}.js`), js);
  let html = (await readFile(join(ROOT, "shell/index.html"), "utf8")).replace("__SHELL__", `./shell.${v}.js`);
  if (mode === "bi") {
    html = html.replace("<title>رحاب</title>", `<title>${title}</title>`)
      .replace(/<meta name="description" content="[^"]*"\/>/, `<meta name="description" content="${description}"/>`)
      .replace('<div id="root"></div>', '<div id="root"></div>\n<script>window.RIHAB_MODE = "bi";</script>');
  }
  await writeFile(join(OUT, "index.html"), html);
  await cp(join(ROOT, "shell/vercel.json"), join(OUT, "vercel.json"));
  await cp(join(ROOT, "shell/robots.txt"), join(OUT, "robots.txt"));
  return `shell.${v}.js — ${(js.length / 1024).toFixed(1)} KB`;
}

async function buildApp() {
  const OUT = join(ROOT, ".out", "app");
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  console.log("app: " + await shellInto(OUT, { mode: "app" }));
  /* the two city apps, each from its own build, published under its own path */
  for (const city of ["makkah", "madinah"]) {
    execFileSync(process.execPath, [join(ROOT, city, "build/build.mjs")], { cwd: join(ROOT, city), stdio: ["ignore", "ignore", "inherit"] });
    const dist = join(ROOT, city, "dist");
    await mkdir(join(OUT, city), { recursive: true });
    for (const f of readdirSync(dist)) if (/^(index\.html|config\.js|manifest\.json|app\.[0-9a-f]{10}\.js)$/.test(f)) await cp(join(dist, f), join(OUT, city, f));
    console.log(`app: ${city}/ — ${readdirSync(join(OUT, city)).join(", ")}`);
  }
}

const CITY_PAGE = {
  makkah: { title: "رحاب مكة — ذكاء الأعمال · Rihab Makkah Business Intelligence", brand: "#17463A", accent: "#D8BE86",
    fonts: "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Inter:wght@400;500;600;700&display=swap",
    desc: "Rihab Makkah Business Intelligence — executive dashboards on residents and visitors, engagement, the Market, Makkah Opportunities, community, Visitor Centers, partners, commercial performance and districts. Simulated figures.",
    noscript: "تحتاج منصة رحاب مكة لذكاء الأعمال إلى تفعيل JavaScript. · Rihab Makkah Business Intelligence needs JavaScript." },
  madinah: { title: "رحاب المدينة — ذكاء الأعمال · Rihab Madinah Business Intelligence", brand: "#172A46", accent: "#F3D79E",
    fonts: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@600;700&display=swap",
    desc: "Rihab Madinah Business Intelligence — executive dashboards on residents and visitors, engagement, the Market, City Opportunities, community, Visitor Centers, partners, commercial performance and districts. Simulated figures.",
    noscript: "تحتاج منصة رحاب المدينة لذكاء الأعمال إلى تفعيل JavaScript. · Rihab Madinah Business Intelligence needs JavaScript." },
};
function filesUnder(dir) {
  return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? filesUnder(p) : [p]; }).sort();
}

async function buildBi() {
  const OUT = join(ROOT, ".out", "bi"), BI = join(ROOT, "bi");
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  console.log("bi: " + await shellInto(OUT, { mode: "bi", title: "رحاب — ذكاء الأعمال · Rihab Business Intelligence",
    description: "رحاب — منصة ذكاء الأعمال لرحاب مكة ورحاب المدينة." }));
  await cp(join(BI, "shared"), join(OUT, "shared"), { recursive: true });
  /* one version for every BI file, so a new deployment never mixes cached files */
  const v = hash(Buffer.concat([join(BI, "shared"), join(BI, "makkah"), join(BI, "madinah"), join(BI, "page.html")]
    .flatMap((p) => (statSync(p).isDirectory() ? filesUnder(p) : [p])).map((p) => readFileSync(p))));
  const page = await readFile(join(BI, "page.html"), "utf8");
  for (const city of ["makkah", "madinah"]) {
    const c = CITY_PAGE[city];
    await cp(join(BI, city), join(OUT, city), { recursive: true });
    const html = page.replace("__TITLE__", c.title).replace("__DESC__", c.desc).replace("__BRAND__", c.brand)
      .replace("__BRAND_ESC__", encodeURIComponent(c.brand)).replace("__ACCENT_ESC__", encodeURIComponent(c.accent))
      .replace("__FONTS__", c.fonts).replace("__NOSCRIPT__", c.noscript).replaceAll("__V__", v);
    await writeFile(join(OUT, city, "index.html"), html);
    console.log(`bi: ${city}/ — ${filesUnder(join(OUT, city)).length} files`);
  }
}

if (which === "all" || which === "app") await buildApp();
if (which === "all" || which === "bi") await buildBi();
