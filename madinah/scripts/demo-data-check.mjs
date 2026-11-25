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

const dir = mkdtempSync(join(tmpdir(), "rihab-data-"));
const entry = join(dir, "app.jsx"), out = join(dir, "app.mjs");
writeFileSync(entry, readFileSync(join(REPO, "RihabMadinah-app.jsx"), "utf8") +
  "\nexport { INVENTORY, DEALS, OFFER_SLOTS, liveOffers, lifecycleOf, nextOccurrence, setLang, searchAll, initialState, deriveContext, agentTurn, AGENT_SESSION, offerExpiry, canStartNow, scoreObject, rank, isPromotable, getObj };\n");
await build({ entryPoints: [entry], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: out, logLevel: "error",
  define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(REPO, "node_modules"), join(REPO, "..", "node_modules")] });

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const load = async (now) => { globalThis.window = { RIHAB_MADINAH_NOW: now }; return import(pathToFileURL(out).href + "?" + encodeURIComponent(now)); };
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
  const EARLY_BY_DESIGN = new Set(["ACT-008", "ACT-072", "ACT-083"]);   // a sunrise hike and two after-Fajr meet-ups start before 6
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
  for (const [lang, q] of [["ar", "أكل مديني"], ["ar", "قهوة هادئة"], ["ar", "للعائلة"], ["en", "quiet coffee"], ["en", "family"]]) {
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
    ["ar", "أبغى مكتبة جرير", /جرير/, "PLC-017"],
    ["en", "I want Jarir Bookstore", /Jarir/, "PLC-017"],
    ["ar", "ستاربكس الدخيل مول", /الدخيل مول/, "PLC-023"],
    ["en", "Starbucks Al Dakhail Mall", /Dakhail Mall/, "PLC-023"],
    ["ar", "مطبخ مديني العوالي", /مطبخ مديني — العوالي: مطعم.*ريال.*عرض/, "PLC-211"],
    ["en", "tell me about the Madinah Run", /Madinah Run.*(Event|next)/, "ACT-019"],
    ["ar", "معلومات عن ورشة السدو للمبتدئين", /السدو.*(تجربة|الموعد)/, "ACT-004"],
    ["ar", "كم سعر تأجير كرسي متحرك؟", /مقدّم الخدمة/, "PLC-254"],
    ["ar", "متى يفتح مطبخ مديني العوالي؟", /يفتح من/, "PLC-211"],
    ["ar", "كلمني عن المسجد النبوي", /^المسجد النبوي[:،]/, "PLC-040"],
    ["en", "tell me about the Prophet's Mosque", /^The Prophet's Mosque[:,]/, "PLC-040"],
    ["ar", "كلمني عن مسجد قباء", /^مسجد قباء[.:،]/, "PLC-060"],
  ];
  for (const [lang, q, rx, id] of CASES) {
    const r = ask(q, lang);
    ok(`assistant ${lang}: «${q}» answers about the place`, rx.test(r.text) && r.cards?.[0]?.id === id, `${r.text?.slice(0, 120)} [${r.cards?.map((c) => c.id)}]`);
  }
  const chain = ask("ستاربكس", "ar");
  ok("assistant: a chain's name lists its branches", (chain.cards || []).length >= 2 && /فرعان|فروع/.test(chain.text), chain.text?.slice(0, 120));
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
  for (const [lang, q] of [["en", "Where can I stay near the Prophet's Mosque?"], ["ar", "أبغى سكن قريب من المسجد النبوي"], ["en", "I need a place to stay"], ["ar", "فنادق قريبة"],
    ["ar", "وين أبات قريب من المسجد النبوي"], ["ar", "فندق قريب من الحرم"]]) {
    const cats = stays(q, lang);
    ok(`assistant ${lang}: «${q}» lists stays`, cats.length >= 2 && cats.every((c) => c === "stay"), cats.join(","));
  }
}

/* Assistant: "things to do in <area>" lists that area, for every Madinah home area */
{
  const m = await load("2026-10-12T21:00:00+03:00");
  const st = m.initialState(); st.profile.nb = "awali";
  const ctx = m.deriveContext(st);
  const area = (q, lang) => {
    Object.assign(m.AGENT_SESSION.mem, { turn: 0, lastIntent: null, lastQuery: null, ranked: [], shown: [], offset: 0, lastObject: null, lastOffer: null, lastOuting: null, lastAction: null, lastEntities: null, lastShape: null, recentSugg: [] });
    m.setLang(lang); st.profile.lang = lang;
    return m.agentTurn(q, { state: st, ctx, dispatch: () => {} });
  };
  const bad = [];
  for (const [nb, ar, en] of [["quba", "قباء", "Quba"], ["khalidiyah", "الخالدية", "Al-Khalidiyah"], ["awali", "العوالي", "Al-Awali"], ["uhud", "أحد", "Uhud"], ["aziziyah", "العزيزية", "Al-Aziziyah"], ["sultanah", "السلطانة", "Sultanah"]])
    for (const [lang, q] of [["en", `things to do in ${en}`], ["ar", `وش أسوي اليوم في ${ar}`]]) {
      const r = area(q, lang);
      const inArea = (r.cards || []).filter((c) => m.getObj(c.id)?.neighborhood === nb).length;
      if (r.intent !== "area_specific_discovery" || inArea < 2) bad.push(`${q} → ${r.intent} (${inArea} in area)`);
    }
  ok("assistant: «things to do in <area>» lists that area (AR + EN)", !bad.length, bad.join(" · "));
  const city = ["what to do in Madinah", "things to do in Madinah", "places to visit in Madinah"].map((q) => [q, area(q, "en")]).filter(([, r]) => r.intent !== "discover_what_to_do_now" || !(r.cards || []).length);
  ok("assistant: «what to do in Madinah» suggests things to do across the city", !city.length, city.map(([q, r]) => `${q} → ${r.intent}`).join(" · "));
  const sw = ["switch to Quba", "change my area to Quba"].map((q) => [q, area(q, "en")]).filter(([, r]) => r.intent !== "context_change_neighborhood" || !/Quba/.test(r.text));
  ok("assistant: «switch to Quba» changes the area", !sw.length, sw.map(([q, r]) => `${q} → ${r.intent}`).join(" · "));
  const anyone = area("هل فيه أحد يعرف مطعم زين", "ar");
  ok("assistant: «أحد» as \"anyone\" is not read as the Uhud district", /^food_/.test(anyone.intent) && !/أحد/.test(anyone.text) && (anyone.cards || []).length > 0, `${anyone.intent} ${anyone.text?.slice(0, 80)}`);
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
  for (const [lang, q, id] of [["en", "Tell me about Night Café — Central Area", "PLC-230"], ["en", "Tell me about Swimming class — women", "ACT-058"], ["ar", "معلومات عن مقهى الليل — المنطقة المركزية", "PLC-230"]]) {
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
  const photo = m.getObj("ACT-029");
  ok("weekly: a meeting under way is live", m.lifecycleOf(photo) === "live");
  ok("weekly: … its time is today's, not next week's", mkDate(m.nextOccurrence(photo)) === "2026-10-14", String(m.nextOccurrence(photo)));
  ok("weekly: … and it can be started", m.canStartNow(photo));
  m = await load("2026-10-14T20:31:00+03:00");
  ok("weekly: after it ends the next meeting is next week", mkDate(m.nextOccurrence(m.getObj("ACT-029"))) === "2026-10-21" && m.lifecycleOf(m.getObj("ACT-029")) === "active");
  const st = m.initialState(); const ctx = m.deriveContext(st);
  for (const id of ["ACT-064", "ACT-036"]) {
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
