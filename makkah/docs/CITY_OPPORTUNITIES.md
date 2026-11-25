# «فرص مكة» — Makkah Opportunities

Two experiences opened from Home, for residents and visitors alike:

| Section | Arabic | What it is |
|---|---|---|
| Live in Makkah | «عِش في مكة» | Homes to rent, homes to own, and extended stays — browse, filter, open a home, register interest or request details |
| Invest in Makkah | «استثمر في مكة» | An introductory directory of commercial, tourism & hospitality, retail & services, and development & partnership opportunities — browse, filter, open a profile, register interest or request more information |

Both feed «طلباتي» / My requests, which tracks what the person recorded.

The feature follows the City Opportunities functionality of Ruh Al Madinah (same cards, detail
pages, filters, request sheet and request store), adapted to Rihab Makkah: Makkah areas and content,
Rihab Makkah's tokens and persona themes, and a few additions the brief asked for (an attribute
filter, a location filter for opportunities, a second action on every detail page, and request
filters in My requests). The Ruh Al Madinah repository was read, not changed.

## What the app says, and what it does

- The homes and opportunities are content prepared for the app, placed at general locations,
  not live listings. Since the final copy cleanup (Phase 3) the screens carry no "demo" or
  "example" labels; they describe each item plainly.
- No home shows a price. No opportunity shows an amount, a return, a guarantee, a rating, a ranking
  or an owner.
- Rihab Makkah is not a property broker, an investment company, a financial adviser or a broker, and
  says so on the home pages, the Invest listing, every opportunity page and in the Assistant. A
  question about returns gets no figures and no advice.
- A request is a record on this device, in «طلباتي». The app tells the person it is saved there and
  can be edited or withdrawn; it never says a request was sent, because nothing is sent to an
  owner, broker, investor or authority. There are no payments, bookings, government integrations
  or brokerage.

## Where it is

| Entry | Route (`view.s`) |
|---|---|
| Home → «فرص مكة» section with two cards (resident: after "This week in Makkah"; visitor: after "Build your trip") | `city` with `tab: "live"` or `"invest"` |
| A home | `estate` (`id`: `HOM-01` … `HOM-07`) |
| An opportunity | `opp` (`id`: `OPP-01` … `OPP-07`) |
| «طلباتي» — from the Makkah Opportunities header, the request sheet, Profile (a "My requests" count) and the Assistant | `requests` |

The four bottom tabs are unchanged. The listing and My requests keep the bottom navigation; the
two detail pages hide it, like a place page, and end with their actions.

## Data (`RihabMakkah-app.jsx`, section "MAKKAH OPPORTUNITIES")

Homes — `HOMES`, 7 records, `HOME_DEALS` (rent · own · extended stay), `HOME_ATTRS` (furnished ·
family-sized (3+ rooms) · close to the Haram · parking):

| Id | Kind | Area | Offered |
|---|---|---|---|
| HOM-01 | Family apartment, 3 rooms, 150 m² | Al-Awali | For rent — annual contract |
| HOM-02 | Furnished apartment, 2 rooms, 115 m² | Al-Shawqiyah | For rent — annual or six-month |
| HOM-03 | Villa, 5 rooms, 380 m² | Al-Sharaie | To own |
| HOM-04 | Apartment, 4 rooms, 175 m² | Al-Naseem | To own |
| HOM-05 | Furnished apartment, 2 rooms, 80 m², close to the Haram | Al-Misfalah | Extended stay — one to six months |
| HOM-06 | Studio, 40 m² | Al-Aziziyah | Extended stay — monthly |
| HOM-07 | Serviced apartment, 55 m², near the Haramain station | Al-Rusayfah | Extended stay — monthly |

Each home has rooms, bathrooms, size, floor, furnishing, terms, who it suits, three features and a
description, in Arabic and English. A visitor sees extended stays first.

Opportunities — `OPPORTUNITIES`, 7 records, `OPP_CATS`:

