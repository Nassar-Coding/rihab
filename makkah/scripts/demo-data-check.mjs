/* Demo-data checks run against the app's own code (bundled for Node, no browser):
   · offers: every offer ends between 1 Nov 2026 and 30 Apr 2027 (the first on 1 Nov),
     and on any later date they have renewed, so the demo always has offers running
   · schedules: no fictional activity starts at an unrealistic hour, and every dated
     session's length is the length shown on every screen
   · search: every place's full name, in Arabic and in English, ranks that place first;
     a chain's name lists its branches first
   · Assistant: a named place is answered with that place's own information; a request for
     somewhere to stay finds the stays in Arabic and English
   · validity: "valid for N days" equals the calendar days to the end date at every hour
   · weekly meetings: one under way is "live" today; paused or inactive groups have no next
     meeting, no "why now" and no start
   · filtered lists: ranking with spill keeps every match
   Usage: node scripts/demo-data-check.mjs */
import { build } from "esbuild";
import { readFileSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { REPO } from "./lib/browser.mjs";

const dir = mkdtempSync(join(tmpdir(), "eyemakkah-data-"));
const entry = join(dir, "app.jsx"), out = join(dir, "app.mjs");
writeFileSync(entry, readFileSync(join(REPO, "RihabMakkah-app.jsx"), "utf8") +
  "\nexport { INVENTORY, DEALS, OFFER_SLOTS, liveOffers, lifecycleOf, nextOccurrence, setLang, searchAll, initialState, deriveContext, agentTurn, AGENT_SESSION, offerExpiry, canStartNow, scoreObject, rank, isPromotable, getObj };\n");
await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: out, logLevel: "error",
  define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(REPO, "node_modules")] });

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const load = async (now) => { globalThis.window = { EYEMAKKAH_NOW: now }; return import(pathToFileURL(out).href + "?" + encodeURIComponent(now)); };
const mkDate = (d) => new Date(+d + 3 * 3600000).toISOString().slice(0, 10);

/* offers */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const ends = Object.values(m.OFFER_SLOTS).map((w) => +w.to).sort((a, b) => a - b);
  ok(`offers: ${ends.length} offers on the calendar, every offer included`, ends.length === m.DEALS.filter((d) => !d.offerObj).length + m.INVENTORY.filter((o) => o.type === "offer").length);
  ok("offers: the first ends on 1 Nov 2026", mkDate(ends[0]) === "2026-11-01", mkDate(ends[0]));
  ok("offers: the last ends on 30 Apr 2027", mkDate(ends.at(-1)) === "2027-04-30", mkDate(ends.at(-1)));
  ok("offers: end dates are spread, not bunched", new Set(ends.map(mkDate)).size >= ends.length * 0.9);
}
for (const now of ["2026-10-12T21:00:00+03:00", "2026-11-02T10:00:00+03:00", "2027-02-14T10:00:00+03:00", "2027-06-15T10:00:00+03:00", "2028-03-01T10:00:00+03:00"]) {
  const m = await load(now);
  const offerPages = m.INVENTORY.filter((o) => o.type === "offer");
  ok(`offers on ${now.slice(0, 10)}: all ${m.DEALS.length} running (renewed as needed)`, m.liveOffers().length === m.DEALS.length, `${m.liveOffers().length}`);
  ok(`offer pages on ${now.slice(0, 10)}: none expired`, offerPages.every((o) => ["active", "ending"].includes(m.lifecycleOf(o))));
}

/* schedules */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const hour = (d) => new Date(+d + 3 * 3600000).getUTCHours();
  const EARLY_BY_DESIGN = new Set(["x-hike-sunrise"]);          // a sunrise hike starts before sunrise
  const odd = [];
  for (const o of m.INVENTORY) {
    const tm = o.timing; if (!tm || o.real || EARLY_BY_DESIGN.has(o.id)) continue;
    const h = tm.kind === "session" ? hour(tm.start) : tm.kind === "recurring" ? tm.hour : null;
    if (h != null && (h < 6 || h >= 23)) odd.push(`${o.id} ${h}:00`);
  }
  ok("schedules: no fictional activity starts between 11 PM and 6 AM", !odd.length, odd.join(", "));
  const mismatch = m.INVENTORY.filter((o) => o.timing?.kind === "session" && o.duration !== Math.round((new Date(o.timing.end) - new Date(o.timing.start)) / 60000)).map((o) => o.id);
  ok("schedules: every session's shown length equals its schedule", !mismatch.length, mismatch.join(", "));
}

