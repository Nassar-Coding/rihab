/* Assistant regression checks, run against the app's own agentTurn / agentDirect / agentSuggestions
   (bundled for Node, no browser). Every conversation runs as a Resident or a Visitor, in Arabic or
   English, and every dispatched action goes through the app's own reducer.
   Each turn is checked for what it promises (the task picked, the places shown, the state it may or
   may not change) and for what every answer must avoid: crashes, unfilled template slots, Arabic in
   an English answer, internal labels, Makkah references nobody asked for. Every suggestion chip under
   an answer is tapped in a copy of the conversation and must lead somewhere useful.
   The Assistant's knowledge is also regenerated twice from assets/agent/*.json and must equal the
   bank inlined in the app.
   Usage: node scripts/assistant-check.mjs [--src app.jsx] [--verbose] */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { REPO } from "./lib/browser.mjs";

const args = process.argv.slice(2);
const SRC = args.includes("--src") ? args[args.indexOf("--src") + 1] : join(REPO, "RihabMadinah-app.jsx");
const VERBOSE = args.includes("--verbose");
const NOW = "2026-10-22T17:30:00+03:00";   // a Thursday, late afternoon

const dir = mkdtempSync(join(tmpdir(), "ruhalmadinah-assistant-"));
writeFileSync(join(dir, "app.jsx"), readFileSync(SRC, "utf8") +
  "\nexport { initialState, reducer, deriveContext, agentTurn, agentDirect, agentSuggestions, AGENT_SESSION, setLang, getObj, offerFor, distanceKm, MUST_DO_SET, NOT_RUNNING, lifecycleOf };\n");
await build({ entryPoints: [join(dir, "app.jsx")], bundle: true, platform: "node", format: "esm", jsx: "automatic", outfile: join(dir, "app.mjs"), logLevel: "error",
  define: { "process.env.NODE_ENV": '"production"' }, nodePaths: [join(REPO, "node_modules")] });
globalThis.window = { RUHALMADINAH_NOW: NOW };
const m = await import(pathToFileURL(join(dir, "app.mjs")).href);

const PROFILES = {
  resident: { mode: "resident", firstName: "نورة", nb: "awali", party: "solo", interests: ["food", "culture"] },
  visitor: { mode: "visitor", firstName: "Omar", nb: null, party: "family", stay: "short", interests: ["culture", "heritage", "food"] },
};
const FRESH = () => ({ turn: 0, lastIntent: null, lastQuery: null, ranked: [], shown: [], offset: 0, lastObject: null, lastOffer: null, lastOuting: null, lastAction: null, lastEntities: null, lastShape: null, recentSugg: [] });
const o = (id) => m.getObj(id);
const isFood = (id) => ["food", "cafe"].includes(o(id)?.category);
const cat = (...cs) => (id) => cs.includes(o(id)?.category);
const nameHas = (rx) => (id) => rx.test(`${o(id)?.n} ${o(id)?.t || ""}`);
const within = (anchor, km) => (id) => m.distanceKm(o(id), o(anchor).geo) <= km;
const inNb = (nb) => (id) => o(id)?.neighborhood === nb;
const must = (id) => m.MUST_DO_SET.has(id);

/* ── conversations: [persona, lang, name, turns]; a turn is [text, expectations] or [{direct|tap}, expectations] ──
   expectations: intent / notIntent (regex), text / notText (regex), cards (n | "none"), all / first / some (id → bool),
   ids (ids that must be among the cards), acts (regex over dispatched actions) / noActs (regex that must not match),
   outing (ids → bool), plan (ids → bool), contribs / communities / navigate / compose / clarify (truthy),
   market ({ kind, ids } → bool), link (regex over the screens the answer links to, as "screen:tab") */
const C = [];
const conv = (persona, lang, name, turns, profile, seed) => C.push({ persona, lang, name, turns, profile, seed });

/* courtesy: greetings answered in kind, thanks as thanks, goodbye as goodbye */
conv("resident", "ar", "greeting «هلا»", [["هلا", { intent: /^greeting_general$/, notText: /وعليكم السلام/ }]]);
conv("resident", "ar", "salaam is returned", [["السلام عليكم", { intent: /^greeting_general$/, text: /وعليكم السلام/ }]]);
conv("resident", "en", "greeting «hi»", [["hi", { intent: /^greeting_general$/, notText: /peace be upon you/i }]]);
conv("visitor", "en", "salam in English", [["assalamu alaikum", { intent: /^greeting_general$/, text: /peace be upon you/i }]]);
conv("visitor", "ar", "«أهلا وسهلا»", [["اهلا وسهلا", { intent: /^greeting_general$/ }]]);
conv("visitor", "ar", "«حياك الله»", [["حياك الله", { intent: /^greeting_general$/ }]]);
conv("resident", "ar", "«جزاك الله خير»", [["جزاك الله خير", { intent: /^thanks$/ }]]);
conv("resident", "ar", "«شكرا»", [["شكرا", { intent: /^thanks$/ }]]);
conv("resident", "ar", "«باي»", [["باي", { intent: /^goodbye$/ }]]);
conv("visitor", "en", "thanks a lot", [["thanks a lot", { intent: /^thanks$/ }]]);
conv("visitor", "ar", "«أنا مع عائلتي» is not a farewell", [["انا مع عائلتي", { notIntent: /^(goodbye|thanks|greeting_general|fallback_)/ }]]);

