# Rihab Madinah — رحاب المدينة

> **رحاب المدينة مجتمع رقمي لسكان المدينة المنورة وزوارها**: مكان واحد لاكتشاف الأماكن
> والتجارب، والتفاعل مع المجتمع، وبناء خطة شخصية.

Rihab Madinah is a working product demo for the people of Madinah and its visitors. It
brings together real Madinah places, activities, community groups and offers in one
Arabic-first app (with full English), with a personal plan, a Market for experiences,
services and local products, City Opportunities for homes and business, and an on-device
Assistant.

The name and the wordmark are **provisional**. There is no official logo, and the app
claims no affiliation with any authority or organisation.

> **Part of Rihab (رحاب).** This folder is Rihab Madinah inside the Rihab repository. People
> sign in once at the Rihab entry and pick a city; this app then opens signed in, under
> `/madinah/`. Build, test and package from the repository root — see the root `README.md`.

## What it does

- **The Rihab entry.** Sign-in, account creation and password reset happen once at Rihab,
  for both cities. Without a session, `/madinah/` sends the visitor to the Rihab sign-in. The
  first visit to Rihab Madinah asks for this city's profile, prefilled from the account. There
  is no guest entry.
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
- **The Rihab Madinah Assistant.** It opens from the Home assistant card and from search,
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
- **One Rihab account, a profile per city.** Accounts are kept on the device with hashed
  passwords. Each city keeps its own profile, My Plan and requests for the account, and every
  new account starts with a plan («خطة مقترحة لك» / *Recommended for you*).

The Rihab demo accounts (a resident and a visitor) are listed in the root `README.md`.

## Project structure

| Path | What it is |
|---|---|
| `RihabMadinah-app.jsx` | **The app.** One React source file (default export; imports only `react` and `lucide-react`). It also works as a Claude artifact. Content, screens, the Assistant and the theme all live here. |
| `src/main.jsx` | Mounts the app in the page. |
| `build/build.mjs`, `build/fingerprint.mjs` | The esbuild bundler. It writes `dist/app.<content-hash>.js` and points `dist/index.html` at it. The Rihab build (`build/build.mjs` at the repository root) runs it and publishes the result under `/madinah/`. |
| `public/` | The page, `config.js` and `manifest.json`, copied into `dist/` by the build. |
| `i18n/en.json` | The English dictionary. Arabic is the source language. |
| `assets/agent/` | The Assistant's Intent Bank, in four JSON files (core, discovery, actions and business, context). |
| `assets/madinah/` | The Madinah photo collection: 162 source files (156 photographs, 6 logos), `SOURCES.csv` and `MISSING.txt`. |
| `assets/places/`, `assets/place-data.js` | The real-place photographs and logos cropped for the app (178 files), and their inlined data. |
| `assets/photos/`, `assets/photo-data.js` | The 50-photo generic library (`manifest.json` lists sources), and its inlined data. |
| `scripts/*-sync.mjs` | Steps that inline a source into the app (see *Editing content*). |
| `scripts/*.py` | Image builders for the two photo sets (Python 3 with Pillow). |
| `scripts/*-check.mjs`, other `scripts/*.mjs` | The QA suite and screenshot helpers. `scripts/lib/` holds the shared Chromium launcher, the static server, the Rihab entry (`rihab-entry.mjs`), QA accounts and a Firebase test double. |
| `PHOTO_SOURCES.md` | Every photograph and logo the app can render, and where it came from. |
| `docs/` | Product and technical documentation (see *Documentation*). |

## Local development

Install, build and serve from the repository root (Node.js 20 or later):

```bash
npm ci
node build/build.mjs app                  # → .out/app: the Rihab entry, /makkah/ and /madinah/
python3 -m http.server 8080 -d .out/app   # then open http://localhost:8080
```

Python 3 with Pillow is needed only to rebuild images.

### Editing content

Content, copy and logic are edited in `RihabMadinah-app.jsx`. Four kinds of data are kept in
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
  - All three sit at the top of `RihabMadinah-app.jsx`, and `applyTheme` maps them onto the
    components.
- **Wordmark.** The `Wordmark` component renders it.
- **Name.**
  - On screen, the name appears as «رحاب المدينة» / "Rihab Madinah" in the app's copy,
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

The scripts test the built Rihab app, so run `node build/build.mjs app` at the repository root
first, then run them from this folder (`node scripts/<name>.mjs`). The browser scripts serve
`.out/app`, sign in at the Rihab entry, open Rihab Madinah and fail on any console error. QA pins
the clock through `scripts/lib/browser.mjs` (`QA_NOW=<ISO time>`, or `QA_NOW=real`).

| Script | What it checks |
|---|---|
| `scripts/verify.mjs` | 23 runtime journeys in Chromium |
| `scripts/demo-data-check.mjs` | The offer calendar, activity times, search ranking and Assistant answers |
| `scripts/assistant-check.mjs` | 154 Assistant conversations over both experiences, in Arabic and English, including the Market and City Opportunities. It also taps every suggestion chip, and checks the bank regenerates identically |
| `scripts/assistant-ui-check.mjs` | The Assistant in Chromium: chips, card buttons, a day plan into My Plan, directions, the composer |
| `scripts/persona-check.mjs` | Resident vs visitor: onboarding, Home, themes, Arabic and English, at 360 and 390 px |
| `scripts/audit-fixes-check.mjs` | The interface rules in `docs/PRODUCT_RULES.md`, for both experiences and languages |
| `scripts/real-visuals-check.mjs` | Every real place's photograph or logo follows the photo rules |
| `scripts/consumer-copy-check.mjs` | No sourcing, provenance or prototype language on screen |
| `scripts/i18n-scan.mjs` | Arabic left on English screens |
| `scripts/mobile-audit.mjs` | Overflow, clipping and touch targets on phone widths |
| `scripts/media-check.mjs` | Every image decodes, and content media are photographs or drawn tiles |
| `scripts/crawl.mjs` | A broad crawl for dead ends and blank screens |
| `scripts/market-check.mjs` | The Market and City Opportunities: five tabs, the three Market categories, products, service requests, homes and opportunities with no demo labels, no prices or financial figures, requests that persist and can be withdrawn, and the Assistant's links |

Two more scripts:
- `scripts/ui-audit.mjs` walks every screen at seven viewports (360, 375, 390, 393, 412 and
  430 px, and a 1280 px desktop) in Arabic and English. It reports overflow, clipped or cut
  text, small tap targets and broken images, and writes screenshots (`OUT`, default
  `/tmp/ui-audit`).
- `scripts/shots.mjs` captures a set of review screenshots.

## Deployment

Rihab Madinah ships inside the Rihab app package. See *Deployment* in the root `README.md`.

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