| Id | Category | Opportunity | General location |
|---|---|---|---|
| OPP-01 | Tourism & hospitality | Running serviced apartments for Umrah visitors | Central Area, south of the Haram |
| OPP-02 | Tourism & hospitality | Guided visitor experiences around historic landmarks | East Makkah — Jabal al-Nour |
| OPP-03 | Commercial | Commercial units on a main street | Al-Aziziyah |
| OPP-04 | Retail & services | A café and bakery in a residential area | Al-Awali |
| OPP-05 | Retail & services | A dates and gifts shop for visitors | Al-Misfalah |
| OPP-06 | Development & partnerships | A partnership in a residential development | Al-Sharaie |
| OPP-07 | Development & partnerships | A partnership for visitor and luggage transport | Al-Rusayfah, near the Haramain station |

Each opportunity has a description, a profile (category, location, kind of involvement, who it
suits, stage: "an introductory idea") and three points, including the licences or permits it would
need where that applies.

Photos: eight generic Open Images photographs (CC BY 2.0) and five existing library photos at city
level; see "Makkah Opportunities" in `PHOTO_SOURCES.md`.

## Interest registration and request tracking

1. A detail page ends with two actions: «سجّل اهتمامك» / Register interest, and «اطلب التفاصيل» /
   Request details (a home) or «اطلب معلومات إضافية» / Request more information (an opportunity).
   An opportunity card also has Register interest.
2. The request sheet names the item, lets the person switch between the two purposes, takes an
   optional note (up to 300 characters), and says before and after that the record stays on the
   device.
3. Submitting dispatches `request_add`. The reducer keeps **one record per item**
   `{ id, kind: "home" | "opp", ref, purpose: "interest" | "info", note, at, first }` in
   `state.requests`; doing it again updates that record in place (`at` changes, `first` stays).
   `request_remove` withdraws it. Both are logged like every other action.
4. `RequestStore` saves the list per account in `localStorage` under
   `rihab.requests.v1.<uid>`, the same way `PlanStore` keeps My Plan
   (`rihab.plan.v1.<uid>`), and apart from it. It is restored at sign-in, survives a reload and
   sign-out, and is deleted with the account.
5. «طلباتي» lists the records newest first, filtered by All · Homes · Business opportunities. Each
   row shows the kind, the purpose, the status ("Recorded on this device" and when it was recorded
   or updated), the note, a link back to the item, and Withdraw. Cards and detail pages show
   "Interest registered" / "Request recorded" once an item has a record.

## The Assistant

Three intents in `assets/agent/rihab_makkah_app_agent_bank_03_actions_business.json` (category
`opportunities`, handler `city_answer`, part version 1.1.0): `city_housing`, `city_invest`,
`city_my_requests`. `cityAsk()` decides whether a request is about Makkah Opportunities at all, so
the intents never take a lookalike sentence: a hotel or a place to stay tonight stays a stay
search, and renting a car is not housing. Answers name the matching items, link to
the right tab or to My requests, and never give figures for an opportunity.

## Tests

`node scripts/opportunities-check.mjs` — both personas, Arabic and English, accounts created
through the real sign-up screens: Home placement and the unchanged tabs, all filters and their
combinations, the empty state, detail pages, no demo or sample wording, no prices or financial figures, both
request purposes, editing in place, My requests filters, persistence across a reload, Profile,
withdrawal, the Assistant's answers and links, and fully English screens in English.

`scripts/mobile-audit.mjs`, `scripts/ui-audit.mjs`, `scripts/i18n-scan.mjs` and
`scripts/consumer-copy-check.mjs` also walk the new screens.

## Limitations

- Prepared content only: no real listings, prices, availability, owners or offers, and nothing leaves
  the device. A real version would need verified inventory, a back end for requests with real
  statuses (received, contacted, closed), and the legal review that brokerage and investment
  promotion require.
- Requests live in the browser's storage, like My Plan: another device or a cleared browser does
  not have them.
- Status is "recorded on this device"; there is no later status because nobody receives the request.
