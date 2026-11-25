/* Inlines i18n/en.json into the single-file app, so the artifact stays self-contained. */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
/* the repository root (or a copy of it passed as the first argument, as scripts/assistant-check.mjs does) */
const ROOT = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), ".."));
const APP = join(ROOT, "RihabMadinah-app.jsx");
const dict = JSON.parse(await readFile(join(ROOT, "i18n", "en.json"), "utf8"));
const src = await readFile(APP, "utf8");
const start = src.indexOf("const EN_TXT = {");
const end = src.indexOf("\n};", start) + 3;             // only the dictionary literal is replaced
if (start < 0 || end < 3) throw new Error("EN_TXT block not found");
const body = Object.entries(dict)
  .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  .join("\n");
const block = `const EN_TXT = {\n${body}\n};`;
await writeFile(APP, src.slice(0, start) + block + src.slice(end));
console.log(`EN_TXT: ${Object.keys(dict).length} entries inlined`);