/* search */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const st = m.initialState(); st.profile.nb = "awali";
  const ctx = m.deriveContext(st);
  const norm = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  for (const lang of ["ar", "en"]) {
    const misses = [];
    let n = 0;
    for (const o of m.INVENTORY) {
      if (o.generated) continue;
      m.setLang(lang);
      const q = o.name;
      if (lang === "en" && /[؀-ۿ]/.test(q)) continue;
      n++;
      const top = m.searchAll(q, ctx).objects[0]?.o;
      if (!top || (top.id !== o.id && norm(top.name) !== norm(q))) misses.push(`"${q}" → ${top?.id}`);
    }
    ok(`search ${lang}: ${n - misses.length}/${n} full names rank their place first`, !misses.length, misses.slice(0, 5).join("; "));
  }
  /* topic searches still find plenty (name ranking must not cost recall) */
  for (const [lang, q] of [["ar", "أكل مكي"], ["ar", "قهوة هادئة"], ["ar", "للعائلة"], ["en", "quiet coffee"], ["en", "family"]]) {
    m.setLang(lang);
    const n = m.searchAll(q, ctx).objects.length;
    ok(`search ${lang}: «${q}» finds a full list (${n})`, n >= 5);
  }
  m.setLang("ar");
  const brands = [...new Set(m.INVENTORY.filter((o) => o.brand).map((o) => o.brand))];
  const short = brands.filter((b) => {
    const n = m.INVENTORY.filter((o) => o.brand === b).length;
    return m.searchAll(b, ctx).objects.slice(0, n).filter((x) => x.o.brand === b).length < Math.min(n, 3);
  });
  ok(`search: ${brands.length - short.length}/${brands.length} chain names list their branches first`, short.length <= 2, short.join(", "));
}

/* Assistant: a named place is answered with that place */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const st = m.initialState(); st.profile.nb = "awali";
  const ctx = m.deriveContext(st);
  const ask = (q, lang) => {
    Object.assign(m.AGENT_SESSION.mem, { turn: 0, lastIntent: null, lastQuery: null, ranked: [], shown: [], offset: 0, lastObject: null, lastOffer: null, lastOuting: null, lastAction: null, lastEntities: null, lastShape: null, recentSugg: [] });
    m.setLang(lang);
    return m.agentTurn(q, { state: st, ctx, dispatch: () => {} });
  };
  const CASES = [
    ["ar", "أبغى مكتبة جرير", /جرير/, "v-jarir-bookstore-al-awali"],
    ["en", "I want Jarir Bookstore", /Jarir/, "v-jarir-bookstore-al-awali"],
    ["ar", "ستاربكس مكة مول", /مكة مول/, "v-starbucks-makkah-mall"],
    ["en", "Starbucks Makkah Mall", /Makkah Mall/, "v-starbucks-makkah-mall"],
    ["ar", "سفرة العوالي", /سفرة العوالي: مطعم.*ريال.*عرض/, "r-sufrah"],
    ["en", "tell me about the Makkah Run", /Makkah Run.*(Event|next)/, "e-sport-run"],
    ["ar", "معلومات عن ورشة السدو للمبتدئين", /السدو.*(تجربة|الموعد)/, "x-sadu"],
    ["ar", "كم سعر تأجير كرسي متحرك؟", /مقدّم الخدمة/, "s-wheelchair"],
    ["ar", "متى تفتح سفرة العوالي؟", /يفتح من/, "r-sufrah"],
  ];
  for (const [lang, q, rx, id] of CASES) {
    const r = ask(q, lang);
    ok(`assistant ${lang}: «${q}» answers about the place`, rx.test(r.text) && r.cards?.[0]?.id === id, `${r.text?.slice(0, 120)} [${r.cards?.map((c) => c.id)}]`);
  }
  const chain = ask("البيك", "ar");
  ok("assistant: a chain's name lists its branches", (chain.cards || []).length >= 2 && /فروع/.test(chain.text), chain.text?.slice(0, 120));
}

/* Assistant: somewhere to stay, in either language */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const st = m.initialState(); st.profile.nb = "awali";
  const ctx = m.deriveContext(st);
  const stays = (q, lang) => {
    Object.assign(m.AGENT_SESSION.mem, { turn: 0, lastIntent: null, lastQuery: null, ranked: [], shown: [], offset: 0, lastObject: null, lastOffer: null, lastOuting: null, lastAction: null, lastEntities: null, lastShape: null, recentSugg: [] });
    m.setLang(lang); st.profile.lang = lang;
    const r = m.agentTurn(q, { state: st, ctx, dispatch: () => {} });
    return (r.cards || []).map((c) => m.getObj(c.id)?.category);
  };
  for (const [lang, q] of [["en", "Where can I stay near the Haram?"], ["ar", "أبغى سكن قريب من الحرم"], ["en", "I need a place to stay"], ["ar", "فنادق قريبة"]]) {
    const cats = stays(q, lang);
    ok(`assistant ${lang}: «${q}» lists stays`, cats.length >= 2 && cats.every((c) => c === "stay"), cats.join(","));
  }
}

