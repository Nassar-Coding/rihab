/* Inlines assets/place-data.js into RihabMadinah-app.jsx as the PLACE_ASSETS block (the
   supplied place photos and brand logos), so the single-file JSX artifact and the
   zero-build bundle carry them with no image host — the same way photo-sync.mjs
   inlines PHOTO_DATA. */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
/* the repository root (or a copy of it passed as the first argument, as scripts/assistant-check.mjs does) */
const ROOT = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), ".."));
const jsxPath = join(ROOT, "RihabMadinah-app.jsx");
const src = await readFile(jsxPath, "utf8");
const data = (await readFile(join(ROOT, "assets", "place-data.js"), "utf8")).trim();
const start = src.indexOf("const PLACE_ASSETS = {");
if (start < 0) throw new Error("PLACE_ASSETS block not found");
const close = src.indexOf("\n};", start);
if (close < 0) throw new Error("PLACE_ASSETS end not found");
await writeFile(jsxPath, src.slice(0, start) + data + src.slice(close + 3));
console.log("PLACE_ASSETS:", (data.match(/data:image\/webp/g) || []).length, "assets inlined");
