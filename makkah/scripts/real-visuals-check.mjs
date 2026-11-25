/* Real-place visuals: which tier every real place takes, and proof that no mapping is
   misleading. Bundles the app source, then checks each of the real places:
     exact    own photograph of the place itself (`pt`, not `ptc`)
     context  a photograph of the complex/district its own record says it is in (`pt` + `ptc`)
     logo     a brand mark, only for a branch whose name carries that brand
     category a drawn tile for the kind of place
   Photo gate: <Photo> shows a real place only its own `pt` (see ownPhoto); the `photo` data field is not rendered for them.
   Also fails if a real place shows a generic or wrong kind (a café as «مطعم»), or its tile
   icon changes with the language.
   Fails if a logo whose brand is not in the
   place's name, or a context photograph its record does not support. */
import { build } from "esbuild";
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REPO } from "./lib/browser.mjs";

const tmp = mkdtempSync(join(tmpdir(), "rv-"));
const entry = join(REPO, ".rv-app.jsx");
writeFileSync(entry, readFileSync(join(REPO, "RihabMakkah-app.jsx"), "utf8") + "\nexport { INVENTORY, setLang, PHOTO_DATA, ownPhoto, brandMarkOf, BRAND_OF, BRAND_MARKS, CONTEXT_OF, venueKind, CAT, PLACE_ASSETS, PLACE_ASSET_BY_ID, placeLogoOf };\n");
try {
  await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: join(tmp, "app.mjs"), logLevel: "error", define: { "process.env.NODE_ENV": '"production"' } });
} finally { unlinkSync(entry); }
const M = await import(join(tmp, "app.mjs"));
M.setLang("ar");

const real = M.INVENTORY.filter((o) => o.real);
const tiers = { exact: [], context: [], logo: [], category: [] };
const problems = [];
const CONTEXT_PROOF = {   // what the record itself must say for the context photo to be honest
  makkah_clocktower_day: (o) => /أبراج البيت|برج الساعة|أبراج الساعة/.test(`${o.name} ${o.about}`),
  makkah_jabal_nour: (o) => /حراء|جبل النور/.test(`${o.name} ${o.about} ${o.tagline}`) || o.neighborhood === "nur",
};
for (const o of real) {
  const own = M.ownPhoto(o.id, o.photo);
  const mark = M.placeLogoOf(o.id) || M.brandMarkOf(o.id);
  if (own && !o.ptc) tiers.exact.push(o);
  else if (mark) tiers.logo.push(o);
  else if (own && o.ptc) tiers.context.push(o);
  else tiers.category.push(o);
  if (mark && mark.d && !String(o.name).includes(mark.ar)) problems.push(`${o.id}: logo ${mark.en} but the name does not carry the brand`);
  if (mark && own) problems.push(`${o.id}: has both a photo and a logo`);
  if (own && o.ptc) {
    const proof = CONTEXT_PROOF[o.pt];
    const ctx = M.CONTEXT_OF[o.id];
    if (!proof || !proof(o)) problems.push(`${o.id}: context photo ${o.pt} not supported by the record`);
    if (o.venue && !ctx) problems.push(`${o.id}: venue context photo without a CONTEXT_OF note`);
  }
}
/* the visible kind: specific for every real place, consistent with its category, and the
   category tile's icon the same in both languages */
const EXPECT = { cafe: /^(مقهى)$/, food: /^(مطعم|حلويات|مخبز|مقهى)$/ };
for (const o of real) {
  M.setLang("ar"); const kAr = o.typeLabel, iconAr = M.venueKind(o).Icon;
  M.setLang("en"); const kEn = o.typeLabel, iconEn = M.venueKind(o).Icon;
  M.setLang("ar");
  if (!kAr || /^(مكان|Place)$/.test(kAr) || /^Place$/.test(kEn)) problems.push(`${o.id}: generic kind label (${kAr} / ${kEn})`);
  if (EXPECT[o.category] && !EXPECT[o.category].test(kAr)) problems.push(`${o.id}: kind «${kAr}» does not fit category ${o.category}`);
  if (/مكتبة لبيع الكتب/.test(o.t || "") && kEn !== "Bookstore") problems.push(`${o.id}: bookstore labelled ${kEn}`);
  if (/مركز تسوق/.test(o.t || "") && kEn !== "Mall") problems.push(`${o.id}: mall labelled ${kEn}`);
  if (iconAr !== iconEn) problems.push(`${o.id}: category tile icon differs between Arabic and English`);
}
/* supplied assets: every record named in the manifest renders its asset */
let supplied = 0;
for (const [stem, a] of Object.entries(M.PLACE_ASSETS)) {
  for (const id of a.ids) {
    const o = real.find((x) => x.id === id);
    if (!o) { problems.push(`asset ${stem} names unknown place ${id}`); continue; }
    if (a.kind === "photo" && !(o.pt === "pa_" + stem && M.ownPhoto(o.id, o.photo))) problems.push(`${id}: supplied photo ${stem} not rendered`);
    if (a.kind === "logo" && (M.ownPhoto(o.id, o.photo) || M.placeLogoOf(id)?.stem !== stem)) problems.push(`${id}: supplied logo ${stem} not rendered`);
    supplied++;
  }
}
console.log(`  supplied assets: ${Object.keys(M.PLACE_ASSETS).length} (${Object.values(M.PLACE_ASSETS).filter((a) => a.kind === "logo").length} logos), shown by ${supplied} places`);
for (const id of Object.keys(M.CONTEXT_OF)) if (!real.find((o) => o.id === id)) problems.push(`CONTEXT_OF names unknown place ${id}`);
for (const id of Object.keys(M.BRAND_OF)) if (!real.find((o) => o.id === id)) problems.push(`BRAND_OF names unknown place ${id}`);

console.log(`real places: ${real.length}`);
for (const [k, v] of Object.entries(tiers)) console.log(`  ${k.padEnd(9)} ${v.length}`);
const own174 = real.length - tiers.exact.length - tiers.context.filter((o) => !M.CONTEXT_OF[o.id]).length;
if (process.env.JSON) writeFileSync(process.env.JSON, JSON.stringify(Object.entries(tiers).flatMap(([tier, v]) => v.map((o) => ({ id: o.id, name: o.name, tier, brand: M.brandMarkOf(o.id)?.en || null, pt: o.pt || null }))), null, 1));
if (process.env.LIST) {
  for (const o of tiers.category) console.log("  cat ", o.id.padEnd(46), M.venueKind(o).Icon.displayName || "", "|", o.tagline, "|", o.name);
  for (const o of [...tiers.logo, ...tiers.context]) console.log("  tier", o.id.padEnd(46), M.brandMarkOf(o.id) ? "logo " + M.brandMarkOf(o.id).en : "context " + o.pt);
}
if (problems.length) { console.log("PROBLEMS:\n" + problems.map((p) => "  - " + p).join("\n")); process.exit(1); }
console.log("no misleading mappings: every logo matches its branch's brand, every context photo is supported by the record, real places render only their own photograph, a logo or a drawn category tile");
