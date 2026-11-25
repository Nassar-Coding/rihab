# رحاب مكة — مجتمع مكة الرقمي

> **رحاب مكة هو مجتمع رقمي لسكان مكة وزوارها**: مكان واحد لاكتشاف الخدمات والتجارب
> ذات الصلة، والتفاعل مع المجتمع، وبناء خطة شخصية — وتفاعلات ذات معنى تدعم التحليلات
> وذكاء الأعمال لاحقًا.

This repository holds the **transformation** of Rihab Makkah from the current four-portal
prototype into one consumer product for Makkah residents and visitors, following the
meeting direction and the five transformation groups in `docs/handover/`.

> **Part of Rihab (رحاب).** This folder is Rihab Makkah inside the Rihab repository. People
> sign in once at the Rihab entry and pick a city; this app then opens signed in, under
> `/makkah/`. Build, test and package from the repository root — see the root `README.md`.
> The Rihab demo accounts are listed there too.

## Deliverables

| Deliverable | Path |
|---|---|
| **Vercel package** | Part of the Rihab app package, built at the repository root (see the root `README.md`) |
| **Single JSX file for a Claude artifact** | `RihabMakkah-app.jsx` (default export, imports only `react` + `lucide-react`) |

## What is here

| Path | What it is |
|---|---|
| `RihabMakkah-app.jsx` | **The product.** One source file — also the Claude artifact deliverable. |
| `public/`, `dist/` | The page, `config.js` and `manifest.json` (`public/`), and the build output (`dist/`, published under `/makkah/` by the Rihab build). |
| `src/main.jsx`, `build/build.mjs`, `build/fingerprint.mjs` | Mount entry + esbuild bundler that produces `dist/app.<hash>.js` and points `index.html` at it. |
| `scripts/verify.mjs` | Runtime verification: creates an account through the sign-up screens and walks 23 journeys. |
| `scripts/demo-data-check.mjs` | Demo-data checks on the app's own code: the offer calendar and its renewal, the offer day count against the end date at every hour, realistic activity times, weekly meetings under way and paused groups, filtered lists that keep every match, full-name and chain search in Arabic and English, and the Assistant's place and stay answers. |
| `scripts/opportunities-check.mjs` | Makkah Opportunities («فرص مكة») and My requests («طلباتي»): Home placement, Live and Invest filters, detail pages, demo labels, no prices or financial figures, both request purposes, editing, persistence, Profile, withdrawal and the Assistant — both personas, AR/EN. |
| `scripts/audit-fixes-check.mjs` | Regression checks for the approved audit corrections (Back state including search results, clock and offers, schedules, prices including stay offers, map with tapped 44 px pin areas, Start now on the page and in My Plan, trip card, community heading, chips and their summary language, ended, paused and inactive items, text direction including the Urdu original, toast language, plurals, Assistant routing, imagery): both personas, AR/EN, 360/390 px, at several pinned times of day. |
| `scripts/auth-check.mjs`, `scripts/entry-check.mjs` | Account flows in Arabic and English with on-device accounts; the Firebase adapter is checked against `scripts/lib/firebase-test-server.mjs`, a local service with the same REST contract as Firebase. |
| `scripts/lib/browser.mjs`, `scripts/lib/rihab-entry.mjs` | The shared Chromium launcher and static server for every QA script (`CHROMIUM_PATH` optional), and the Rihab sign-in they go through. |
| `scripts/crawl.mjs` | QA crawl for blank screens, dead ends and console errors. |
| `scripts/shots.mjs` | Screenshot sweep of the main surfaces. |
| `docs/JOURNEYS.md` | The 48 validated Makkah journeys. |
| `docs/REAL_PLACES.md` | The real Makkah places (restaurants, cafés, shops, parks, museums, landmarks): each one's district, sources, confidence and photo status, and the candidates left out. |
| `docs/AGENT_AND_OFFERS.md` | The shared offers model and the free-text Rihab Makkah Assistant (Intent Bank pipeline, follow-ups, actions, limits). |
| `assets/agent/`, `scripts/agent-sync.mjs` | The four Agent Bank JSON files (150 intents, 2,123 AR/EN examples) and the step that inlines them into the app. |
| `baseline/` | The canonical **current** Rihab Makkah (`RihabMakkah-app.current.tsx`, `rihab-vercel.current.zip`) kept for comparison. |
| `docs/handover/` | Meeting notes, the five group definitions, product rules, visual system, DO-NOT-DO. |
| `PHOTO_SOURCES.md` | Every bundled photograph: its use, tier (exact / Makkah context / generic) and provenance. |
| `docs/APP_QUALITY_AUDIT.md` | The screen-by-screen visual, responsive, bilingual and media quality audit and its corrections. |
| `scripts/ui-audit.mjs` | The audit harness: 7 viewports × Arabic/English, geometry checks and screenshots of every state. |
| `assets/photos/`, `scripts/photos-build.py`, `scripts/photo-sync.mjs` | The photo library, its manifest-driven builder, and the step that inlines it into the app. |