/* visitor day plans start from Madinah's landmarks, and the plan can be added, swapped and rebuilt */
const landmarkDay = (ids) => ids.filter(must).length >= 2 && must(ids[0]) && ids.every((id) => o(id)?.geo);
conv("visitor", "ar", "one day → add all → My Plan", [
  ["عندي يوم واحد في المدينة، وش أسوي؟", { outing: landmarkDay }],
  ["ضفها لخطتي", { acts: /plan:PLC-[\s\S]*plan:/, intent: /^plan_add_item$/ }],
  ["وش في خطتي؟", { intent: /^plan_summary$/, plan: (ids) => ids.length >= 2 }],
]);
conv("visitor", "en", "one day (chip) → swap a step (chip) → add (chip)", [
  ["I have one day in Madinah — what should I do?", { outing: landmarkDay }],
  [{ tap: /swap|change/i }, { intent: /^followup_different_option$/, outing: (ids) => ids.length >= 2 }],
  [{ tap: /add/i }, { acts: /plan:/ }],
]);
conv("visitor", "en", "plan my day", [["plan my day", { outing: (ids) => ids.length >= 2 && ids.some(must) }]]);
conv("visitor", "ar", "«رتب لي يومي»", [["رتب لي يومي", { outing: (ids) => ids.length >= 2 }]]);
conv("resident", "en", "plan my evening", [["plan my evening", { outing: (ids) => ids.length >= 2 }]]);
conv("visitor", "en", "a full day", [["a full day in Madinah", { outing: landmarkDay }]]);
conv("visitor", "ar", "day plan rebuilt for children", [
  ["عندي يوم واحد في المدينة", { outing: landmarkDay }],
  ["خلها تناسب الأطفال", { intent: /^discover_build_outing$/, outing: (ids) => ids.length >= 2 }],
]);
conv("visitor", "en", "first time: what should I see", [["it's my first time in Madinah, what should I see?", { some: must, all: (id) => must(id) || cat("culture", "heritage")(id) }]]);
conv("visitor", "ar", "«وش أهم المعالم؟»", [["وش أهم المعالم في المدينة؟", { some: must }]]);

/* the persona's own starter chips work */
conv("visitor", "en", "kids chip", [["We're with children — what suits us?", { intent: /^family_kids$/, all: (id) => (o(id).suit || []).includes("kids") || o(id).category === "family" }]]);
conv("visitor", "ar", "kids chip (ar)", [["أنا مع أطفال، وش يناسبنا؟", { intent: /^family_kids$/ }]]);
conv("resident", "en", "my area chip", [["What's in my area?", { all: inNb("awali"), notIntent: /^context_/ }]]);
conv("resident", "ar", "my area chip (ar)", [["وش فيه في حيّي؟", { all: inNb("awali") }]]);
conv("resident", "en", "weekend chip", [["What's on this weekend?", { cards: 1 }]]);
conv("resident", "ar", "what's new chip", [["وش الجديد حولي؟", { cards: 1 }]]);
conv("visitor", "ar", "culture then restaurant chip", [["أبغى تجربة ثقافية وبعدها مطعم", { outing: (ids) => ids.length === 2 && isFood(ids[1]) }]]);
conv("visitor", "en", "two hours chip", [["I only have two hours", { notIntent: /^fallback_/, notText: /120 min/ }]]);

/* near a place: distances from that place */
conv("visitor", "en", "restaurants near the Prophet's Mosque", [["restaurants near the Prophet's Mosque", { all: (id) => isFood(id) && within("PLC-040", 3)(id) }]]);
conv("visitor", "ar", "«مطاعم قريبة من الحرم»", [["مطاعم قريبة من الحرم", { all: (id) => isFood(id) && within("PLC-040", 3)(id) }]]);
conv("visitor", "ar", "around Quba Mosque", [["وش فيه قريب من مسجد قباء", { all: (id) => id !== "PLC-060" && within("PLC-060", 3)(id) }]]);
conv("resident", "ar", "a place, then food near it", [
  ["كلمني عن جبل أحد", { first: (id) => id === "PLC-076" }],
  ["فيه مطعم قريب منه؟", { all: (id) => isFood(id) && within("PLC-076", 5)(id) }],
]);