/* Assistant: full names with their branch or area; nothing to join or plan on a paused group */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const st = m.initialState(); st.profile.nb = "awali";
  const ctx = m.deriveContext(st);
  const turn = (q, lang, keep) => {
    if (!keep) Object.assign(m.AGENT_SESSION.mem, { turn: 0, lastIntent: null, lastQuery: null, ranked: [], shown: [], offset: 0, lastObject: null, lastOffer: null, lastOuting: null, lastAction: null, lastEntities: null, lastShape: null, recentSugg: [] });
    m.setLang(lang); st.profile.lang = lang;
    const acts = [];
    const r = m.agentTurn(q, { state: st, ctx, dispatch: (a) => acts.push(a.type) });
    return { r, acts };
  };
  for (const [lang, q, id] of [["en", "Tell me about Night Café — Ajyad", "c-night"], ["en", "Tell me about Swimming class — women", "a-swim-women"], ["ar", "معلومات عن مقهى الليل — أجياد", "c-night"]]) {
    const { r } = turn(q, lang);
    ok(`assistant ${lang}: «${q}» answers about that place`, r.cards?.[0]?.id === id, `${r.text?.slice(0, 80)} [${r.cards?.map((c) => c.id)}]`);
  }
  for (const [lang, q, follow] of [["en", "I want Theatre club", "Join it"], ["ar", "أبغى نادي المسرح", "انضم له"], ["en", "I want Cycling club", "Add it to my plan"]]) {
    const first = turn(q, lang);
    const { r, acts } = turn(follow, lang, true);
    ok(`assistant ${lang}: «${q}» → «${follow}» adds nothing for a paused or inactive group`, first.r.cards?.length === 1 && !acts.some((a) => ["join", "plan"].includes(a)) && /paused|ended|متوقف|انتهى/.test(r.text), `${r.text?.slice(0, 90)} · ${acts}`);
  }
}

/* validity: the day count is the calendar days to the end date, at any hour */
{
  const bad = [];
  for (const day of ["2026-10-20", "2026-12-31", "2027-03-01"]) for (const hh of ["00:05", "09:00", "11:59", "12:01", "18:00", "23:58"]) {
    const now = `${day}T${hh}:00+03:00`;
    const m = await load(now);
    m.setLang("en");
    const today = Date.parse(`${day}T00:00:00+03:00`);
    for (const of of m.liveOffers()) {
      const end = of.end.getTime();
      const days = Math.round((Date.parse(mkDate(end) + "T00:00:00+03:00") - today) / 86400000);
      const txt = m.offerExpiry(of);
      const shown = +(txt.match(/Valid (\d+) more day/) || [])[1];
      const ok1 = days >= 2 ? shown === days : days === 1 ? /Ends tomorrow|Ends in/.test(txt) : /Ends in/.test(txt);
      if (!ok1) bad.push(`${now} ${of.id}: ${txt} (end ${mkDate(end)}, ${days} d)`);
    }
  }
  ok(`validity: "valid for N days" equals the days to the end date at every hour`, !bad.length, bad.slice(0, 3).join(" | "));
}

/* weekly meetings: under way, paused, inactive */
{
  let m = await load("2026-10-14T19:30:00+03:00");             // Wednesday; the photography basics meet 7–8:30 PM
  const photo = m.getObj("a-beginner-photo");
  ok("weekly: a meeting under way is live", m.lifecycleOf(photo) === "live");
  ok("weekly: … its time is today's, not next week's", mkDate(m.nextOccurrence(photo)) === "2026-10-14", String(m.nextOccurrence(photo)));
  ok("weekly: … and it can be started", m.canStartNow(photo));
  m = await load("2026-10-14T20:31:00+03:00");
  ok("weekly: after it ends the next meeting is next week", mkDate(m.nextOccurrence(m.getObj("a-beginner-photo"))) === "2026-10-21" && m.lifecycleOf(m.getObj("a-beginner-photo")) === "active");
  const st = m.initialState(); const ctx = m.deriveContext(st);
  for (const id of ["g-paused-club", "g-dormant-club"]) {
    const o = m.getObj(id);
    ok(`weekly: ${id} (${m.lifecycleOf(o)}) has no next meeting, no start and no "why now"`, !m.nextOccurrence(o) && !m.canStartNow(o) && !m.scoreObject(o, ctx).why.length);
  }
  /* a filtered list keeps every match: variety orders it, nothing is dropped */
  const list = m.INVENTORY.filter((o) => o.duration != null && o.duration <= 60 && o.type !== "offer");
  const kept = m.rank(list, ctx, { limit: Infinity, spill: true, maxPerCategory: 4, maxPerNeighborhood: 5 }).length;
  const promotable = list.filter((o) => m.isPromotable(o)).length;
  ok(`filtered lists: every match is listed (${kept}/${promotable} of "1 hour or less")`, kept === promotable);
}

rmSync(dir, { recursive: true, force: true });
console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