## Primary navigation

Entry is the Rihab entry: **Rihab sign-in or a new Rihab account → pick Makkah → Profile setup (first visit only, prefilled from the account) → Home**; *Forgot password* is at Rihab. There is no guest entry. Accounts run on the device with no external service: one Rihab account (hashed password) for both cities, with a profile, My Plan and requests per city. A new account starts with a starter plan, «خطة مقترحة لك» / *Recommended for you*, built from the inventory. The app shell is not mounted until someone is signed in. See `docs/ACCOUNTS.md` at the Rihab repository root.

**One app, two experiences.** In profile setup the person chooses once, and permanently, between **ساكن في مكة** (resident) and **زائر** (visitor).
- **Residents** get a local-life app: their area, what's new, this week, community, hobbies and initiatives. The palm-green theme.
- **Visitors** get a trip companion: interests, must-dos, today, nearby, day-by-day «رحلتي في مكة». The brass theme. They aren't asked for a neighbourhood.

The tabs, Save / Plan / Join / booking hand-off, Community and the Assistant stay one shared system. There is no persona toggle.

Two permanent demo accounts are ready on every device:
- `resident@rihab.app`
- `visitor@rihab.app`

See `docs/DUAL_EXPERIENCE.md`.

**الرئيسية · اكتشف · المجتمع · خطتي** — Profile sits behind the avatar. There is no AI tab:
AI is horizontal (relevance, trust, journey continuity, translation, community intelligence).
The Rihab Makkah Assistant opens from the Home assistant card (and from search) as a single
free-text conversation — no fifth tab, no floating bubble.

## Offers & the Assistant

Offers and discounts are one shared model (`DEALS`: 64 illustrative records across
restaurants, cafés, stays, culture, experiences, activities, events, markets and services)
read by cards, decision pages, the Home and Discover deal rails, My Plan and the Assistant.
The Assistant matches free Arabic/English text against the full four-part Intent Bank and
answers from the same objects, offers and plan state. See `docs/AGENT_AND_OFFERS.md`.

## Makkah Opportunities

«فرص مكة» on Home opens two experiences: «عِش في مكة» / Live in Makkah (homes to rent or own, and
extended stays) and «استثمر في مكة» / Invest in Makkah (a directory of business opportunities).
Registering interest or asking for details is recorded in «طلباتي» / My requests on the device.
No prices or financial figures are shown, and nothing is sent anywhere.
See `docs/CITY_OPPORTUNITIES.md`.

## State semantics that never collapse

> حفظ ≠ أضف إلى خطتي ≠ انضم ≠ سأحضر ≠ حجز ≠ مؤكد ≠ حضرت

Leaving Rihab Makkah for an external provider records `انتقلت لإكمال الحجز`. Nothing becomes
`مؤكد` without a real callback or an explicit confirmation from the user.

## The five transformation groups, cumulative in one app

| Group | What it added | Checkpoint |
|---|---|---|
| 1 — Living Makkah | Inventory layer (169 objects, 15 areas, 14 categories), Home compositor, Discover, Search, Map, Decision pages, source claims and freshness classes | `f95bac9` |
| 2 — Community | 8 families / 50 communities / 10 clubs, one Contribution model, editorial community home, club ≠ community ≠ activity | `0da1de6` |
| 3 — Participation | The full loop with distinct states, assembled outings, Plan as a continuity timeline, active and completion states | `929399c` |
| 4 — Trust | Conflict comparison, review queue, archive, visible moderation, safety & privacy centre | `aa63443` |
| 5 — Personalisation | Dismissal with reasons, selective notifications, provider/host role, interaction signals, full state coverage | `92e8e00` |

