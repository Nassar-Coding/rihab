# One app, two experiences — resident and visitor

Rihab Makkah has one app, one set of tabs (الرئيسية · اكتشف · المجتمع · خطتي) and one shared
system for Save, Plan, Join, booking hand-off, Community and the Assistant. What changes
between a **ساكن في مكة** (resident) and a **زائر** (visitor) is the information
architecture, ranking, copy and theme. These all come from one persona layer in
`RihabMakkah-app.jsx`:
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
| Area | Required (Makkah neighbourhood) | Not asked. It can be added later in Edit details, and Home offers area chips under «قريب منك الآن». |
| Interests | At least one: food, family, events, sport, hobbies, culture, community, volunteering, markets | At least one: culture, heritage, food, markets, nature, family, experiences, walking, learning |
| Visit length | — | Today only / 1–2 days / 3–5 days / longer |
| With | — | Solo / couple / family / family with children / group |

## Screens

| | Resident — local life | Visitor — trip companion |
|---|---|---|
| Home | 1. Hero<br>2. وش الجديد حولك؟<br>3. في حيّك<br>4. هذا الأسبوع في مكة<br>5. مطاعم ومقاهٍ تستحق التجربة<br>6. مجتمعك<br>7. أنشطة وهوايات<br>8. مبادرات وتطوع<br>9. خدمات للحياة اليومية<br><br>Time chips: today, this week, weekend, new, my area. | 1. Hero with the visit context (length, party, interests) and «كم معك وقت الآن؟»<br>2. اكتشف مكة حسب اهتماماتك<br>3. لا تفوّت في مكة<br>4. تجارب مناسبة لك<br>5. ماذا تفعل اليوم؟<br>6. مطاعم ومقاهٍ<br>7. ثقافة وتاريخ مكة<br>8. قريب منك الآن<br>9. ابنِ رحلتك<br>10. خدمات يحتاجها الزائر<br>11. نصائح من مجتمع مكة |
| Discover | Area chips first, then time-led chips (today, this week, weekend, new). Editorial sections on local life. | Interest, time and party chips, led by short, family-friendly and free. Editorial sections on essentials and things to do today. |
| Community | Participation: neighbourhood community card (join / ask neighbours), «توصيات من حيّك» and an initiatives rail. | Guidance: an «اسأل أهل مكة» card, visitor questions, «نصائح عملية من سكان مكة». Activity prompts are hidden. |
| My Plan | «خطتي» with a week strip: this week, activities you joined, your communities. | «رحلتي في مكة»: now, day-by-day groups («يوم 1 — …»), what's next, an undated suggested order, after the trip, saved, completed. This is grouping only; item states don't change. |
| Assistant | Local-life companion: «نهاية الأسبوع», «وش فيه في حيّي؟», neighbourhood follow-ups. | Trip companion: «رتّب يومي», half-day and one-day plans, «ضف الأول لخطتي». |
| Starter plan | Something to take part in, food, the person's own interest, getting out. | A «لا تفوّت» pick, food, the visitor's first two interests (ranked from the Haram when no area is set). |

«لا تفوّت» is an editorial selection of real landmarks, museums and heritage sites. It is
not a popularity ranking, and nothing on a real place gains invented ratings, hours,
prices, offers or distances.

## Theme

Shared tokens:
- Ivory `#F9F6EC` (surface)
- Ink `#1F2321` (text)
- Soft Stone `#E8E2D6` (borders)

| Token | Resident | Visitor |
|---|---|---|
| accent-primary | `#315C49` palm green | `#B8893D` brass |
| accent-secondary | `#8FA58F` sage | `#B96F52` terracotta |
| accent-deep | `#244638` | `#D8C49A` sand, used as the hero ground; the deep text shade is `#8A6326` |
| on-accent | Ivory `#F6EFE0` | Ink `#1F2321` |

Some shades are derived for AA contrast:
- resident secondary text `#56705A`;
- visitor accent text `#8A6326`;
- visitor terracotta text `#A25A3F`.

The pre-sign-in screens keep the brand theme. The root carries `data-persona` and the CSS
variables (`--accent-primary`, `--accent-secondary`, `--accent-deep`, `--on-accent`,
`--accent-text`, `--surface-base`, `--text-primary`, `--border-soft`). Colour is never the
only difference: titles, modules, copy and icons also differ.

## Demo accounts

These on-device accounts are present on every launch, including after storage is cleared.
Sign-up rules are unchanged. See `docs/ACCOUNTS.md`.

- `resident@rihab.app` / `demo`: أمل الحربي, Al-Awali, family.
- `visitor@rihab.app` / `demo`: يوسف الأنصاري, no area, 3–5 days with children.
- `admin@admin.com` / `admin`: review account, a resident.

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

`scripts/audit-fixes-check.mjs` covers the audit corrections for both personas in the same
four combinations.
