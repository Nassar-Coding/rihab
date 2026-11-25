/* Inlines assets/place-data.js into RihabMakkah-app.jsx as the PLACE_ASSETS block (the
   supplied place photos and brand logos), so the single-file JSX artifact and the
   zero-build bundle carry them with no image host — the same way photo-sync.mjs
   inlines PHOTO_DATA. */
import { readFile, writeFile } from "node:fs/promises";
const jsxPath = "RihabMakkah-app.jsx";
const src = await readFile(jsxPath, "utf8");
const data = (await readFile("assets/place-data.js", "utf8")).trim();
const start = src.indexOf("const PLACE_ASSETS = {");
if (start < 0) throw new Error("PLACE_ASSETS block not found");
const close = src.indexOf("\n};", start);
if (close < 0) throw new Error("PLACE_ASSETS end not found");
await writeFile(jsxPath, src.slice(0, start) + data + src.slice(close + 3));
console.log("PLACE_ASSETS:", (data.match(/data:image\/webp/g) || []).length, "assets inlined");