## Build

From the repository root:

```bash
node build/build.mjs app     # → .out/app: the Rihab entry, /makkah/ and /madinah/
```

Then, from this folder (`cd makkah`):

```bash
node scripts/agent-sync.mjs          # inline assets/agent/*.json as AGENT_BANK (after editing the bank)
node scripts/verify.mjs              # 23 runtime journeys in Chromium, fails on any console error
node scripts/persona-check.mjs       # resident vs visitor: onboarding, Home, themes, AR + EN
node scripts/market-check.mjs        # the Market, its requests and the Assistant's links, AR + EN
node scripts/opportunities-check.mjs # Makkah Opportunities and My requests, both personas, AR + EN
node scripts/audit-fixes-check.mjs   # the audit corrections, both personas, AR + EN, 360 + 390 px
node scripts/demo-data-check.mjs     # offer calendar, activity times, search ranking, Assistant place answers
node scripts/crawl.mjs               # broad QA crawl for dead ends and blank screens
node scripts/ui-audit.mjs            # screen-by-screen layout/media audit, 7 viewports × AR/EN
```

The browser scripts serve `.out/app`, sign in at the Rihab entry and open Rihab Makkah.

## Caching and updates

Stakeholders keep one URL; a refresh shows the latest deployment, with no new URL and no
clearing of browser data.
- The bundle is published as `app.<content-hash>.js` (`build/fingerprint.mjs`, run by every
  build and by the packager). New code means a new file name no browser has cached;
  `index.html` loads `config.js?v=<content-hash>` too.
- Rihab's `vercel.json` re-checks the page, `config.js` and any unhashed `app.js` on every load,
  and lets browsers keep a hashed bundle (its content never changes).
- This replaces the early packages' `app.js` cached as `immutable` for a year, which kept
  returning browsers on an old version after a redeploy.
- Browser storage (accounts, sessions, profiles, plans) is never touched; it stays
  with the site's address.
- Redeploy to the **same Vercel project** to keep the URL.

## Clock and schedules

The app reads the real clock, in Makkah time (UTC+03:00). Sample schedules are written as
offsets from today's date at 18:20, so their clock times stay as designed on any day; a
dated item's "when" row on its page is read from that same schedule, never from a written
copy, and a session's shown length is its schedule's length. Offers are fictional demo
content on one calendar: every offer ends between 1 November 2026 and 30 April 2027 (the
first on 1 November), and an offer that has expired renews for another period of the same
length, so the demo always has offers running. QA pins the clock through
`scripts/lib/browser.mjs` (`QA_NOW=<ISO time>`, or `QA_NOW=real` for the real clock).

Search ranks a place's own name first — its exact or full name in Arabic or English, its
chain's name, or every word of the query in the name — with Arabic spelling variants
(أ/ا, ة/ه, ى/ي) treated alike; personal relevance only orders results within a level.

## Prototype honesty

Operational values, offers, participant counts and community contributions are
illustrative prototype content, not live data. Official and transactional services stay
with the authorities and providers that own them; Rihab Makkah orchestrates the context
around the decision.

## Real Makkah places

The inventory includes 178 real places in Makkah, among them 165 venues: restaurants,
cafés, bakeries and sweets, bookstores, malls, markets, supermarkets, parks, walkways,
museums and historic sites. Each sits in the district its sources give, so each area
shows its own places. Real places show only what sources state: no hours, prices,
ratings or offers. A real place shows its own photograph or its brand's (99 assets supplied by the
project owner in `assets/places/`, each brand's asset reused across its branches), its
brand's logo, or else a drawn tile for the kind of place; never a stock image. The app shows the visual
without labelling or explaining it, and shows no sources, confidence or review dates.
That provenance stays in the data and in `docs/REAL_PLACES.md`, which lists the sources,
confidence and photo status of every place.
