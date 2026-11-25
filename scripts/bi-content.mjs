/* Exports the app's own content into the BI platform's content snapshot (bi/data/content.js).
   The BI reads the real districts, categories, places, activities, offers, communities, Market
   products, homes and business opportunities from this file, in Arabic and English, so its
   names, counts and map positions always match the app. Nothing here is invented: every record
   comes from the city's app (makkah/RihabMakkah-app.jsx or madinah/RihabMadinah-app.jsx), read
   through the app's own language layer.
   Usage: node scripts/bi-content.mjs makkah|madinah          writes bi/<city>/data/content.js
          node scripts/bi-content.mjs makkah|madinah --check  fails if the snapshot is out of date */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const CITY = process.argv[2];
if (!["makkah", "madinah"].includes(CITY)) { console.error("usage: node scripts/bi-content.mjs makkah|madinah [--check]"); process.exit(2); }
const APP_FILE = CITY === "makkah" ? "makkah/RihabMakkah-app.jsx" : "madinah/RihabMadinah-app.jsx";

const CHECK = process.argv.includes("--check");
const OUT = join(REPO, "bi", CITY, "data", "content.js");
const NOW = "2026-10-27T12:00:00+03:00";

const dir = mkdtempSync(join(tmpdir(), `rihab-bi-content-${CITY}-`));
writeFileSync(join(dir, "app.jsx"), readFileSync(join(REPO, APP_FILE), "utf8") +
  "\nexport { setLang, NEIGHBORHOODS, DISTRICTS, CATEGORIES, INVENTORY, PROVIDERS, DEALS, FAMILIES, COMMUNITIES, CLUBS, CONTRIBUTIONS, " +
  "PRODUCTS, PRODUCT_CATS, HOMES, HOME_DEALS, OPPORTUNITIES, OPP_CATS, MUST_DO, INTERESTS, STAY_OPTS, PARTY_OPTS, PLAN_STATE, AGENT_BANK, TYPE_LABEL, D };\n");
await build({ entryPoints: [join(dir, "app.jsx")], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: join(dir, "app.mjs"), logLevel: "error",
  define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(REPO, "node_modules")] });
globalThis.window = { RIHAB_MAKKAH_NOW: NOW, RIHAB_MADINAH_NOW: NOW };
const m = await import(pathToFileURL(join(dir, "app.mjs")).href);

/* read a getter-translated field in both languages */
const both = (get) => { m.setLang("ar"); const ar = get(); m.setLang("en"); const en = get(); m.setLang("ar"); return { ar, en }; };
const pair = (p) => (Array.isArray(p) ? { ar: p[0], en: p[1] } : { ar: p, en: p });
const ksaDate = (d) => new Date(d.getTime() + 3 * 3600e3).toISOString().slice(0, 10);   /* calendar date in Saudi Arabia (UTC+3) */
const r3 = (v) => (v == null ? null : Math.round(v * 1000) / 1000);

const homeIds = new Set(m.NEIGHBORHOODS.map((n) => n.id));
const districts = [...m.NEIGHBORHOODS, ...m.DISTRICTS].map((n) => ({
  id: n.id, geo: n.geo || null, home: homeIds.has(n.id), x: n.x, y: n.y, name: both(() => n.name),
  ...(homeIds.has(n.id) ? { blurb: both(() => n.blurb) } : {}),
}));

const categories = m.CATEGORIES.map((c) => ({ id: c.id, tone: c.tone, name: both(() => c.name) }));

const mustDo = new Set(m.MUST_DO);
const objects = m.INVENTORY.map((o) => ({
  id: o.id, type: o.type, cat: o.category, nb: o.neighborhood || null, real: !!o.real, provider: o.provider || null,
  action: o.action, price: o.price ?? null, pop: r3(o.popularity), nov: r3(o.novelty), cap: o.capacity ?? null,
  joined: o.joinedCount ?? null, suit: o.suit || [], timing: o.timing?.kind || null, mustDo: mustDo.has(o.id),
  geo: o.geo ? { x: r3(o.geo.x), y: r3(o.geo.y) } : null, name: both(() => o.name),
}));

const providers = m.PROVIDERS.map((p) => ({ id: p.id, ref: p.ref, real: !!p.real, name: both(() => p.name), kind: both(() => p.kind) }));

const offers = m.DEALS.map((d) => ({
  id: d.id, obj: d.obj, kind: d.kind, pct: d.pct, exclusive: d.exclusive, who: d.who, when: d.when, redeem: d.redeem,
  title: pair(d.title), start: ksaDate(d.start), end: ksaDate(d.end),
}));

