# رحاب — Rihab

**One platform for Makkah and Madinah.** People sign in once at Rihab, pick a city, and get
that city's app in its own identity: **Rihab Makkah — رحاب مكة** and **Rihab Madinah —
رحاب المدينة**. **Rihab Business Intelligence** gives each city's executive dashboards behind
its own Rihab sign-in.

Rihab brings together two earlier prototypes, EyeMakkah and Ruh Al Madinah. Their
repositories are unchanged.

## The two sites

| Site | Path | What it is |
|---|---|---|
| **The Rihab app** | `/` | The Rihab entry (`shell/`): sign-in, a new Rihab account, password reset, and the city picker |
| | `/makkah/` | Rihab Makkah (`makkah/`) |
| | `/madinah/` | Rihab Madinah (`madinah/`) |
| **Rihab BI** | `/` | The Rihab BI sign-in and city picker (the same entry, in business mode) |
| | `/makkah/`, `/madinah/` | Each city's twelve dashboards, in that city's identity (`bi/`) |

Each site is its own Vercel deployment.

## Identity

- **Rihab** (the entry and the city picker): night ink `#0D1A1B`, Kiswa gold `#C8A45D`, marble
  ivory `#F4EFE4`. The wordmark is «رحاب» in Aref Ruqaa under a gold arch, with "RIHAB" in
  Marcellus. The interface type is IBM Plex Sans Arabic. There is no logo and no tagline.
- **Rihab Makkah** keeps EyeMakkah's identity: Makkah green and brass, Warm Ivory, Tajawal / Inter.
- **Rihab Madinah** keeps Ruh Al Madinah's Noor identity: Marble, Grove and Fajr Blue,
  IBM Plex Sans Arabic, and the Naskh wordmark.

## How the app works

- **One account, both cities.** The account is created and signed in at Rihab. Each city opens
  signed in. Without a session, a city sends the visitor to the Rihab sign-in.
- **Resident or visitor, per city.** The first visit to a city asks for that city's profile,
  prefilled from the account. The person can be a resident of one city and a visitor of the
  other.
- **Moving between cities.** From each city's Home, the switch returns to the city picker. From
  Profile, the other city opens directly. Signing out in a city returns to the Rihab sign-in.
- **The same five tabs in both cities.** Home, Discover, Market, Community and My Plan. The
  Market (experiences, services and local products, with requests kept in My requests) is now
  in Rihab Makkah too.
- **Arabic first, full English.** The language chosen at Rihab carries into the city.

Accounts and storage are described in `docs/ACCOUNTS.md`.

## Demo accounts

| Account | Where | What it shows |
|---|---|---|
| `resident@rihab.app` | The app | A resident in both cities |
| `visitor@rihab.app` | The app | A visitor in both cities |
| `bi@rihab.app` | Rihab BI | The dashboards for both cities |

The password is the shared demo password given with the delivery. The accounts are restored on
every launch.

## Repository

| Path | What it is |
|---|---|
| `shell/` | The Rihab entry: `src/Shell.jsx` (sign-in, account, reset, city picker), `src/rihab-auth.js` (accounts), `index.html`, `media/` (the city photographs), `vercel.json`, `robots.txt` |
| `makkah/` | Rihab Makkah: `RihabMakkah-app.jsx`, its content sources, docs and QA scripts (see `makkah/README.md`) |
| `madinah/` | Rihab Madinah: `RihabMadinah-app.jsx`, its content sources, docs and QA scripts (see `madinah/README.md`) |
| `bi/` | Rihab BI: `shared/` (the dashboards' code), `makkah/` and `madinah/` (each city's names, identity, simulation settings and content snapshot), `page.html` (see `docs/BI_PLATFORM.md`) |
| `build/build.mjs` | Builds both sites into `.out/app` and `.out/bi` |
| `scripts/` | Packaging, the Rihab end-to-end check, the BI content export and the BI checks |
| `tools/` | The scripts that turned the two prototypes into Rihab (rebranding, wiring each city to the Rihab entry, the Makkah Market, the Madinah wording, the BI changes, the QA port). Kept as a record; they are idempotent. |
| `docs/` | `ACCOUNTS.md`, `BI_PLATFORM.md` |

## Build and run

Node.js 20 or later.

```bash
npm ci
node build/build.mjs                       # both sites; or: node build/build.mjs app | bi
python3 -m http.server 8080 -d .out/app    # the app: http://localhost:8080
python3 -m http.server 8090 -d .out/bi     # Rihab BI: http://localhost:8090
```

Accounts need a secure context (`localhost` or HTTPS).

After editing a city's content sources (`i18n/en.json`, `assets/agent/`, photos, places), run
that city's sync scripts from its folder (see its README), then build again. After changing a
city's content, refresh its BI snapshot with `node scripts/bi-content.mjs <city>`.

## Testing

Build first (`node build/build.mjs`). Then, from the repository root:

| Command | What it checks |
|---|---|
| `node scripts/rihab-flow-check.mjs` | One sign-in opens both cities; personas per city; switching city; signing out from a city; a new account set up in each city; Arabic and English |
| `node scripts/bi-check.mjs makkah` · `madinah` | Rihab BI: the model, the sign-in and city switch, every dashboard in both languages, consistency, interactions, viewports (`--quick` for a short run) |

And from `makkah/` or `madinah/`, each city's own suite (it serves `.out/app` and signs in at
the Rihab entry): `verify`, `persona-check`, `market-check`, `audit-fixes-check`,
`consumer-copy-check`, `demo-data-check`, `crawl`, `i18n-scan`, `media-check`,
`mobile-audit`, `ui-audit`, `real-visuals-check`, plus `opportunities-check` (Makkah) and
`assistant-check` / `assistant-ui-check` (Madinah): `node scripts/<name>.mjs`.

## Deployment

```bash
node scripts/package.mjs
```

This builds both sites and writes two drag-and-drop packages:
- `release/Rihab_App_Vercel.zip`: the Rihab app;
- `release/Rihab_BI_Vercel.zip`: Rihab BI.

For each, unzip it and upload the folder at **vercel.com/new** (Framework Preset **Other**,
empty Build Command and Output Directory), as its own Vercel project. Redeploy to the same
project to keep the address: page files are re-checked on every load, bundles carry their
content hash, and browser storage is kept.

## Limits

- This is a prototype. Accounts and everything people save are kept on the device only.
  Nothing is sent to a server, seller, provider or organisation, and nothing is paid.
- The BI figures are simulated.
- The names and wordmarks are provisional, with no implied affiliation with any authority.
