# The Market and City Opportunities

Two additions make what Madinah offers easy to obtain, and keep living and doing business here
in a place of their own:

- **«السوق» / Market**: the middle tab of five. It gathers experiences, services and local
  products that a person can book or request.
- **«فرص المدينة» / City Opportunities**: a section on Home with two doors.
  - «عِش في المدينة» / *Live in Madinah* is about homes.
  - «استثمر في المدينة» / *Invest in Madinah* is about business opportunities.

  Neither is a tab, and neither sits inside the Market.

This is a **demo, not a live marketplace or investment platform**:
- There are no payments, no checkout, no provider or seller integrations and no backend.
- Everything a person requests is recorded on their device in «طلباتي» / *My requests*.
- The app says so before and after every request.

## 1. The Market

**Tabs.** الرئيسية · اكتشف · **السوق** · المجتمع · خطتي. Discover stays for exploring; the
Market is for what you can request or obtain.

The Market has three categories, each with its own filter chips.

| Category | Content | How it is obtained |
|---|---|---|
| **التجارب / Experiences** | Tours, workshops, local experiences, activities and events. These are the **same inventory objects** Discover shows, filtered to illustrative experiences that are running. | Each object's own decision page and action (join, book, register). States stay those of My Plan. |
| **الخدمات / Services** | The inventory's illustrative services, plus the illustrative stays and the hosted visit to a Madani family (ACT-002), under the hospitality filter. No new service records were needed. Real places are not listed: they can't be requested. | The decision page's action is **«اطلب الخدمة» / Request this service**, which opens the request sheet. Stays and the hosted visit keep their booking hand-off. |
| **المنتجات / Products** | 10 illustrative products: Ajwa dates, a dates gift box, seasonal fresh dates, oud and perfumes, prayer beads, a lantern, a Sadu weaving, pottery bowls, Arabic coffee and a landmarks book. Filters: dates, gifts and souvenirs, handicrafts, perfumes. | The product page shows a **demo price** (marked «سعر للعرض التجريبي» / *Demo price*), details and **«اطلب المنتج» / Request this product**, with a quantity and an optional note. |

Every product card and page carries the label **«مثال توضيحي» / Demo example**.

## 2. City Opportunities (Home)

The Home section «فرص المدينة» has two cards: Grove green for living, Night Noor for business.

| Experience | Where the section sits | Card text |
|---|---|---|
| Resident | After «هذا الأسبوع في المدينة» | Homes to rent and buy, and furnished homes |
| Visitor | After «ابنِ رحلتك» | Furnished homes and longer stays first |

### عِش في المدينة / Live in Madinah

Five demo homes, each with a photo, type, area, rooms, bathrooms, size, floor, furnishing,
features and a description of its neighbourhood:

1. Apartment for rent in Al-Awali
2. Apartment for sale in Al-Aziziyah
3. Family villa for sale in Al-Hijrah
4. Furnished apartment near Quba
5. Furnished studio for a longer stay in Qurban

**Filters.**
- By type: for rent, for sale, furnished and longer stays.
- By neighbourhood. The chosen area shows its own description and a link to explore it in
  Discover.

**Action.** «اطلب التفاصيل» / *Request details*.

**No prices.** No home shows a price, and no home is presented as really on offer.

### استثمر في المدينة / Invest in Madinah

An **informational directory**. It holds five demo opportunities, each with a title, category,
general location, description, what the opportunity involves and a photo:
- hospitality development;
- commercial units;
- running a café;
- residential development;
- palm-farm visitor experiences.

**Actions.** «استكشف الفرصة» / *Explore opportunity* opens the page, and «سجّل اهتمامك» /
*Register interest* records interest.

**What is never shown:**
- amounts or projections;
- profits, returns or ROI;
- feasibility or risk ratings;
- recommendations or rankings;
- guaranteed outcomes;
- an owner or partner who isn't genuinely identified (none is shown);
- the term حقوق الانتفاع (usufruct).

Every screen says Rihab Madinah is not an investment company, financial adviser or broker.

## 3. Requests — «طلباتي» / My requests

**Kinds of request:**
- a product request;
- a service request;
- a home details request;
- interest in an opportunity.

**What is stored.** One record per item (requesting it again updates it): kind, item,
quantity (products only), optional note and time. The records are kept per account in
`rihab.requests.v1.<uid>`, apart from My Plan. They survive sign-out and sign-in and
are deleted with the account.

**Wording.** The sheet, the confirmation and «طلباتي» all say the request is saved on this
device only and is **not sent** to any seller, provider or organisation. The app never says a
request was sent.

**Status.** Each item shows «طلبك مسجّل» / *Request recorded* (or «اهتمامك مسجّل» / *Interest
registered*). A request can be edited or withdrawn.

**Where to find it.** «طلباتي» opens from the Market header and from Profile.

## 4. The Assistant

The deterministic Intent Bank gained six intents (bank part 03, category `market`), answered by
one handler and routed by what the request is about:

| Intent | Example | Answer |
|---|---|---|
| `market_overview` | «وش في السوق؟», "open the market" | The three categories, with buttons to each |
| `market_products` | «أبغى أشتري تمر عجوة», "souvenirs to take home" | The matching products as cards, and a button to Market products |
| `market_services` | "how do I request a service" | Services as cards, and how to request one |
| `city_housing` | «أبغى شقة للإيجار في العوالي», "a villa for sale" | The matching demo homes (by type and area), no prices, and a button to Live in Madinah |
| `city_invest` | «فرص استثمارية في المدينة», "what's the return on investment" | The matching opportunities. It never gives figures or advice, and says so when asked about returns. A button opens Invest in Madinah |
| `market_my_requests` | «وش طلباتي؟» | The recorded requests and a button to «طلباتي» |

A hotel or a stay is still answered as a stay, and offers on apartments are still offers.
`scripts/assistant-check.mjs` covers all of these in 19 conversations.

## 5. Implementation notes

- **Where the code is.** The data and screens are in one section of `RihabMadinah-app.jsx`
  (*MARKET & CITY OPPORTUNITIES*), built from the existing components: `Photo`, `RowCard`,
  `Chip`, `Pill`, `Sheet`, `FactRow` and the decision-page layout.
- **Language.** Text is bilingual through `[ar, en]` pairs and `tx`, so Arabic RTL and
  English LTR work everywhere.
- **Images.** The 13 new images are in the photo library: Open Images, CC BY 2.0, listed in
  `PHOTO_SOURCES.md`. Products also reuse existing library photos (dates, lantern, Sadu, pottery,
  coffee, books).
- **Tests.**
  - `scripts/market-check.mjs` covers every journey, both experiences, Arabic and English, the
    honesty rules, persistence and the Assistant links.
  - `scripts/ui-audit.mjs`, `mobile-audit.mjs`, `i18n-scan.mjs` and `consumer-copy-check.mjs`
    also walk the new screens. The copy check skips the elements marked `data-demo`, which are
    the required demo disclosures.
