# Ruh Al Madinah — روح المدينة

> **روح المدينة مجتمع رقمي لسكان المدينة المنورة وزوارها**: مكان واحد لاكتشاف الأماكن
> والتجارب، والتفاعل مع المجتمع، وبناء خطة شخصية.

Ruh Al Madinah is a working product demo for the people of Madinah and its visitors. It
brings together real Madinah places, activities, community groups and offers in one
Arabic-first app (with full English), with a personal plan, a Market for experiences,
services and local products, City Opportunities for homes and business, and an on-device
Assistant.

The name and the wordmark are **provisional**. There is no official logo, and the app
claims no affiliation with any authority or organisation.

## What it does

- **Account-first entry.** Start → Language → Sign in / Create account (email, mobile + SMS
  code, Apple or Google) → Profile setup → Home, plus *Forgot password*. There is no guest
  entry.
- **One app, two experiences.** In profile setup the person chooses once, and permanently,
  between **ساكن في المدينة** (resident) and **زائر** (visitor).
  - Residents get a local-life app: their area, what's new, this week, community, hobbies and
    initiatives.
  - Visitors get a trip companion: interests, must-dos, today, nearby, and a day-by-day
    «رحلتي في المدينة». Visitors aren't asked for a neighbourhood.
- **Five tabs: الرئيسية · اكتشف · السوق · المجتمع · خطتي** (Home, Discover, Market, Community,
  My Plan). Profile sits behind the avatar.
  - Discover offers search, filters, a schematic map and a list.
  - The Market gathers experiences, services and local products to book or request.
  - Community holds families, communities, clubs and posts.
  - My Plan keeps saved, planned, joined and booked items.
- **The Ruh Al Madinah Assistant.** It opens from the Home assistant card and from search,
  as one free-text conversation in Arabic or English. It runs on the device: a deterministic
  Intent Bank with no generative model and no external API. It answers from the same places,
  offers and plan state as the rest of the app, and can save, plan and build day plans.
- **City Opportunities («فرص المدينة»).** A Home section with two doors: *Live in Madinah*
  (homes to rent or buy, furnished longer stays) and *Invest in Madinah* (an informational
  directory of business opportunities, with no amounts, returns or advice). It is not a tab.
- **My requests («طلباتي»).** Requests for products, services and home details, and registered
  interest in opportunities, are recorded on the device and never sent anywhere. The app says
  so every time. See `docs/MARKET_AND_OPPORTUNITIES.md`.
- **Offers.** One shared offers model is read by cards, decision pages, Home, Discover,
  My Plan and the Assistant. Offers sit on illustrative records only, never on a real business.
- **Accounts on the device.** Hashed passwords, a per-account profile and My Plan, and a
  starter plan («خطة مقترحة لك» / *Recommended for you*) for every new account. Filling
  `dist/config.js` switches accounts to Firebase Authentication and Firestore.

Three accounts are ready on every device, even after browser data is cleared (see
`docs/ACCOUNTS.md`):

| Account | Password | Experience |
|---|---|---|
| `admin@admin.com` | `admin` | Review account (resident) |
| `resident@ruhalmadinah.demo` | `demo` | Resident |
| `visitor@ruhalmadinah.demo` | `demo` | Visitor |

## Content

All content comes from the project's content workbook (kept outside this repository), with
its record ids kept as the app's ids (`PLC-`, `ACT-`, `OFR-`, `COM-P`).

| Content | Count |
|---|---|
| Places | 257: **197 real Madinah places** + 60 illustrative sample places |
| Activities | 89: 29 experiences, 22 events, 19 activities, 19 recurring sessions |
| Offers | 73: 64 deals + 9 offer pages, all on illustrative records only |
| Community | 178 records: 8 families, 55 communities, 10 clubs, 18 author personas, 85 posts, 2 trust-demo claims |
| Geography | 53 districts, 15 of them selectable home areas |
| Market | 10 demo products; the inventory's experiences and services |
| City Opportunities | 5 demo homes, 5 demo business opportunities (no prices, no financial figures) |
| Assistant | 156 intents, 2,413 Arabic and English example phrasings, 12 alias groups |

