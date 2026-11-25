/* Refreshes release/Rihab_Vercel_DragDrop from dist/ and zips it with a top-level
   folder. Run after `npm run build`. Requires the `zip` command. */
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { REPO } from "./lib/browser.mjs";
import { fingerprint } from "../build/fingerprint.mjs";

const dist = join(REPO, "dist"), rel = join(REPO, "release"), dir = join(rel, "Rihab_Vercel_DragDrop"), zip = join(rel, "Rihab_Vercel_DragDrop.zip");
cpSync(join(REPO, "PHOTO_SOURCES.md"), join(dist, "PHOTO_SOURCES.md"));
/* the bundle ships under its content-hash name, with index.html pointing at it */
const { app } = fingerprint(dist);
const FILES = ["index.html", app, "config.js", "vercel.json", "robots.txt", "README.md", "PHOTO_SOURCES.md", "manifest.json", "BUILD_INFO.txt"];
const missing = FILES.filter((f) => !existsSync(join(dist, f)));
if (missing.length) throw new Error(`dist is missing: ${missing.join(", ")}`);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
for (const f of FILES) cpSync(join(dist, f), join(dir, f));
rmSync(zip, { force: true });
execFileSync("zip", ["-X", "-r", "-q", "Rihab_Vercel_DragDrop.zip", "Rihab_Vercel_DragDrop"], { cwd: rel });
console.log(execFileSync("unzip", ["-l", zip]).toString());
