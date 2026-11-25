# Rihab Madinah — product rules

These rules shape every screen and the Assistant. The QA scripts enforce most of them, and
`scripts/audit-fixes-check.mjs` covers the interface corrections listed below.

## States that never collapse

> حفظ ≠ أضف إلى خطتي ≠ انضم ≠ سأحضر ≠ حجز ≠ مؤكد ≠ حضرت
> Save ≠ Add to My Plan ≠ Join ≠ Going ≠ Booking ≠ Confirmed ≠ Attended

The path is **Interested → Save → Join/Going → Register/Book → Add to My Plan → Active →
Complete → Contribute → What next**. Some objects skip steps, but the states stay distinct.

**Booking hand-off.** When the app sends someone to another service:
- it records the hand-off and shows «انتقلت لإكمال الحجز» / "Continued to booking";
- nothing becomes «مؤكد» / Confirmed automatically;
- «تم الحجز» appears only after a real confirmation, or when the person confirms it themselves.

## Content and trust

- **Facts carry their source.** Source claims work at field level: a provider update never
  silently overrides an official fact. Community evidence can refresh context, but keeps its
  provenance.
- **Opinions stay opinions.** Community posts are never presented as official facts.
- **Freshness.** Every fact has a freshness class (deterministic, live, short-lived, routine,
  stable). Expired offers and events, and paused groups, are never promoted as active.
- **Real places stay honest.** They show only what their sources state: no invented hours,
  prices, ratings or offers. Offers live only on illustrative records.
- **Demo commerce says so.** Market products, homes and business opportunities carry
  «مثال توضيحي» / *Demo example*, and every request is recorded on the device only.
- **No live claims.** Nothing claims live crowding, availability or booking status without a
  real source. The Assistant says so plainly.

## Context and privacy

- **Minimal context.** The app uses only explicit context (persona, area, party, time,
  interests) and useful behaviour (saved, planned, completed). It works without a precise
  location.
- **Nothing sensitive.** It never infers health, religion, nationality, identity or other
  sensitive traits from behaviour. One dismissal is never a permanent dislike.
- **No tracking of people.** It never exposes anyone's location or attendance, and never
  builds nearby-user discovery or stranger matching.

## Information order

- **Home precedence:** an active journey → safety/official → time-critical → nearby → community
  → personal discovery → offers → inspiration → participation.
- **Decision page order:** what it is and why it appeals → why it fits you → practical facts
  → what the community has lived → where the information comes from → the action → what next.

## Interface quality

These were corrected once and are now checked on every run:

- **Rails** start at the reading edge in RTL. Their fades match the peek, and nothing is cut
  at the screen edge.
- **Form-like choices** (areas, interests) wrap instead of scrolling.
- **Card titles** are never clamped. Narrow tiles get three lines of metadata.
- **Sheets and modals** stay inside the phone frame and above the navigation.
- **Fixed bars** never cover content, and toasts don't linger onto later screens.
- **Touch targets** are at least 44 px.
- **English (LTR)** is complete: bilingual search, translated composed names, mirrored
  chevrons, and text fields that follow the typed direction.
- **Content imagery** is photographic or a drawn category tile. It never shows an
  illustration posing as a photograph. The rules for each image are in `PHOTO_SOURCES.md`.

## Do not

- Turn the app into a government portal or an institutional dashboard.
- Add a separate AI tab or a floating bubble; the Assistant lives in one conversation screen.
- Put homes or business opportunities in the Market or in a tab of their own; they live in
  «فرص المدينة» on Home.
- Show a price for a demo home, or any amount, return, projection, rating, ranking or
  recommendation for a business opportunity; say a request was sent when it was only recorded
  on the device; or use the term حقوق الانتفاع.
- Use generic "Verified" badges without provenance.
- Present a generic stock image as a specific real restaurant, event or person.
- Use Makkah imagery, or repeated generic religious imagery, as a content strategy.
- Use an official mark, or imply affiliation with any authority. The name and wordmark are
  provisional.
- Homogenise community Arabic into one voice.
