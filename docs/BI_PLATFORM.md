# The Business Intelligence platform

`bi/` is a separate web platform: executive dashboards about Ruh Al Madinah. It does not
replace the app or change it. It reads the app's content, simulates how people use it, and
presents that in twelve dashboards, in Arabic (right to left) and English (left to right).

It is a **demo**:
- The names, areas, categories, places, activities, offers, communities, Market products,
  homes and business opportunities are the app's own.
- Every figure is simulated. The same filters always give the same figures.
- The screens say so. Money values and Visitor Center operations carry their own demo labels.

## 1. Where it comes from

The platform is built on the EyeMakkah BI platform (the `BI-Platform` branch of the EyeMakkah
repository, folder `bi/`), adapted to Ruh Al Madinah.

**Reused and adapted**
- The architecture: a static, dependency-free page that draws HTML and SVG into one root, and
  deploys to Vercel with no build.
- The entry: welcome → language → demo sign-in → dashboards. The session stays for the tab;
  the language stays on the device.
- One row of shared filters (period, area, category, audience) that recalculates every chart.
- The chart family: KPI tiles, bar lists, funnels, lines, donuts, bubbles, retention cohorts
  and heatmaps. Each was rewritten to the mark rules in section 5.
- Tooltips, empty and error states, CSV export, a reports page, reduced motion.
- The analytics assistant: a deterministic intent bank, matched by tokens, trigrams and
  keywords, that answers from the dashboard data. It is reworked as "Ask the data" (section 6).

**Changed or added**
- **Identity.** Noor: Marble surfaces, a Night Noor sidebar, Grove for residents, Fajr Blue
  for visitors, IBM Plex Sans Arabic / IBM Plex Sans, and the Naskh wordmark «روح المدينة» with
  its point of light.
- **Language.** Every string is written in both languages (`t(ar, en)`) instead of being
  translated afterwards. Charts mirror in Arabic. Numbers use Arabic digits in Arabic, and
  dates use the Gregorian calendar, with the Hijri date beside today's date.
- **Data.** A content snapshot exported from the app (`scripts/bi-content.mjs`). One
  simulated dataset that every dashboard sums from, so the figures agree everywhere.
- **Periods.** Last 7, 30 and 90 days, last 12 months, and Ramadan 1447 AH, compared with
  Ramadan 1446 AH.
- **Dashboards.** Twelve. New ones cover residents and visitors, the Market, City
  Opportunities, Visitor Centers, partners, commercial performance and the district map.
- **Charts.** New: stacked areas with season bands, a Sankey of journeys, a Voronoi district
  map, a calendar heatmap, a treemap, a waterfall, bullets, gauges, dot plots, a butterfly
  chart and small multiples. Every chart has a table view that can be exported as CSV.
- **Deep links.** `#/market?period=12m&area=quba&audience=visitor` opens a dashboard with its
  filters. Back and forward move between dashboards.
- **QA.** `scripts/bi-check.mjs` (section 7).

## 2. Running and deploying

```bash
npx serve bi                 # or any static server; open http://localhost:3000
npm run bi:content           # refresh bi/data/content.js after changing the app's content
npm run bi:check             # the QA suite (add --quick for a short run)
npm run bi:package           # release/RuhAlMadinah_BI_Vercel_DragDrop(.zip)
```

To deploy, upload the ZIP's folder at **vercel.com/new** (Framework Preset **Other**, empty
Build Command and Output Directory). Or create a Vercel project from the repository with
**Root Directory** `bi`. The app's own deployment is unchanged.

Demo account: `analyst@ruhalmadinah.demo`, password `demo`. Both are filled in on the
sign-in screen, and a wrong password is refused with a message.

## 3. The dashboards