Map positions are schematic (a district's approximate direction and distance from the
Prophet's Mosque), never GPS. A place whose district the sources don't give shows the city
as its area and has no pin.

Real places show only what their sources state, with no invented hours, prices, ratings or
offers. Each one shows its own photograph (154), its brand's logo (29: 25 supplied, reused
across a brand's branches, and 4 Simple Icons marks), or a drawn category tile (14).
Illustrative records use a 50-photo generic library or their category tile; the Market's
products and City Opportunities use photos from the same library. No photograph of
Makkah is used. Sources are listed in `PHOTO_SOURCES.md` and are never shown in the app.

## Project structure

| Path | What it is |
|---|---|
| `RuhAlMadinah-app.jsx` | **The app.** One React source file (default export; imports only `react` and `lucide-react`). It also works as a Claude artifact. Content, screens, the Assistant and the theme all live here. |
| `src/main.jsx` | Mounts the app in the page. |
| `build/build.mjs`, `build/fingerprint.mjs` | The esbuild bundler. It writes `dist/app.<content-hash>.js` and points `dist/index.html` at it. |
| `dist/` | **The zero-build Vercel package**: `index.html`, the prebuilt bundle, `config.js`, `vercel.json`, `robots.txt`, a deployment `README.md` (Arabic), `manifest.json`, `PHOTO_SOURCES.md` and `BUILD_INFO.txt`. |
| `release/` | `RuhAlMadinah_Vercel_DragDrop.zip` and its unpacked folder, made from `dist/` by `scripts/package.mjs`. |
| `i18n/en.json` | The English dictionary. Arabic is the source language. |
| `assets/agent/` | The Assistant's Intent Bank, in four JSON files (core, discovery, actions and business, context). |
| `assets/madinah/` | The Madinah photo collection: 162 source files (156 photographs, 6 logos), `SOURCES.csv` and `MISSING.txt`. |
| `assets/places/`, `assets/place-data.js` | The real-place photographs and logos cropped for the app (178 files), and their inlined data. |
| `assets/photos/`, `assets/photo-data.js` | The 50-photo generic library (`manifest.json` lists sources), and its inlined data. |
| `scripts/*-sync.mjs` | Steps that inline a source into the app (see *Editing content*). |
| `scripts/*.py` | Image builders for the two photo sets (Python 3 with Pillow). |
| `scripts/*-check.mjs`, other `scripts/*.mjs` | The QA suite, the release packager and screenshot helpers. `scripts/lib/` holds the shared Chromium launcher, static server, QA accounts and a Firebase test double. |
| `PHOTO_SOURCES.md` | Every photograph and logo the app can render, and where it came from. |
| `docs/` | Product and technical documentation (see *Documentation*). |

## Local development

Requirements:
- **Node.js 20 or later** and npm.
- **Python 3 with Pillow**, only to rebuild images.
- **`zip`**, only to package a release.

The QA scripts use Playwright's Chromium.

```bash
npm ci                                    # install the exact locked dependencies
npm run build                             # → dist/app.<hash>.js, and dist/index.html updated to load it
python3 -m http.server 8080 -d dist       # then open http://localhost:8080
```

`npm run check` parses and bundles the app without writing anything.

### Editing content

Content, copy and logic are edited in `RuhAlMadinah-app.jsx`. Four kinds of data are kept in
their own files and inlined into the app by a sync step. Each step replaces its one block,
so running it twice changes nothing. Each also accepts a copy of the repository as its first
argument.

| You edit | Then run | It writes, in the app |
|---|---|---|
| `i18n/en.json` | `node scripts/i18n-sync.mjs` | `EN_TXT` |
| `assets/agent/*.json` | `node scripts/agent-sync.mjs` | `AGENT_BANK` (and fails on duplicate intents, examples or aliases) |
| `assets/photos/manifest.json` + images | `python3 scripts/photos-build.py`, then `node scripts/photo-sync.mjs` | `PHOTO_DATA` |
| `assets/places/` (or `assets/madinah/images/`) | `python3 scripts/place-assets-build.py [--src]`, then `node scripts/place-sync.mjs` | `PLACE_ASSETS` |

`npm run sync` runs all four sync steps. Rebuild with `npm run build` afterwards.

### Changing the name or the colours

The name and identity are provisional and kept easy to change:
- **Colours.**
  - `T` holds the shared surface, text and type tokens.
  - `BRAND_THEME` holds the entry screens.
  - `PERSONA_THEME` holds the resident (Daylight) and visitor (Evening light) themes.
  - All three sit at the top of `RuhAlMadinah-app.jsx`, and `applyTheme` maps them onto the
    components.
- **Wordmark.** The `Wordmark` component renders it.
- **Name.**
  - On screen, the name appears as «روح المدينة» / "Ruh Al Madinah" in the app's copy,
    `i18n/en.json` and the Assistant bank (`product` in each `assets/agent` file).
  - In the page and package, it appears in `dist/index.html`, `dist/README.md` and
    `dist/manifest.json`.
  - A search for both spellings finds every place. Then run the sync steps and rebuild.

The visual identity is «نور» Noor:
- Marble `#F5F5F2` and Basalt Ink `#1B2027` are shared.
- Residents use Grove `#1E6A60` on a light hero.
- Visitors use Fajr Blue `#24548A` with Night Noor `#172A46` heroes.
- Canopy Light `#F3D79E` is the one warm note.
- Madani Rose `#B03D5C` marks saves and live moments.
- Type is IBM Plex Sans Arabic / IBM Plex Sans, with Noto Naskh Arabic for the wordmark only.

## Testing

The scripts test the built app, so run `npm run build` first. The browser scripts serve `dist/` and
fail on any console error. QA pins the clock through `scripts/lib/browser.mjs`
(`QA_NOW=<ISO time>`, or `QA_NOW=real`).

| Script | What it checks |
|---|---|
| `scripts/verify.mjs` | 23 runtime journeys in Chromium |
| `scripts/demo-data-check.mjs` | The offer calendar, activity times, search ranking and Assistant answers |
| `scripts/assistant-check.mjs` | 154 Assistant conversations over both experiences, in Arabic and English, including the Market and City Opportunities. It also taps every suggestion chip, and checks the bank regenerates identically |
| `scripts/assistant-ui-check.mjs` | The Assistant in Chromium: chips, card buttons, a day plan into My Plan, directions, the composer |
| `scripts/persona-check.mjs` | Resident vs visitor: onboarding, Home, themes, Arabic and English, at 360 and 390 px |
| `scripts/auth-check.mjs` | Sign-in, sign-up, recovery and account flows, on the device and against a Firebase test double |
| `scripts/entry-check.mjs` | Start → language → sign-in, the wordmark, the text direction and the five tabs |
| `scripts/audit-fixes-check.mjs` | The interface rules in `docs/PRODUCT_RULES.md`, for both experiences and languages |
| `scripts/real-visuals-check.mjs` | Every real place's photograph or logo follows the photo rules |
| `scripts/consumer-copy-check.mjs` | No sourcing, provenance or prototype language on screen |
| `scripts/i18n-scan.mjs` | Arabic left on English screens |
| `scripts/mobile-audit.mjs` | Overflow, clipping and touch targets on phone widths |
| `scripts/media-check.mjs` | Every image decodes, and content media are photographs or drawn tiles |
| `scripts/cache-check.mjs` | One URL serves the latest deployment after a refresh |
| `scripts/crawl.mjs` | A broad crawl for dead ends and blank screens |
| `scripts/market-check.mjs` | The Market and City Opportunities: five tabs, the three Market categories, products, service requests, homes and opportunities with their demo labels, no prices or financial figures, requests that persist and can be withdrawn, and the Assistant's links |
| `scripts/package-qa.mjs` | The extracted release ZIP: `ROOT=<extracted folder> node scripts/package-qa.mjs` |

Two more scripts:
- `scripts/ui-audit.mjs` walks every screen at seven viewports (360, 375, 390, 393, 412 and
  430 px, and a 1280 px desktop) in Arabic and English. It reports overflow, clipped or cut
  text, small tap targets and broken images, and writes screenshots (`OUT`, default
  `/tmp/ui-audit`).
- `scripts/shots.mjs` captures a set of review screenshots.

## Deployment

```bash
npm run build
npm run package          # refresh release/ and release/RuhAlMadinah_Vercel_DragDrop.zip from dist/
```

To deploy, upload the ZIP's folder at **vercel.com/new** with the Framework Preset **Other**
and an empty Build Command and Output Directory. `dist/README.md` gives the steps in Arabic.

Redeploy to the **same Vercel project** to keep the URL. The bundle's name carries its content
hash, and `vercel.json` re-checks the page and `config.js` on every load. A refresh therefore
shows the latest deployment, and browser storage (accounts, sessions, profiles, plans) is never
touched.

## Clock and schedules

The app reads the real clock, in Saudi time (UTC+03:00). Sample schedules are written as
offsets from today's date, so their clock times stay as designed on any day. Offers end on
their workbook dates, between 1 November 2026 and 30 April 2027. An expired offer renews for
another period of the same length, so the demo always has offers running.

## Documentation

| Document | Contents |
|---|---|
| `docs/PRODUCT_RULES.md` | The product rules: states that never collapse, trust, privacy, information order, interface quality, and what not to do |
| `docs/DUAL_EXPERIENCE.md` | One app, two experiences (resident and visitor), and the Noor themes |
| `docs/AGENT_AND_OFFERS.md` | The shared offers model and the Assistant pipeline |
| `docs/MARKET_AND_OPPORTUNITIES.md` | The Market, City Opportunities, My requests and their Assistant intents |
| `docs/ACCOUNTS.md` | Account flows, on-device storage, the starter plan, and optional Firebase / Google / Apple setup |
| `docs/JOURNEYS.md` | The 55 validated journeys |
| `docs/REAL_PLACES.md` | The 197 real places: district, kind, sources, confidence and visual |
| `PHOTO_SOURCES.md` | The source of every photograph and logo |

## Limits

- Offers, participant counts, community posts and the 60 sample places are illustrative demo
  content, not live data.
- Market products, homes and business opportunities are demo examples, marked «مثال توضيحي».
  There are no payments, sellers, listings or investment services behind them, and requests stay
  on the device.
- Official and transactional services stay with the authorities and providers that own them.
  Leaving the app for a provider records «انتقلت لإكمال الحجز», and nothing becomes «مؤكد»
  without a real confirmation.
- The Assistant matches text against its bank; unusual phrasings get a clarifying answer
  rather than an invented one.
- Confirm the rights for every photograph and logo before any public release (see
  `PHOTO_SOURCES.md`).