/* language communities are named in their own language in the app; the dashboards name them in the reader's */
const COMMUNITY_AR = { "visitors-en": "الزوار — بالإنجليزية", "visitors-id": "الزوار — بالإندونيسية", "visitors-ur": "الزوار — بالأردية" };
const COMMUNITY_EN = { "visitors-en": "Visitors — English", "visitors-id": "Visitors — Indonesian", "visitors-ur": "Visitors — Urdu" };
const communities = m.COMMUNITIES.map((c) => {
  const name = both(() => c.name);
  return { id: c.id, family: c.family, kind: c.kind, nb: c.nb, members: c.members,
    name: COMMUNITY_AR[c.id] ? { ar: COMMUNITY_AR[c.id], en: COMMUNITY_EN[c.id] } : name };
});
const families = m.FAMILIES.map((f) => ({ id: f.id, name: both(() => f.name) }));
const clubs = m.CLUBS.map((c) => ({ id: c.id, community: c.community, members: c.members, activity: c.activity, name: both(() => c.name) }));
const contributionTypes = {};
m.CONTRIBUTIONS.forEach((k) => { contributionTypes[k.type] = (contributionTypes[k.type] || 0) + 1; });

const products = m.PRODUCTS.map((p) => ({ id: p.id, cat: p.cat, price: p.price, name: pair(p.n) }));
const productCats = m.PRODUCT_CATS.map((c) => ({ id: c.id, name: pair(c.name) }));
const homes = m.HOMES.map((h) => ({ id: h.id, deal: h.deal, nb: h.nb, rooms: h.rooms, size: h.size, furnished: h.furnished, kind: pair(h.kind), name: pair(h.n) }));
const homeDeals = m.HOME_DEALS.map((d) => ({ id: d.id, name: pair(d.name) }));
const opportunities = m.OPPORTUNITIES.map((o) => ({ id: o.id, cat: o.cat, nb: o.nb, name: pair(o.n) }));
const oppCats = m.OPP_CATS.map((c) => ({ id: c.id, name: pair(c.name) }));

const interests = Object.fromEntries(Object.entries(m.INTERESTS).map(([k, list]) => [k, list.map((i) => ({ id: i.id, cats: i.cats, name: { ar: i.ar, en: i.en } }))]));
const stay = m.STAY_OPTS.map((s) => ({ id: s.id, days: s.days, name: { ar: s.ar, en: s.en } }));
const party = m.PARTY_OPTS.map((s) => ({ id: s.id, name: { ar: s.ar, en: s.en } }));
const planStates = Object.fromEntries(Object.entries(m.PLAN_STATE).map(([k, v]) => [k, both(() => m.D(v.label))]));
const typeLabels = Object.fromEntries(["place", "restaurant", "experience", "event", "activity", "recurring", "offer", "service"].map((t) => [t, both(() => m.TYPE_LABEL[t])]));

const intents = m.AGENT_BANK.intents || [];
const intentCats = {};
let examples = 0;
intents.forEach((i) => { const c = i.c || i.category; intentCats[c] = (intentCats[c] || 0) + 1; examples += (i.ex?.ar?.length || 0) + (i.ex?.en?.length || 0); });

const content = {
  source: APP_FILE, city: CITY,
  districts, categories, objects, providers, offers, families, communities, clubs, contributionTypes,
  products, productCats, homes, homeDeals, opportunities, oppCats, interests, stay, party, planStates, typeLabels,
  assistant: { intents: intents.length, examples, categories: intentCats },
};

const text = `/* Generated by scripts/bi-content.mjs from ${APP_FILE}. Do not edit by hand. */\n` +
  "window.RUH_CONTENT = " + JSON.stringify(content) + ";\n";

const counts = `${districts.length} districts (${homeIds.size} home areas), ${categories.length} categories, ${objects.length} inventory objects ` +
  `(${objects.filter((o) => o.real).length} real), ${offers.length} offers, ${communities.length} communities, ${clubs.length} clubs, ` +
  `${products.length} products, ${homes.length} homes, ${opportunities.length} opportunities, ${providers.length} providers, ${intents.length} assistant intents`;

if (CHECK) {
  const cur = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (cur !== text) { console.error(`bi/${CITY}/data/content.js is out of date: run node scripts/bi-content.mjs ${CITY}`); process.exit(1); }
  console.log(`bi-content (${CITY}): snapshot is current — ` + counts);
} else {
  writeFileSync(OUT, text);
  console.log(`bi-content: wrote bi/${CITY}/data/content.js — ` + counts);
}
