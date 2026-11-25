/* Rihab app build → .out/app, the site in the Vercel package:
     /           the Rihab entry (shell/): sign-in and the city picker
     /makkah/    Rihab Makkah  (makkah/, built by makkah/build/build.mjs)
     /madinah/   Rihab Madinah (madinah/, built by madinah/build/build.mjs) */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".out", "app");

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const r = await build({ entryPoints: [join(ROOT, "shell/src/Shell.jsx")], bundle: true, minify: true, write: false, format: "iife",
  jsx: "automatic", target: ["es2020"], define: { "process.env.NODE_ENV": '"production"' }, legalComments: "none" });
const js = r.outputFiles[0].contents;
const hash = createHash("sha256").update(js).digest("hex").slice(0, 10);
await writeFile(join(OUT, `shell.${hash}.js`), js);
await cp(join(ROOT, "shell/media"), join(OUT, "media"), { recursive: true });
const html = (await readFile(join(ROOT, "shell/index.html"), "utf8")).replace("__SHELL__", `./shell.${hash}.js`);
await writeFile(join(OUT, "index.html"), html);
console.log(`shell.${hash}.js — ${(js.length / 1024).toFixed(1)} KB`);

/* the two city apps, each from its own build, published under its own path */
for (const city of ["makkah", "madinah"]) {
  execFileSync(process.execPath, [join(ROOT, city, "build/build.mjs")], { cwd: join(ROOT, city), stdio: ["ignore", "ignore", "inherit"] });
  const dist = join(ROOT, city, "dist");
  await mkdir(join(OUT, city), { recursive: true });
  for (const f of readdirSync(dist)) if (/^(index\.html|config\.js|manifest\.json|app\.[0-9a-f]{10}\.js)$/.test(f)) await cp(join(dist, f), join(OUT, city, f));
  console.log(`${city}/ — ${readdirSync(join(OUT, city)).join(", ")}`);
}
await cp(join(ROOT, "shell/vercel.json"), join(OUT, "vercel.json"));
await cp(join(ROOT, "shell/robots.txt"), join(OUT, "robots.txt"));