| Dashboard | What it shows |
|---|---|
| **Executive overview** | <ul><li>Eight KPI tiles with sparklines and changes.</li><li>Daily active users (residents and visitors) with Madinah's seasons.</li><li>The user journey funnel.</li><li>A district map.</li><li>The most viewed categories.</li><li>Revenue by channel.</li><li>Visitor Center satisfaction.</li><li>A watchlist: offers ending in the next two weeks, activities nearly full, centres under the wait goal.</li><li>Written insights.</li></ul> |
| **Residents and visitors** | <ul><li>Both audiences over the period.</li><li>Twelve months of seasons (Ramadan, Eid, Hajj).</li><li>Age groups, gender and app language.</li><li>What each audience views.</li><li>Visitors' countries.</li><li>Visit length and party, using the app's sign-up options.</li><li>Residents' and visitors' interests, from the app's interest lists.</li><li>Where residents are active.</li></ul> |
| **Engagement and journeys** | <ul><li>People at each step.</li><li>A Sankey from entry point to part of the app to outcome.</li><li>Weekday × hour heatmap; in Ramadan, activity moves to the night.</li><li>Parts of the app.</li><li>Weekly retention cohorts.</li><li>Saves, plans and actions.</li><li>Top searches.</li><li>What people ask the app's Assistant, by its intent categories.</li><li>My Plan states, by the app's state names.</li></ul> |
| **Community** | <ul><li>Posts by audience.</li><li>Kinds of post, by the app's contribution types.</li><li>The most active of the app's communities, with their member counts.</li><li>Neighbourhood communities on the map.</li><li>The app's clubs.</li><li>Community families as small multiples.</li><li>Answers per question.</li></ul> |
| **Experiences and activities** | <ul><li>Interest against conversion (bubble).</li><li>A performance table with the app's prices and fill.</li><li>Actions by type.</li><li>A calendar heatmap.</li><li>How full activities are, from the app's places and sign-ups.</li><li>Actions by category.</li></ul> |
| **The Market** | <ul><li>Requests by kind (experiences, products, services).</li><li>Visit-to-request funnel.</li><li>A treemap of product request value at the app's demo prices.</li><li>Request status in «طلباتي».</li><li>The ten products.</li><li>Who requests what.</li><li>The most requested services.</li></ul> |
| **City Opportunities** | <ul><li>Details requests for the five homes, by audience.</li><li>Listing types.</li><li>Where people look for a home (area chips), with the areas that have a listing.</li><li>The Invest funnel.</li><li>Interest in the five opportunities, in the app's order.</li><li>Requests over the period.</li></ul>**No prices, amounts, returns, ratings or rankings.** |
| **Visitor Centers and service** | <ul><li>Visitors served.</li><li>Satisfaction and speed gauges.</li><li>Wait at each centre against the 10-minute goal.</li><li>Peak times.</li><li>Languages.</li><li>Enquiry topics.</li><li>Digital service levels.</li><li>Waiting against satisfaction.</li><li>The centres.</li></ul>The centres are illustrative. |
| **Partners and operators** | <ul><li>Partner performance.</li><li>Network growth over 12 months.</li><li>Plans.</li><li>Response time against acceptance.</li><li>Kinds of partner.</li><li>Offer performance for the app's 64 offers.</li></ul> |
| **Commercial performance** | <ul><li>Revenue by channel.</li><li>A waterfall from the previous period.</li><li>Channels against target.</li><li>Channel economics with the fee assumptions.</li><li>Revenue by area, category and audience.</li></ul> |
| **Districts and map** | <ul><li>The district map with seven measures (users, views, actions, growth, visitors' share, community posts, centre visitors), the app's must-see landmarks and the selected area's description from the app.</li><li>Areas compared, with trends.</li><li>What people view in each area (heatmap).</li><li>Residents and visitors by area.</li><li>Landmarks by page views.</li></ul> |
| **Reports** | <ul><li>Nine CSV reports with the current filters: daily figures, areas, categories, places and experiences, products, City Opportunities, communities, Visitor Centers and revenue.</li><li>Print, or save as PDF.</li></ul> |

**Filters.**
- Every filter recalculates every figure.
- A filter that has no meaning on a dashboard is greyed out and marked "Not used here": the
  category on City Opportunities and on Visitor Centers.
- The map always shows every area, highlights the chosen one, and selecting an area filters
  every dashboard.

## 4. The data

**Content (real, from the app).** `scripts/bi-content.mjs` bundles `RuhAlMadinah-app.jsx` and
reads its records through the app's own language layer, in Arabic and English, into
`bi/data/content.js`:
- 54 district records (the 15 home areas with their map positions and descriptions, the other
  districts, and "Madinah" for places located only in the city);
- 14 categories;
- 355 inventory records (204 real), with their type, category, area, action, price,
  popularity and capacity;
- 64 offers and their validity;
- 55 communities, 10 clubs and the contribution types;
- 10 products, 5 homes and 5 opportunities;
- 20 providers, the interest, stay and party options, the My Plan state names and the
  Assistant's intent categories.

`--check` fails when the snapshot no longer matches the app.

**Figures (simulated).** `bi/js/model.js` builds 730 days of daily facts ending on 27 October
2026, the demo's "today". That gives every period a previous period to compare with.

| Measure | Built from |
|---|---|
| Users, new users, sessions, searches, views, saves, plans, actions, completions | Day × (area, category) group × audience. Each group's weight comes from its records' attention weights (type, category and audience affinity, popularity, must-see status). |
| A record's views, actions and booking value | Its exact share of its group, so records always add up to their group |
| Market products | Day × product × audience; split by area with that day's users |
| City Opportunities | Day × home or opportunity × audience, and the area chips; no money |
| Community | Day × community × audience: posts, questions, answers, new members, helpful votes |
| Visitor Centers | Day × centre × audience: served, waits, service time, satisfaction, first-contact resolution, within 10 minutes, escalations. Waits grow with load, and satisfaction falls with waits. |
| Offers | Day × offer × audience, counted only while each offer runs (from 1 September 2026) |
| Revenue | Five channels (section below) |

**The calendar shapes everything:**
- Ramadan, with its last ten nights;
- Eid al-Fitr and Eid al-Adha;
- the Hajj season: visitors come before and after, and fewer during the Hajj days;
- summer school holidays;
- the weekend (Friday and Saturday) and Friday prayer;
- Madinah's weather for outdoor categories;
- National Day and Founding Day for events;
- growth over two years, and four campaign fortnights.

**Launch dates:**
- The Market's products start on 1 February 2026.
- City Opportunities starts on 1 May 2026.
- Offers start on 1 September 2026, the date the app gives them.

Before those dates the dashboards show "New" or an empty state, never invented history.

**Consistency.** Every number is a sum over the same facts:
- areas, categories, audiences, days and records add up to their totals;
- a filtered view equals the matching row of the unfiltered one;
- active users are residents plus visitors.

The same figure therefore agrees on every dashboard that shows it. For example, Market
requests on the overview and on the Market, or revenue on the overview and on Commercial
performance.

Active users over a window are user-days divided by how often a person is active in a window
of that length. A resident comes back often; a visitor's stay lasts days.

**Honesty rules**
- City Opportunities shows interest only: no prices, amounts, returns, ratings or rankings,
  and opportunities in the app's order. "Ask the data" refuses figures on returns.
- Real places get views, saves and plans: they are app activity. They never get booking
  value, ratings or a partner role. Public institutions are not partners.
- Partners are the app's illustrative providers, and the illustrative venues that carry its
  offers.
- The Visitor Centers are illustrative. The app runs none, and the dashboard says so.
- Revenue channels and their fees:

  | Channel | Fee |
  |---|---|
  | Experience bookings | 12% commission |
  | Market products | 10% |
  | Service requests | SAR 12 each |
  | Offers | SAR 3 per redemption, plus SAR 20 a day per exclusive offer |
  | Partner plans | SAR 299 and SAR 799 a month |

  All are demo assumptions, listed on the page.
- Demographics (age, gender, countries, languages) and the targets are simulated and
  labelled.

## 5. Charts and design

- **Palette.** A categorical palette in the Noor family, validated for colour-vision
  deficiency and normal-vision separation on white:
  - Grove `#00836A` (residents) and Fajr `#2D5EC8` (visitors);
  - clay, Madani rose, lamp gold, violet, olive and plum.
- **Ramps.**
  - Sequential: one hue, Grove for magnitude and Fajr for the second context.
  - Diverging: rose ↔ grey ↔ blue, for growth.
  - Status colours appear only with an icon and a label.
- **Marks.**
  - Bars are 14 px or less, with rounded ends.
  - Lines are 2 px.
  - A 2 px surface gap separates touching marks.
  - Grids and axes are hairlines.
  - Values are written in text colours, never in the series colour.
  - A legend appears whenever there are two or more series.
  - Labels are placed selectively: a map label appears only where it fits, and bubble labels
    never collide.
- **Direction.** Time and value axes run right to left in Arabic. The map is geographic and
  never mirrors.
- **The district map.** It draws the Voronoi cells of the 15 home areas, at their app
  positions, inside the city's outline. Every other district joins its nearest area, and the
  dashboards aggregate it the same way. It is labelled as schematic.
- **Interaction.**
  - Hover and keyboard focus show the same tooltip.
  - A crosshair runs on time charts.
  - Every panel switches to a table, and exports it as CSV with a UTF-8 mark.
  - Changes dim the page briefly, without a skeleton flash.
- **Layout.**
  - Three columns, then two below 1280 px.
  - One column on phones, where the menu becomes a drawer.
  - Charts switch to a compact canvas below 760 px, so their text stays readable.

## 6. Ask the data

The «اسأل البيانات» drawer answers questions about the dashboards in Arabic or English, in
the language of the question:
- **The bank.** `bi/agent/ask-bank.js` holds 34 intents with examples, keywords and aliases
  for areas, categories, audiences and periods.
- **Matching.** `bi/agent/ask-runtime.js` normalises the question, as the app's Assistant does
  (diacritics, hamza, ى/ي, ة/ه, Arabic digits). It scores the intents and answers from the
  same model with the current filters. Anything the question names (an area, a period)
  narrows only that answer.
- **Answers.**
  - Every answer has a button that opens the matching dashboard with those filters.
  - An unrelated question gets suggestions, not an invented answer.
  - Questions about returns on investment get no figures.
- **Privacy.** No language model or external service is used, and no question leaves the
  browser.

## 7. QA

`node scripts/bi-check.mjs` (about 10 minutes; `--quick` takes about one) checks:

**The model**, for every period × 4 areas × 4 categories × 3 audiences:
- every breakdown adds up to its total;
- every slice equals its row;
- revenue and products add up by area, and community posts and centres add up;
- two loads give identical figures;
- City Opportunities has no money fields;
- no history appears before a launch date;
- no real place or public institution earns money or is a partner;
- the content snapshot matches the app.

**The entry**, in both languages:
- welcome, language and direction;
- a wrong password is refused;
- the demo account signs in;
- the session and language survive a reload;
- sign-out returns to sign-in.

**Every dashboard**, in Arabic and English, under all five periods and eight more filter
combinations:
- no console errors, NaN or undefined;
- no error state or empty panel;
- no horizontal overflow;
- only the page's language on screen;
- demo labels on Visitor Centers and Commercial performance;
- no money on City Opportunities.

**Consistency across dashboards:**
- active users = residents + visitors;
- Market requests, revenue and community posts agree between dashboards;
- Ask the data gives the overview's figure.

**Interactions:**
- filters and their links, reset, map selection, deep links, history;
- table view and CSV, including a report with one row per day;
- empty states (City Opportunities before it opened, an area without a centre);
- Ask the data (lists, links, language, no investment figures, the fallback);
- keyboard tooltips.

**Viewports.** 360, 390, 768, 1024, 1280, 1440 and 1920 px, in both languages:
- every dashboard fits;
- the menu drawer opens and closes.

## 8. Limits

- Every figure is simulated. Nothing is connected to analytics, payments or operations.
- The map is schematic and not to scale.
- Demographics, targets, fees and Visitor Center operations are assumptions for the demo.
- Ask the data matches questions; it does not reason. Unusual phrasing gets suggestions.
