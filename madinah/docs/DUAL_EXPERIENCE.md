# One app, two experiences — resident and visitor

Rihab Madinah has one app, one set of tabs (الرئيسية · اكتشف · السوق · المجتمع · خطتي) and one shared
system for Save, Plan, Join, booking hand-off, Community and the Assistant. What changes
between a **ساكن في المدينة** (resident) and a **زائر** (visitor) is the information
architecture, ranking, copy and theme. These all come from one persona layer in
`RihabMadinah-app.jsx`:
- `personaOf`, `INTERESTS`, `STAY_OPTS`, `PARTY_OPTS`, `MUST_DO` and `PERSONA_WEIGHT`;
- `PERSONA_THEME` and `applyTheme`.

## Chosen once

Entry is shared: Start → Language → Sign in / Create account → Profile setup. The
experience is picked in profile setup and **cannot be changed afterwards**:
- Edit details shows it as a locked row.
- `ProfileStore.save` keeps the stored value.
- The state reducer drops any later change.
- The Assistant explains that the account type is fixed.

There is no toggle or switch. Someone who wants the other experience creates a second
account.

| Onboarding | Resident | Visitor |
|---|---|---|
| Area | Required (Madinah neighbourhood) | Not asked. It can be added later in Edit details, and Home offers area chips under «قريب منك الآن». |
| Interests | At least one: food, family, events, sport, hobbies, culture, community, volunteering, markets | At least one: culture, heritage, food, markets, nature, family, experiences, walking, learning |
| Visit length | — | Today only / 1–2 days / 3–5 days / longer |
| With | — | Solo / couple / family / family with children / group |

## Screens

| | Resident — local life | Visitor — trip companion |
|---|---|---|
| Home | 1. Hero<br>2. وش الجديد حولك؟<br>3. في حيّك<br>4. هذا الأسبوع في المدينة<br>5. مطاعم ومقاهٍ تستحق التجربة<br>6. مجتمعك<br>7. أنشطة وهوايات<br>8. مبادرات وتطوع<br>9. خدمات للحياة اليومية<br><br>Time chips: today, this week, weekend, new, my area. | 1. Hero with the visit context (length, party, interests) and «كم معك وقت الآن؟»<br>2. اكتشف المدينة حسب اهتماماتك<br>3. لا تفوّت في المدينة<br>4. تجارب مناسبة لك<br>5. ماذا تفعل اليوم؟<br>6. مطاعم ومقاهٍ<br>7. ثقافة وتاريخ المدينة<br>8. قريب منك الآن<br>9. ابنِ رحلتك<br>10. خدمات يحتاجها الزائر<br>11. نصائح من مجتمع المدينة |
| Discover | Area chips first, then time-led chips (today, this week, weekend, new). Editorial sections on local life. | Interest, time and party chips, led by short, family-friendly and free. Editorial sections on essentials and things to do today. |
| Community | Participation: neighbourhood community card (join / ask neighbours), «توصيات من حيّك» and an initiatives rail. | Guidance: an «اسأل أهل المدينة» card, visitor questions, «نصائح عملية من سكان المدينة». Activity prompts are hidden. |
| My Plan | «خطتي» with a week strip: this week, activities you joined, your communities. | «رحلتي في المدينة»: now, day-by-day groups («يوم 1 — …»), what's next, an undated suggested order, after the trip, saved, completed. This is grouping only; item states don't change. |
| Assistant | Local-life companion: «نهاية الأسبوع», «وش فيه في حيّي؟», neighbourhood follow-ups. | Trip companion: «رتّب يومي», half-day and one-day plans, «ضف الأول لخطتي». |
| Starter plan | Something to take part in, food, the person's own interest, getting out. | A «لا تفوّت» pick, food, the visitor's first two interests (ranked from the Prophet's Mosque when no area is set). |

«لا تفوّت» is an editorial selection of real landmarks, museums and heritage sites. It is
not a popularity ranking, and nothing on a real place gains invented ratings, hours,
prices, offers or distances.

## Theme

The identity is Direction A «نور» *Noor* (the light of al-Munawwarah). Shared tokens:
- Marble `#F5F5F2` (surface), Card `#FFFFFF`, Stone `#ECEBE6`, Line `#DEDCD5`
- Basalt Ink `#1B2027` (text), Slate `#5A6370` (secondary text)
- Madani Rose `#B03D5C` (saves, live and unread moments), Lamp Amber `#8A5A12` (warm accent as text)
- IBM Plex Sans Arabic / IBM Plex Sans for the interface; Noto Naskh Arabic for the provisional wordmark

| Token | Resident «نهار المدينة» Daylight | Visitor «مساء المدينة» Evening light |
|---|---|---|
| accent-primary | `#1E6A60` Grove | `#24548A` Fajr Blue |
| accent-secondary | `#9FCDC2` soft grove | `#F3D79E` Canopy Light |
| accent-deep | `#154C45` | `#172A46` Night Noor |
| on-accent | `#FFFFFF` | `#FFFFFF` |
| hero | light `#E4F1EC → #F5F5F2`, Basalt text | night `#172A46 → #24406A` with a Canopy glow, Marble text |

Every pair meets WCAG AA (the identity research's contrast table). The pre-sign-in screens (splash, language, sign in,
create account, profile setup) keep the brand theme: Night Noor with a soft Canopy Light glow and the typographic
wordmark «رحاب المدينة» with its point of light — a provisional wordmark, not a logo, using no official mark. The root carries `data-persona` and the CSS
variables (`--accent-primary`, `--accent-secondary`, `--accent-deep`, `--on-accent`,
`--accent-text`, `--surface-base`, `--text-primary`, `--border-soft`). Colour is never the
only difference: titles, modules, copy and icons also differ.

## Demo accounts

These on-device accounts are present on every launch, including after storage is cleared.
Sign-up rules are unchanged. See `docs/ACCOUNTS.md` at the Rihab repository root.

- `resident@rihab.app`: أمل الحربي, Al-Awali, family.
- `visitor@rihab.app`: يوسف الأنصاري, no area, 3–5 days with children.

## QA

`scripts/persona-check.mjs` covers both personas, in Arabic and English, at 360 and 390 px:
- the Home order and modules for each persona;
- Discover, Community and My Plan;
- the Assistant;
- the theme;
- the persona lock and its persistence;
- demo sign-in after clearing storage;
- visitor sign-up without an area;
- that no fabricated facts appear on real venues.

`scripts/audit-fixes-check.mjs` covers the interface rules in `docs/PRODUCT_RULES.md` for
both personas in the same four combinations.