/* the person's area: said once, used after */
conv("resident", "ar", "«أنا ساكن في قباء» sets the area, never the account", [["انا ساكن في قباء", { acts: /profile:\{"nb":"quba"\}/, noActs: /mode/ }]]);
conv("visitor", "en", "staying in Al-Aziziyah", [["I'm staying in Al-Aziziyah", { acts: /profile:\{"nb":"aziziyah"\}/ }]]);
conv("visitor", "en", "near me → area → answered", [
  ["restaurants near me", { clarify: true }],
  ["Al-Aziziyah", { all: (id) => isFood(id) && within("PLC-004", 4)(id) }],
]);
conv("visitor", "ar", "«مقهى قريب مني» → area → answered", [
  ["أبغى مقهى قريب مني", { clarify: true }],
  ["العزيزية", { all: (id) => o(id).category === "cafe" }],
]);
conv("resident", "ar", "a plain request prefers the resident's area", [["أبغى مطعم", { all: isFood, first: within("PLC-211", 3) }]]);

/* time words */
conv("resident", "ar", "«وش أسوي الليلة؟»", [["وش أسوي الليلة؟", { cards: 1, notText: /٢٤٠|240/ }]]);
conv("resident", "en", "tonight", [["what can I do tonight", { cards: 1, notText: /240/ }]]);
conv("visitor", "en", "three hours", [["I have 3 hours", { notIntent: /^fallback_/, notText: /180 min/ }]]);
conv("resident", "ar", "tomorrow", [["وش فيه بكرة؟", { cards: 1 }]]);

/* follow-ups on the place on the table */
conv("visitor", "en", "Quba Mosque: kids, free, hours, getting there", [
  ["tell me about Quba Mosque", { first: (id) => id === "PLC-060" }],
  ["is it good for kids?", { ids: ["PLC-060"], text: /Quba Mosque/ }],
  ["is it free?", { ids: ["PLC-060"], text: /free|fee/i }],
  ["when does it open?", { ids: ["PLC-060"], text: /Quba Mosque/ }],
  ["how do I get there?", { navigate: true, acts: /directions:PLC-060/ }],
]);
conv("visitor", "ar", "Dar Al Madinah: kids, price, directions", [
  ["كلمني عن متحف دار المدينة", { first: (id) => id === "PLC-033" }],
  ["يناسب الأطفال؟", { ids: ["PLC-033"], text: /دار المدينة/ }],
  ["كم سعره؟", { ids: ["PLC-033"] }],
  ["كيف أروح له؟", { navigate: true, acts: /directions:PLC-033/ }],
]);
conv("resident", "en", "a list, then the second, then its hours", [
  ["cafes in Al-Aziziyah", { all: (id) => o(id).category === "cafe" }],
  ["the second one", { intent: /^followup_second_result$/, cards: 1 }],
  ["save it", { acts: /^save:/ }],
]);
conv("resident", "ar", "ordinal with no list", [["الثاني", { clarify: true, noActs: /./ }]]);
conv("resident", "en", "save the first", [
  ["cafes in Al-Awali", { cards: 1 }],
  ["save the first", { acts: /^save:/ }],
]);
conv("resident", "ar", "«أقرب من كذا» refines the last list by distance", [
  ["أبغى مقهى", { cards: 1 }],
  ["فيه أقرب من كذا؟", { notIntent: /^fallback_/, cards: 1 }],
]);
conv("visitor", "ar", "directions to a named place", [["كيف أروح مسجد قباء", { navigate: true, acts: /directions:PLC-060/ }]]);
conv("visitor", "en", "directions to a named place (en)", [["how do I get to Mount Uhud", { navigate: true, acts: /directions:PLC-076/ }]]);

/* Madinah's places by name, part of a name or kind */
conv("resident", "ar", "shawarma", [["أبغى شاورما", { all: nameHas(/شاورما/) }]]);
conv("visitor", "en", "Indian food", [["indian food", { all: nameHas(/هندي|برياني|حيدر|موغول/) }]]);
conv("resident", "ar", "mandi", [["وين آكل مندي", { all: nameHas(/مندي|يمني|حضرم/) }]]);
conv("visitor", "en", "hospital", [["where is the nearest hospital", { all: nameHas(/مستشفى|مدينة الملك سلمان الطبية/) }]]);
conv("visitor", "ar", "taxi", [["أبغى تاكسي", { all: cat("services") }]]);
conv("visitor", "en", "interpreter", [["I need an interpreter", { ids: ["PLC-245"] }]]);
conv("visitor", "ar", "luggage", [["وين أحفظ أمتعتي", { ids: ["PLC-249"], noActs: /save/ }]]);
conv("visitor", "en", "Hilton", [["Hilton", { first: (id) => ["PLC-183", "PLC-174"].includes(id) }]]);
conv("visitor", "en", "Oberoi", [["the Oberoi", { some: (id) => id === "PLC-192" }]]);
conv("visitor", "en", "archers hill", [["archers hill", { first: (id) => id === "PLC-059" }]]);
conv("visitor", "ar", "«بئر رومة»", [["بئر رومة", { first: (id) => id === "PLC-072" }]]);
conv("resident", "ar", "«ورشة السدو»", [["ورشة السدو", { first: (id) => id === "ACT-004" }]]);
conv("resident", "ar", "«حديقة الملك فهد»", [["حديقة الملك فهد", { first: (id) => id === "PLC-142" }]]);
conv("visitor", "en", "miqat", [["where is the miqat", { first: (id) => id === "PLC-057" }]]);
conv("visitor", "ar", "«وين أحرم»", [["وين أحرم؟", { first: (id) => id === "PLC-057" }]]);
conv("visitor", "ar", "«شهداء أحد»", [["شهداء أحد", { first: (id) => ["PLC-067", "PLC-068", "PLC-064"].includes(id) }]]);
conv("resident", "en", "Al Baik with a space", [["Al Baik", { some: (id) => o(id).brand && /البيك/.test(o(id).brand) }]]);
conv("visitor", "en", "al-Baqi", [["I want to visit al-Baqi", { first: (id) => id === "PLC-043", noActs: /save/ }]]);

/* nothing changes that nobody asked to change */
conv("resident", "ar", "«الخط العربي» is not a language change", [["أبغى أتعلم الخط العربي", { noActs: /lang/ }]]);
conv("visitor", "en", "an English-speaking guide is not a language change", [["is there an english guide", { noActs: /lang/, some: nameHas(/مرشد/) }]]);
conv("resident", "ar", "a study group is not a party change", [["أبغى مجموعة مذاكرة", { noActs: /party/ }]]);
conv("resident", "en", "how do I join is a question", [["how do I join a club", { noActs: /join/ }]]);
conv("resident", "en", "book fair is not a booking", [["is there a book fair", { notIntent: /booking/ }]]);
conv("visitor", "en", "remove the first (not in the plan)", [
  ["museums in Madinah", { cards: 1 }],
  ["remove the first", { noActs: /cancel|join/ }],
]);

/* offers */
conv("resident", "en", "any deals", [["any deals?", { all: (id) => !!m.offerFor(o(id)), some: (id) => o(id).category !== "cafe" }]]);
conv("resident", "ar", "restaurant offers, then cafés", [
  ["عروض المطاعم", { all: (id) => !!m.offerFor(o(id)) && o(id).category === "food" }],
  ["والمقاهي؟", { all: (id) => !!m.offerFor(o(id)) && o(id).category === "cafe" }],
]);
conv("visitor", "en", "student discount", [["is there a student discount", { notIntent: /^fallback_/, text: /student/i }]]);
conv("resident", "en", "how to use an offer", [["how do I redeem an offer", { notText: /prototype|handler|data model|developer/i }]]);
conv("resident", "ar", "offer on the place on the table", [
  ["كلمني عن مطبخ مديني العوالي", { first: (id) => id === "PLC-211" }],
  ["هل عليه عرض؟", { ids: ["PLC-211"] }],
]);

/* community */
conv("resident", "en", "Quba community", [["Quba community", { notIntent: /^fallback_/, communities: true }]]);
conv("resident", "ar", "ask the community: the post is the question, not the command", [["اسأل المجتمع عن أفضل مطعم مندي", { compose: true, notText: /اسأل المجتمع عن/ }]]);
conv("resident", "en", "latest posts", [["latest community posts", { contribs: true }]]);
conv("resident", "ar", "«وش أحدث تعليق؟»", [["وش أحدث تعليق؟", { contribs: true }]]);
conv("resident", "ar", "what people say about a place", [["وش يقولون الناس عن مسجد قباء", { intent: /community/ }]]);

/* religious questions and the edges of what the app knows */
conv("resident", "ar", "prayer times are not invented", [["متى صلاة العصر؟", { notText: /\d{1,2}:\d{2}|[٠-٩]{1,2}:[٠-٩]{2}/, notIntent: /^fallback_/ }]]);
conv("visitor", "en", "prayer times (en)", [["prayer times today", { notText: /\d{1,2}:\d{2}/, notIntent: /^fallback_/ }]]);
conv("visitor", "ar", "«وين أصلي»", [["وين أصلي؟", { some: (id) => id === "PLC-040" }]]);
conv("visitor", "en", "Rawdah permit", [["how do I get a Rawdah permit", { text: /Nusuk/ }]]);
conv("visitor", "en", "Umrah in Makkah is outside the app", [["can you help me with umrah in makkah", { notIntent: /^fallback_/, text: /Madinah/, ids: ["PLC-030"] }]]);

/* safety */
conv("visitor", "ar", "emergency", [["عندي حالة طارئة", { all: nameHas(/مستشفى|مدينة الملك سلمان الطبية/), text: /997|الإسعاف/ }]]);
conv("visitor", "en", "a doctor", [["I need a doctor", { all: nameHas(/مستشفى|مدينة الملك سلمان الطبية/) }]]);

/* relevance */
conv("resident", "ar", "a women-only café is not everyone's first café", [["أبغى قهوة", { first: (id) => !(o(id).suit || []).includes("women") }]]);
conv("resident", "en", "restaurants are not sweets shops", [["restaurants", { all: (id) => !/حلويات|كنافة|معجنات/.test(o(id).n) }]]);
conv("visitor", "en", "hotels near the Haram: stays, no 'open now'", [["hotels near the Haram", { all: cat("stay"), notText: /open now/i }]]);

/* when the Assistant doesn't understand, it says so and offers a way on */
conv("resident", "en", "noise", [["asdkjh qwe", { intent: /^fallback_/, sugg: true }]]);
conv("visitor", "ar", "noise (ar)", [["سيبسيب ثقثق", { intent: /^fallback_/, sugg: true }]]);
conv("resident", "en", "recommend something", [["recommend something", { cards: 1 }]]);
conv("visitor", "en", "surprise me", [["surprise me", { cards: 1 }]]);
conv("resident", "ar", "«جوعان»", [["جوعان", { all: isFood }]]);
conv("resident", "en", "bored", [["I'm bored", { cards: 1 }]]);
conv("resident", "en", "help", [["help", { notIntent: /^fallback_/ }]]);

/* second-round regressions: things that read like something else */
conv("visitor", "ar", "a greeting that carries a request", [["السلام عليكم، انا جاي مع عائلتي ونبغى نقعد يومين في المدينة وش تنصحنا؟", { text: /وعليكم السلام/, outing: landmarkDay }]]);
conv("visitor", "en", "a stay of three days, then another day", [
  ["we're staying 3 days in Madinah", { outing: landmarkDay }],
  ["add it to my plan", { acts: /plan:/ }],
  ["plan another day", { outing: (ids) => ids.length >= 2 }],
]);
conv("resident", "en", "is it worth it? changes nothing", [["is quba mosque worth it", { first: (id) => id === "PLC-060", noActs: /profile/ }]]);
conv("resident", "en", "an area named alone is a look at that area", [["quba", { noActs: /profile/, all: inNb("quba") }]]);
conv("resident", "ar", "what people say about an area", [["ايش رأي الناس في العوالي", { intent: /community/, noActs: /profile/ }]]);
conv("resident", "ar", "«واحد» is not Uhud", [["أبغى اقتراحات لشخص واحد", { notText: /أحد/ }]]);
conv("resident", "ar", "«أسواق» are markets, not drivers", [["وش الأسواق", { all: cat("market") }]]);
conv("resident", "ar", "after fajr is the morning, not prayer times", [["الحين بعد صلاة الفجر وش اسوي", { notIntent: /^out_of_scope/, cards: 1 }]]);
conv("visitor", "ar", "the airport is the airport", [["كيف اوصل المطار", { navigate: true, acts: /directions:PLC-167/ }]]);
conv("visitor", "en", "the train station by name", [["haramain train station", { first: (id) => id === "PLC-030" }]]);
conv("resident", "en", "a university is a place, not a student discount", [["tell me about Taibah University", { first: (id) => id === "PLC-155" }]]);
conv("resident", "en", "a café called Book Café is not a booking", [["tell me about Book Café — Al-Jamiah", { first: (id) => id === "PLC-224", noActs: /./ }]]);
conv("resident", "ar", "a name that says «عند» is not a proximity request", [["وين مشي جبلي عند الشروق", { first: (id) => id === "ACT-008" }]]);
conv("resident", "ar", "a study group by name is not a party change", [["كلمني عن مجموعة مذاكرة جامعية", { first: (id) => id === "ACT-027", noActs: /party/ }]]);
conv("resident", "ar", "free", [["ابغى شي مجاني", { all: (id) => o(id).price === 0 }]]);
conv("resident", "ar", "cheap", [["ابغى شي رخيص", { cards: 1, notIntent: /^fallback_/ }]]);
conv("resident", "ar", "this week", [["وش فيه هالاسبوع", { cards: 1 }]]);
conv("resident", "ar", "a walk", [["ودي اطلع اتمشى", { intent: /^activities_sport_walk$/ }]]);
conv("visitor", "ar", "somewhere for the children to play", [["وين اطفالي يلعبون", { all: (id) => (o(id).suit || []).includes("kids") || o(id).category === "family" }]]);
conv("visitor", "ar", "a taxi by another name", [["فيه سيارات اجرة", { all: cat("services") }]]);
conv("visitor", "ar", "an organised tour", [["فيه جولة منظمة", { all: nameHas(/جولة|جولات|مرشد|حافلة معالم/) }]]);
conv("resident", "ar", "for girls", [["شي للبنات", { all: (id) => (o(id).suit || []).includes("women") }]]);
conv("resident", "ar", "students", [["وش فيه للطلاب", { cards: 1, notIntent: /^fallback_/ }]]);
conv("visitor", "ar", "umrah and tawaf are in Makkah", [["ابغى اعتمر", { intent: /^out_of_scope/, ids: ["PLC-030"] }], ["ابغى اطوف", { intent: /^out_of_scope/ }]]);
conv("visitor", "ar", "a Rawdah permit with a prefix", [["ابغى تصريح للروضة", { text: /نسك/ }]]);
conv("resident", "ar", "crowds as a dislike", [["ما احب الزحمة", { notIntent: /^out_of_scope_live/ }]]);
conv("resident", "ar", "add the second with a dialect verb", [
  ["أبغى مقهى في العزيزية", { cards: 2 }],
  ["ضيف الثاني لخطتي", { acts: /^plan:/ }],
]);
conv("resident", "en", "cancel a join", [
  ["walking clubs", { cards: 1 }],
  ["join the first", { acts: /^join:/ }],
  ["cancel it", { acts: /^cancel:/ }],
]);
conv("resident", "en", "good evening is a greeting", [["good evening", { intent: /^greeting_general$/ }]]);
conv("resident", "en", "something within an hour doesn't set the profile", [["I need something within an hour", { noActs: /profile/, cards: 1 }]]);
conv("visitor", "en", "a day plan, closer together", [
  ["plan my day", { outing: (ids) => ids.length >= 2 }],
  ["make it closer together", { intent: /^discover_build_outing$/, outing: (ids) => ids.length >= 2 }],
]);

conv("visitor", "en", "a list asked for after a day plan is a list", [
  ["plan my day", { outing: (ids) => ids.length >= 2 }],
  ["cafes in Al-Aziziyah", { all: (id) => o(id).category === "cafe", notIntent: /^discover_build_outing$/ }],
]);

conv("resident", "ar", "an offer by its own name", [["عرض العشاء العائلي", { intent: /^offers_terms_details$/, ids: ["PLC-211"] }]]);
conv("visitor", "en", "an offer by its own name (en)", [["Family dinner offer", { intent: /^offers_terms_details$/, ids: ["PLC-211"] }]]);

/* the Market and City Opportunities: products, services, homes, business opportunities and my requests */
const isKind = (k) => (x) => x.kind === k && x.ids.length > 0;
conv("resident", "ar", "buy Ajwa dates → Market products", [["أبغى أشتري تمر عجوة", { intent: /^market_products$/, market: (x) => x.kind === "product" && x.ids[0] === "PRD-01", link: /^market:products$/, text: /طلباتي/ }]]);
conv("visitor", "ar", "gifts from Madinah", [["وين ألقى هدايا من المدينة", { intent: /^market_products$/, market: isKind("product") }]]);
conv("visitor", "en", "souvenirs to take home", [["souvenirs to take home", { intent: /^market_products$/, market: isKind("product"), text: /demo/i }]]);
conv("resident", "en", "buy oud oil", [["I want to buy oud oil", { intent: /^market_products$/, market: (x) => x.ids.includes("PRD-04") }]]);
conv("visitor", "ar", "prayer beads", [["أبي أشتري مسبحة", { intent: /^market_products$/, market: (x) => x.ids[0] === "PRD-05" }]]);
conv("resident", "ar", "what's in the Market", [["وش في السوق؟", { intent: /^market_overview$/, link: /^market:products$/ }]]);
conv("visitor", "en", "open the market", [["open the market", { intent: /^market_overview$/, link: /^market:services$/ }]]);
conv("resident", "en", "request a service", [["how do I request a service", { intent: /^market_services$/, cards: 1, link: /^market:services$/ }]]);
conv("resident", "ar", "apartment for rent in Al-Awali", [["أبغى شقة للإيجار في العوالي", { intent: /^city_housing$/, market: (x) => x.kind === "home" && x.ids[0] === "HOM-01", link: /^city:live$/, text: /بلا (أسعار|سعر)/ }]]);
conv("visitor", "en", "a villa for sale", [["is there a villa for sale", { intent: /^city_housing$/, market: (x) => x.ids.includes("HOM-03"), notText: /SAR|riyal/i }]]);
conv("visitor", "ar", "furnished for a few months", [["أبغى شقة مفروشة لعدة أشهر", { intent: /^city_housing$/, market: (x) => x.ids.length > 0 && x.ids.every((id) => ["HOM-04", "HOM-05"].includes(id)) }]]);
conv("resident", "en", "moving to Madinah", [["I'm moving to Madinah, where can I live", { intent: /^city_housing$/, market: isKind("home") }]]);
conv("resident", "ar", "investment opportunities", [["فيه فرص استثمارية في المدينة؟", { intent: /^city_invest$/, market: isKind("opp"), link: /^city:invest$/, text: /ليس جهة استثمار/, notText: /ريال|٪|%/ }]]);
conv("visitor", "en", "return on investment is not answered with numbers", [["what's the return on investment for a hotel", { intent: /^city_invest$/, text: /don't give figures/, market: (x) => x.ids.includes("OPP-01"), notText: /SAR|\d+ ?%/ }]]);
conv("resident", "ar", "open a café", [["أبي أفتح مقهى في المدينة", { intent: /^city_invest$/, market: (x) => x.ids[0] === "OPP-03" }]]);
conv("resident", "ar", "no requests yet", [["وش طلباتي", { intent: /^market_my_requests$/, text: /ما سجّلت/ }]]);
conv("visitor", "en", "my requests", [["my requests", { intent: /^market_my_requests$/, text: /Madinah Ajwa dates/, link: /^requests:$/ }]], null,
  { requests: [{ id: "rq1-PRD-01", kind: "product", ref: "PRD-01", qty: 2, note: null, at: new Date(NOW) }] });
conv("visitor", "ar", "a hotel is still a stay, not a home", [["أبغى فندق قريب من المسجد النبوي", { notIntent: /^(city_housing|market_)/ }]]);
conv("resident", "ar", "apartment offers stay offers", [["فيه عروض على الشقق؟", { notIntent: /^(city_housing|market_)/ }]]);

/* card buttons */
conv("visitor", "en", "card buttons", [
  ["museums in Madinah", { cards: 1 }],
  [{ direct: "action_add_to_plan", card: 0 }, { acts: /^plan:/ }],
  [{ direct: "action_save_object", card: 0 }, { acts: /^save:/ }],
  [{ direct: "action_open_directions", card: 0 }, { acts: /^directions:/, navigate: true }],
  [{ direct: "action_add_to_plan", id: null }, {}],
]);

/* ── runner ── */
const ARABIC = /[؀-ۿ]/;
const universal = (lang, user, r) => {
  const bad = [];
  const t = r.text || "";
  if (!t.trim()) bad.push("empty answer");
  if (/\{\{|undefined|\bnull\b|NaN|\[object/.test(t)) bad.push("unfilled template or code value");
  if (/(:|،|,|\()\s*—\s*([.،,)]|$)|—\s*—|^\s*—/.test(t)) bad.push("empty slot shown as «—»");
  if (/\.\.(?!\.)|\s\.(\s|$)|،\s*\./.test(t)) bad.push("broken punctuation");
  if (lang === "en" && ARABIC.test(t)) bad.push("Arabic in an English answer");
  if (lang === "en" && /،/.test(t)) bad.push("Arabic comma in English");
  if (lang === "ar" && /\b(Join|Going|Saved|Planned|not set)\b/.test(t)) bad.push("English label in an Arabic answer");
  if (/(^|\s)[١٢] (خيارات|مساهمات|خطوات|فروع|تجارب)/.test(t)) bad.push("Arabic number agreement");
  if (/هذا ما يغيّر|Brief fit reason|party context|the .* path\b|not set available/i.test(t)) bad.push("mechanical phrasing");
  if (/makkah|mecca|مكة|مكه|kaaba|الكعبة/i.test(t) && !/makkah|mecca|مكة|مكه|kaaba|الكعبة|عمره|عمرة|umrah|اعتمر|نعتمر|طواف|اطوف|نطوف|tawaf/i.test(user) && !(r.cards || []).some((c) => c.id === "PLC-030")) bad.push("Makkah reference nobody asked for");   // the Haramain railway runs to Makkah
  if (/(prototype|illustrative|handler|data model|its source|provenance|النموذج|بيانات النموذج)/i.test(t)) bad.push("internal language");
  return bad;
};
let pass = 0, fail = 0, chipsTapped = 0;
const failures = [];
const check = (name, cond, detail) => { if (cond) pass++; else { fail++; failures.push(`${name}${detail ? " — " + detail : ""}`); } };
for (const c of C) {
  m.setLang(c.lang);
  let state = m.initialState({ profile: { ...PROFILES[c.persona], lang: c.lang, ...(c.profile || {}) }, ...(c.seed || {}) });
  m.AGENT_SESSION.messages = [];
  m.AGENT_SESSION.mem = FRESH();
  let acts = [];
  const dispatch = (a) => { state = m.reducer(state, a); acts.push(a.type + (a.obj ? ":" + a.obj : "") + (a.patch ? ":" + JSON.stringify(a.patch) : "")); };
  let last = null;
  const label = `${c.persona}/${c.lang} · ${c.name}`;
  if (VERBOSE) console.log(`\n══ ${label}`);
  for (const [turn, exp] of c.turns) {
    acts = [];
    let user, r;
    try {
      if (typeof turn === "string") { user = turn; r = m.agentTurn(turn, { state, ctx: m.deriveContext(state), dispatch }); }
      else if (turn.tap) {
        user = (last?.sugg || []).find((s) => turn.tap.test(s));
        if (!user) { check(`${label} · chip ${turn.tap}`, false, `no such chip in [${(last?.sugg || []).join(" | ")}]`); break; }
        r = m.agentTurn(user, { state, ctx: m.deriveContext(state), dispatch });
      } else if (turn.direct) {
        const id = "id" in turn ? turn.id : last?.cards?.[turn.card || 0]?.id;
        user = `[${turn.direct} on ${id}]`;
        r = m.agentDirect(turn.direct, id, { state, dispatch });
      }
      r.sugg = m.agentSuggestions(r, m.deriveContext(state), c.lang);
    } catch (e) { check(`${label} · «${user}»`, false, "exception: " + e.message); break; }
    const tag = `${label} · «${user}»`;
    const cards = (r.cards || []).map((x) => x.id);
    const outing = r.outing?.ids || null;
    if (VERBOSE) console.log(`  › ${user}\n    [${r.intent}] ${r.text}\n    cards: ${cards.join(" ")}${outing ? "  outing: " + outing.join(" → ") : ""}${acts.length ? "  acts: " + acts.join(" ") : ""}${r.sugg?.length ? "\n    chips: " + r.sugg.join(" | ") : ""}`);
    const errs = universal(c.lang, user, r);
    check(tag + " · answer quality", !errs.length, errs.join("; ") + ` → ${r.text}`);
    const say = `[${r.intent}] ${r.text} · cards ${cards.join(",") || "—"}${outing ? " · outing " + outing.join("→") : ""}${acts.length ? " · acts " + acts.join(" ") : ""}`;
    if (exp.intent) check(tag + ` · intent ${exp.intent}`, exp.intent.test(r.intent || ""), say);
    if (exp.notIntent) check(tag + ` · not ${exp.notIntent}`, !exp.notIntent.test(r.intent || ""), say);
    if (exp.text) check(tag + ` · text ${exp.text}`, exp.text.test(r.text || ""), say);
    if (exp.notText) check(tag + ` · text avoids ${exp.notText}`, !exp.notText.test(r.text || ""), say);
    if (exp.cards === "none") check(tag + " · no cards", !cards.length, say);
    else if (exp.cards) check(tag + ` · at least ${exp.cards} card(s)`, cards.length >= exp.cards, say);
    if (exp.all) check(tag + " · every card fits", cards.length > 0 && cards.every(exp.all), say);
    if (exp.first) check(tag + " · first card", cards.length > 0 && exp.first(cards[0]), say);
    if (exp.some) check(tag + " · a card fits", cards.some(exp.some), say);
    if (exp.ids) check(tag + ` · shows ${exp.ids}`, exp.ids.every((id) => cards.includes(id)), say);
    if (exp.acts) check(tag + ` · does ${exp.acts}`, exp.acts.test(acts.join(" ")), say);
    if (exp.noActs) check(tag + ` · does not ${exp.noActs}`, !exp.noActs.test(acts.join(" ")), say);
    if (exp.outing) check(tag + " · day plan", !!outing && exp.outing(outing), say);
    if (exp.plan) check(tag + " · plan list", !!r.plan && exp.plan(r.plan), say);
    if (exp.market) check(tag + " · market items", !!r.market && exp.market(r.market), say + ` · market ${JSON.stringify(r.market || null)}`);
    if (exp.link) check(tag + ` · links ${exp.link}`, (r.links || []).some((l) => exp.link.test(`${l.to.s}:${l.to.tab || ""}`)), say);
    for (const k of ["contribs", "communities", "navigate", "compose", "clarify"]) if (exp[k]) check(tag + ` · ${k}`, Array.isArray(r[k]) ? r[k].length > 0 : !!r[k], say);
    if (exp.sugg) check(tag + " · offers a way on", (r.sugg || []).length > 0, say);
    /* every chip under the answer, tapped in a copy of this moment */
    for (const s of r.sugg || []) {
      const mem = structuredClone(m.AGENT_SESSION.mem);
      let rr; chipsTapped++;
      try { rr = m.agentTurn(s, { state, ctx: m.deriveContext(state), dispatch: () => {} }); } catch (e) { rr = { intent: "EXCEPTION", text: e.message }; }
      m.AGENT_SESSION.mem = mem;
      const ce = universal(c.lang, s, rr);
      check(`${tag} · chip «${s}»`, rr.intent !== "EXCEPTION" && !/^fallback_/.test(rr.intent || "") && !ce.length, `[${rr.intent}] ${rr.text}${ce.length ? " · " + ce.join("; ") : ""}`);
    }
    last = r;
  }
}

/* the inlined knowledge is exactly what assets/agent/*.json generates, every time */
{
  const src = readFileSync(SRC, "utf8");
  const runs = [];
  for (let i = 0; i < 2; i++) {
    const w = mkdtempSync(join(tmpdir(), "ruhalmadinah-agentsync-"));
    mkdirSync(join(w, "assets"), { recursive: true });
    cpSync(existsSync(join(dirname(SRC), "assets", "agent")) ? join(dirname(SRC), "assets", "agent") : join(REPO, "assets", "agent"), join(w, "assets", "agent"), { recursive: true });
    writeFileSync(join(w, "RihabMadinah-app.jsx"), src);
    const p = spawnSync(process.execPath, [join(REPO, "scripts", "agent-sync.mjs"), w], { cwd: w, encoding: "utf8" });
    runs.push(p.status === 0 ? readFileSync(join(w, "RihabMadinah-app.jsx"), "utf8") : null);
  }
  check("knowledge: assets/agent regenerates without error", runs.every(Boolean));
  check("knowledge: regeneration is identical across runs", runs[0] === runs[1]);
  check("knowledge: the app's inlined bank equals assets/agent", runs[0] === src);
}

failures.forEach((f) => console.log("✗ " + f));
console.log(`\nAssistant: ${C.length} conversations (${C.filter((c) => c.persona === "resident").length} resident, ${C.filter((c) => c.persona === "visitor").length} visitor; ${C.filter((c) => c.lang === "ar").length} Arabic, ${C.filter((c) => c.lang === "en").length} English), ${chipsTapped} chips tapped — ${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
