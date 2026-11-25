# Real Makkah places

EyeMakkah lists **178 real places in Makkah**: 13 landmarks, museums and sites that were already in the app (now trimmed to what sources state), and **165 venues** added on 4 October 2026 — restaurants, cafés, bakeries and sweets, bookstores, malls, markets, supermarkets, parks, walkways, museums and historic sites.

This file lists every one of them with the sources that place it and its photo status.

## What the app says about a real place — and what it doesn't

| Shown | Not shown (not verified) |
|---|---|
| Name and branch, the district the sources give, what kind of place it is, a one-line description from the sources, the source links and the date they were checked, a link to look the place up in Maps | Opening hours, prices, ratings, reviews, offers or discounts, availability, booking status, popularity, live distance claims |

- Real places never carry an illustrative offer. The five sample offers that were attached to real places (Clock Tower Museum family ticket, Revelation Exhibition, Ala Khutah, Al-Otaibiyah market, the bus tour) were removed. The sample "hours conflict" and the booking walkthrough now use fictional sample listings.
- Sample community posts that described real places (Hira District Q&A, a Revelation Exhibition review, Wadi Al-Asilah and Al-Otaibiyah tips) were removed. Sample events that named a real organiser (Umm Al-Qura University, Makkah Library, Hira District) no longer name one.
- Sources, confidence and the check date stay in each record (`src`, `conf`) and in this file. The app shows none of them: a place page carries the place, not an account of how it was researched.
- Unknown details (hours, prices, ratings, offers) are simply not shown. Asked directly, the Assistant says it doesn't have them and suggests asking the place. It does not guess.

## Confidence

- **h** (96 venues): the brand's own account or locator, an official page, or two independent listings agree on the name and district.
- **m** (69 venues): one public listing (a map listing, directory or delivery listing with an address). The app tells the reader to check the branch first.
- **Landmarks** (13): government, official-tourism or encyclopaedia sources.
- **Dropped:** 75 candidate records were left out — low confidence, duplicates, Hajj-rite sites, places outside the city or a district that could not be placed, and branches whose operation was in doubt. They are listed at the end.

All sources were found through web search on 4 October 2026. The research environment could not open the pages themselves (network policy), so a record rests on the search result's title, URL and summary. Re-open the sources before any public launch.

## Districts and areas

The 15 areas people choose from (العوالي، العزيزية، الششة، الشوقية، النسيم، بطحاء قريش، المسفلة، أجياد، الهجرة، الزاهر، الكعكية، جرول، الرصيفة، التنعيم، محيط الحرم) are unchanged. Three area descriptions were corrected to match their real location:
- **الهجرة** is in the south, beside Jabal Thawr; it had been described as north-east.
- **الرصيفة**, where the Haramain station is, is in the west; it had been described as north-east.
- **الششة** neighbours Al-Aziziyah; it had been described as northern.

Places in other districts are labelled with their own district instead of borrowing an area's name. Those districts are: جبل النور، العدل، الشرائع، العتيبية، الحجون، الغزة، المعابدة، حي الجامعة، النزهة، أم الجود، الحسينية، الشميسي، النوارية، المشاعر المقدسة. These districts are not offered as home areas.

Corrected existing landmarks:
- Hira Cultural District, the Revelation Exhibition and Jabal al-Nour: moved from الششة to جبل النور.
- Jabal Thawr: moved to الهجرة.
- Kiswa complex and the Two Holy Mosques Architecture Exhibition: moved to أم الجود.
- Al-Otaibiyah market: moved to العتيبية.
- Al-Hudaybiyah: moved to الشميسي.
- «عين زبيدة»: now the RCMC visitor site Khasirat Ain Zubaidah, in the Holy Sites.
- Wadi Al-Asilah: removed, because no source placed it.

| Area | Real places |
|---|---|
| محيط الحرم | 19 |
| العوالي | 18 |
| الشوقية | 18 |
| العزيزية | 15 |
| الزاهر | 11 |
| الشرائع | 10 |
| الكعكية | 10 |
| بطحاء قريش | 9 |
| النسيم | 8 |
| المسفلة | 7 |
| التنعيم | 7 |
| حي الجامعة | 7 |
| جبل النور | 6 |
| الرصيفة | 6 |
| الهجرة | 5 |
| النزهة | 5 |
| جرول | 4 |
| أم الجود | 2 |
| المشاعر المقدسة | 1 |
| الشميسي (الحديبية) | 1 |
| العتيبية | 1 |
| أجياد | 1 |
| النوارية | 1 |
| الحجون | 1 |
| العدل | 1 |
| الغزة | 1 |
| المعابدة | 1 |
| الحسينية | 1 |
| الششة | 1 |

## Photos

A real place shows its own photograph, its brand's logo, or a drawn tile for its kind; never a stock or other-place photo. The app never labels or explains which (`scripts/consumer-copy-check.mjs`). `scripts/real-visuals-check.mjs` assigns every place to one tier and fails on a mapping its record does not support.

| Tier | What the tile shows | Places |
|---|---|---|
| 1. Place photo | The place itself, or the brand's own storefront/interior for every branch of that brand: the 2 library photographs (المسجد الحرام, جبل النور) and 60 supplied photographs | 66 |
| 2. Brand logo | 39 supplied logos, plus Simple Icons marks for Starbucks ×4, Burger King and McDonald's; shown whole on a plain surface, never stretched or enlarged past their own pixels | 67 |
| 3. Context photo | A verified photo of the district the record says the place is in (متحف القهوة السعودية: Jabal al-Nour, Hira Cultural District) | 1 |
| 4. Category visual | A drawn tile for the kind of place | 44 |

**Supplied assets.** 99 files supplied by the project owner (`EyeMakkah_Verified_Assets.zip`, 5 Oct 2026): 60 photographs and 39 logos, one per brand or place. `assets/places/manifest.json` lists each one with the records that use it (125 places; a brand's asset serves all of its branches). `scripts/place-assets-build.py` normalises them: photos to WebP with an 820 px long edge, never upscaled; logos trimmed of empty margins, transparency kept, on their own background colour or a light/dark neutral. `scripts/place-sync.mjs` inlines them as `PLACE_ASSETS`. Photos under 640 px wide are shown whole over a soft copy of themselves in large frames rather than enlarged. A supplied asset outranks a context photo or category tile but never replaces a place's own library photograph.

**Logos (Simple Icons).** Version 16.34.0 (`simple-icons` on npm, CC0-1.0, https://simpleicons.org). The brands' trademarks belong to their owners; a mark only identifies the brand.

**Context photos** (`CONTEXT_OF` in the app) are used only where the place's own record says it is inside the complex or district shown, and only when no supplied asset exists.

## The list

### مطاعم وأكل (91)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| سميت سراي — أجياد (Simit Sarayi — Ajyad) | أجياد | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/19859/Simit-Sarayi--Ajyad?lang=en) |
| قدر وجمرة (Qidr wa Jamra) | التنعيم | m | category visual | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%AA%D9%86%D8%B9%D9%8A%D9%85/169608) |
| نخبة المندي (Nukhbat Al Mandi) | التنعيم | m | category visual | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%AA%D9%86%D8%B9%D9%8A%D9%85/174866) |
| مطاعم ديار المجد (Diyar Al Majd Restaurants) | التنعيم | m | supplied logo | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%AA%D9%86%D8%B9%D9%8A%D9%85/144686) |
| الركن الحضرمي — التنعيم (Al Rukn Al Hadhrami — Al Tan'im) | التنعيم | m | category visual | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%AA%D9%86%D8%B9%D9%8A%D9%85/69785) |
| كبيبات الفلق — الحجون (Kabeebat Ul Falaq — Al Hujun) | الحجون | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/21672/-?lang=en) |
| البيك — الرصيفة (ALBAIK — Ar Rusayfah) | الرصيفة | h | supplied logo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D8%B7%D8%B9%D9%85-%D8%A7%D9%84%D8%A8%D9%8A%D9%83-%D9%81%D8%B1%D8%B9-%D8%A7%D9%84%D8%B1%D8%B5%D9%8A%D9%81%D8%A9-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9) |
| الطازج — الرصيفة (Al Tazaj — Ar Rusayfah) | الرصيفة | h | supplied logo | [ksamenus.com](https://ksamenus.com/altazaj-mecca-alrasifa/) |
| مطعم دار تاج الهندي — الرصيفة (Dar Taj Indian Restaurant — Ar Rusayfah) | الرصيفة | m | category visual | [dartaj.com](https://www.dartaj.com/branches/p?language=ar) |
| ويستر — الزاهر (WISTER — Al Zahir) | الزاهر | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/37233/WISTER--Alzaahir?lang=en) |
| مطعم الخير منتو وفرموزة (Al Khair Mantu & Farmouza) | الزاهر | h | category visual | [maps.yango.com](https://maps.yango.com/ar-sa/org/21238731760/) |
| مطعم برج الزاهر (Burj Al Zahir Restaurant) | الزاهر | m | category visual | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D8%A8%D8%B1%D8%AC-%D8%A7%D9%84%D8%B2%D8%A7%D9%87%D8%B1-%D9%85%D9%83%D8%A9/) |
| البيك — الزاهر (ALBAIK — Al Zahir) | الزاهر | h | supplied logo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D8%B7%D8%B9%D9%85-%D8%A7%D9%84%D8%A8%D9%8A%D9%83-%D9%81%D8%B1%D8%B9-%D8%A7%D9%84%D8%B2%D8%A7%D9%87%D8%B1-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9) |
| ماكدونالدز — شارع الحجون الزاهر (McDonald's — Al Hujun St, Al Zahir) | الزاهر | h | brand logo (McDonald's) | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D8%B7%D8%B9%D9%85-%D9%85%D8%A7%D9%83%D8%AF%D9%88%D9%86%D8%A7%D9%84%D8%AF%D8%B2-%D9%81%D8%B1%D8%B9-%D8%B4%D8%A7%D8%B1%D8%B9-%D8%A7%D9%84%D8%AD%D8%AC%D9%88%D9%86-%D8%AD%D9%8A-%D8%A7%D9%84%D8%B2) |
| مطاعم أسماك النسيم — الشرايع (Asmak Al Naseem — Al Sharai branch) | الشرائع | h | supplied photo | [maps.yango.com](https://maps.yango.com/ar-sa/org/184327711530/) |
| بابا سنفور — الشرائع (Papa Smurf — Al Sharai) | الشرائع | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/21655/Pp-Smurf-l-Shryie?lang=en) |
| وادي البرجر — الشرائع (Burger Valley — Al Sharai) | الشرائع | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/17109/Burger-Valley-Al-Sharaea-?lang=en) |
| الطازج — الشرائع (Al Tazaj — Al Sharai) | الشرائع | h | supplied logo | [ksamenus.com](https://ksamenus.com/altazaj-mecca-alsharayie/) |
| مطعم أبو زيد الشرائع (Abu Zaid Restaurant — Al Sharai) | الشرائع | h | supplied photo | [maps.yango.com](https://maps.yango.com/ar-sa/org/61340175286/) |
| مطاعم ومطابخ روامس (Rawames Restaurants & Kitchens) | الشرائع | h | supplied photo | [maps.yango.com](https://maps.yango.com/ar/org/224559773832/) |
| واي بيتزا وباستا — الشرائع (Way Pizza & Pasta — Al Sharai) | الشرائع | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/20457/%D8%A8%D9%8A%D8%AA%D8%B2%D8%A7-%D9%88%D8%A7%D9%8A-%D8%A7%D9%84%D8%B4%D8%B1%D8%A7%D8%A6%D8%B9?lang=en) |
| بروستد سعودي — الشوقية (Saudi Broasted — Al Shawqiyah) | الشوقية | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/24467/-Al-Shoqiyah?lang=en) |
| حاشي باشا — الشوقية (Hashi Pasha — Al Shawqiyah) | الشوقية | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/31659/-?lang=en) |
| البخاري الممتاز — الشوقية (Al Bukhari Al Mumtaz — Al Shawqiyah) | الشوقية | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/39284/-%D8%A7%D9%84%D8%A8%D8%AE%D8%A7%D8%B1%D9%8A-%D8%A7%D9%84%D9%85%D9%85%D8%AA%D8%A7%D8%B2-%D8%A7%D9%84%D8%B4%D9%88%D9%82%D9%8A%D8%A9?lang=en) |
| هرمان — الشوقية (Harman — Al Shawqiyah) | الشوقية | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/17080/Harman-midan-alsalama?lang=en) |
| المذاق المغربي — الشوقية (Moroccan Taste — Al Shawqiyah) | الشوقية | h | supplied photo | [mat3am.net](https://www.mat3am.net/menu/29100?lang=en) |
| ديب فرايز (Deep Fries) | الشوقية | m | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/31563/%D8%AF%D9%8A%D8%A8-%D9%81%D8%B1%D8%A7%D9%8A%D8%B2-%D8%B9%D9%88%D8%A7%D9%84%D9%8A?lang=en) |
| شاورما الأندلس (Shawarma Al Andalus) | الشوقية | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/8127/-?lang=en) |
| فلافل وافيتا (Falafil Wafita) | الشوقية | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/19925/flfil-wfit-l-Shoqiyh?lang=en) |
| البيك — الشوقية (ALBAIK — Al Shawqiyah) | الشوقية | m | supplied logo | [menusalbaik.com](https://menusalbaik.com/albaik-branches-locations/) |
| كودو — الشوقية (Kudu — Al Shawqiyah) | الشوقية | m | supplied logo | [peekaboo.guru](https://peekaboo.guru/makkah/detail/59573/kudu---%D9%83%D9%88%D8%AF%D9%88/branches) |
| الرومانسية — الشوقية (Al Romansiah — Al Shawqiyah) | الشوقية | m | supplied photo | [alromansiah.com](https://alromansiah.com/ar/branches) |
| مطعم فول طيبة الشعبي (Foul Taiba Al Shaabi) | الشوقية | m | supplied photo | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D9%81%D9%88%D9%84-%D8%B7%D9%8A%D8%A8%D8%A9-%D8%A7%D9%84%D8%B4%D8%B9%D8%A8%D9%8A-%D9%85%D9%83%D8%A9/) |
| حلويات القصور — الشوقية (Al Qusoor Sweets — Al Shawqiyah) | الشوقية | m | supplied logo | [tiktok.com](https://www.tiktok.com/@makplaces/video/7484390648536141063) |
| حلاوة مكة — الشوقية (Halawah Makkah — Al Shawqiyah) | الشوقية | m | category visual | [instagram.com](https://www.instagram.com/halawh_sweet/) |
| صيد البحر للأسماك (Sayd Al Bahr Fish) | الشوقية | m | supplied photo | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%B4%D9%88%D9%82%D9%8A%D8%A9/98539) |
| البيك — العزيزية (ALBAIK — Al Aziziyah) | العزيزية | h | supplied logo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D8%B7%D8%B9%D9%85-%D8%A7%D9%84%D8%A8%D9%8A%D9%83-%D9%81%D8%B1%D8%B9-%D8%AD%D9%8A-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/) · [mat3am.net](https://www.mat3am.net/restaurant/2425/%D8%A7%D9%84%D8%A8%D9%8A%D9%83-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9-2?lang=en) |
| مطعم الرومانسية — العزيزية (Al Romansiah — Al Aziziyah) | العزيزية | m | supplied photo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D8%B7%D8%B9%D9%85-%D8%A7%D9%84%D8%B1%D9%88%D9%85%D8%A7%D9%86%D8%B3%D9%8A%D8%A9-%D9%81%D8%B1%D8%B9-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A) · [tiktok.com](https://www.tiktok.com/@hungry.makkah/video/7577802327340354836) |
| مطعم بن عفيف (Bin Afif Restaurant) | العزيزية | h | supplied photo | [tiktok.com](https://www.tiktok.com/@hamanizaid/video/7363148183372893458) · [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D8%A8%D9%86-%D8%B9%D9%81%D9%8A%D9%81-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D9%87/) |
| مطاعم ومطابخ حراء (Heraa Restaurants & Kitchens) | العزيزية | m | supplied photo | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D8%AD%D8%B1%D8%A7%D8%A1-%D9%85%D9%83%D8%A9/) |
| مشاوي بلودان السورية (Bloudan Syrian Grills) | العزيزية | h | category visual | [maps.yango.com](https://maps.yango.com/ar/org/106325693412/) |
| حلويات ميني كيك العزيزية (Mini Cake Sweets — Aziziyah) | العزيزية | m | category visual | [maps.yango.com](https://maps.yango.com/ar-sa/org/89299208812/) |
| مخابز وحلويات نعمة — العزيزية (Neama Bakeries & Sweets — Aziziyah) | العزيزية | h | supplied logo | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9/11721) · [besteaterys.com](https://besteaterys.com/%D9%85%D8%AE%D8%A7%D8%A8%D8%B2-%D9%88%D8%AD%D9%84%D9%88%D9%8A%D8%A7%D8%AA-%D9%86%D8%B9%D9%85%D8%A9-%D9%85%D9%83%D8%A9/) |
| حلويات سعد الدين — العزيزية (Saadeddin Sweets — Aziziyah) | العزيزية | m | supplied photo | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9/4105) |
| مطعم آسيا تنقارا (جنوب شرق آسيا) (Asia Tenggara Indonesian Restaurant) | العوالي | h | category visual | [yandex.com](https://yandex.com/maps/org/asia_tenggara_restaurant_al_awali_makkah/112079795784/) · [welcomesaudi.com](https://welcomesaudi.com/restaurant/asia-tenggara-indonesian-restaurant-makkah) |
| فاير جريل (Fire Grill) | العوالي | h | supplied logo | [maps.yango.com](https://maps.yango.com/org/30562804256/) · [ananinja.com](https://ananinja.com/sa/en/restaurants/fire-grill-3842) |
| برجر كنج — العوالي (Burger King — Al Awali) | العوالي | h | brand logo (Burger King) | [mat3am.net](https://www.mat3am.net/restaurant/16146/--Al-Awali-neighborhood?lang=en) |
| مطعم المذاق التركي — فرع العوالي (Turkish Almazaq (Turkish Taste) — Al Awali) | العوالي | h | supplied photo | [sa.polomap.com](https://sa.polomap.com/%D9%85%D9%83%D8%A9/38010) · [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/turkish-taste/mecca/al-awali/31944) |
| ذا ميتنق (The Meating) | العوالي | h | supplied photo | [maps.yango.com](https://maps.yango.com/ar-sa/org/109970021207/) |
| الطازج — العوالي (Al Tazaj — Al Awali) | العوالي | h | supplied logo | [ksamenus.com](https://ksamenus.com/altazaj-mecca-alawali/) |
| حلويات القصور — العوالي (Al Qusoor Sweets — Al Awali) | العوالي | m | supplied logo | [tiktok.com](https://www.tiktok.com/@makplaces/video/7484390648536141063) |
| مطعم أسماك النجوم (Asmak Al Nujoom) | العوالي | h | supplied photo | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D8%A3%D8%B3%D9%85%D8%A7%D9%83-%D8%A7%D9%84%D9%86%D8%AC%D9%88%D9%85-%D8%A7%D9%84%D8%B9%D9%88%D8%A7%D9%84%D9%8A/) |
| أسماك الصيادية العوالي (Asmak Al Sayadiah — Al Awali) | العوالي | h | supplied photo | [khoroga.com](https://khoroga.com/ar/places/%D9%85%D8%B7%D8%A7%D8%B9%D9%85/%D8%A3%D8%B3%D9%85%D8%A7%D9%83-%D8%A7%D9%84%D8%B5%D9%8A%D8%A7%D8%AF%D9%8A%D8%A9-%D8%A7%D9%84%D8%B9%D9%88%D8%A7%D9%84%D9%8A/) |
| مطعم بليون للمأكولات البحرية (Bilyoun Seafood Restaurant) | العوالي | m | supplied logo | [tiktok.com](https://www.tiktok.com/@manal.makkah/video/7452082417105407240) |
| ريليش — الكعكية (Relish Joy of Taste — Al Kakiyah) | الكعكية | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/19932/-Relish-JOY-OF-TASTE-Al-Kakiyyah?lang=en) · [qfood.shop](https://qfood.shop/restaurant/5266) |
| البيك — الكعكية (ALBAIK — Al Kakiyah) | الكعكية | h | supplied logo | [sa.placedigger.com](https://sa.placedigger.com/albaik-kakiyah-makkah-almukarromah1123952605.html) · [sa.top10place.com](https://sa.top10place.com/albaik-kakiyah-makkah-almukarromah-21280164.html) |
| فول ابن منسي — الكعكية (Foul Ibn Mansi — Al Kakiyah) | الكعكية | h | supplied photo | [haraj.com.sa](https://haraj.com.sa/en/1142410512/%D9%85%D8%B7%D8%B9%D9%85_%D8%A7%D8%A8%D9%86_%D9%85%D9%86%D8%B3%D9%8A_%D9%85%D9%83%D9%87_%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9_%D8%A7%D9%84%D9%83%D8%B9%D9%83%D9%8A%D9%87_%D9%85%D8%B1%D9%83%D8%B2_%D8%A8%D9%86%D8%AF%D9%87_/) |
| شركة مطاعم ومطابخ نجد (Najd Restaurants & Kitchens) | الكعكية | m | category visual | [instagram.com](https://www.instagram.com/najd_makkah/) |
| مطعم الضيافة الحضرمي (Al Dyafa Al Hadhrami Restaurant) | الكعكية | h | category visual | [ananinja.com](https://ananinja.com/sa/ar/restaurants/al-dyafa-al-hadhrami-restaurant-33699) |
| مطعم فخر البحار (Fakhr Al Bihar) | الكعكية | m | supplied photo | [tiktok.com](https://www.tiktok.com/@mode.441/video/7402693212567014663) |
| مطعم الفول العربي — المسفلة (Al Foul Al Arabi — Al Misfalah) | المسفلة | m | category visual | [hungerstation.com](https://hungerstation.com/sa-ar/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D9%85%D8%B3%D9%81%D9%84%D8%A9/136075) |
| مطعم مطبقاني المسفلة للأكلات الشعبية (Mutabbaqani Al Misfalah) | المسفلة | h | category visual | [sa.polomap.com](https://sa.polomap.com/%D9%85%D9%83%D8%A9/27765) |
| مطعم طيبة — المسفلة (Tayyibah Restaurant — Al Misfalah) | المسفلة | h | supplied photo | [ksarestaurant.com](https://ksarestaurant.com/en/listing/makkah/tayyibah-restaurant-al-misfa) · [tripadvisor.com](https://www.tripadvisor.com/ShowUserReviews-g293993-d5002409-r727472514-Tayyibah_Restaurant-Mecca_Makkah_Province.html) |
| مطعم المعراج (Al Meraaj Restaurant) | المسفلة | m | category visual | [islamiclandmarks.com](https://www.islamiclandmarks.com/makkah-other/pakistani-restaurants-in-makkah) |
| مطعم إندونيسيا — المسفلة (Indonesia Restaurant — Al Misfalah) | المسفلة | m | supplied logo | [hungerstation.com](https://hungerstation.com/sa-en/restaurant/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%A7%D9%84%D9%85%D8%B3%D9%81%D9%84%D8%A9/10432) |
| أنكل فلافي — النزهة (Uncle Fluffy — An Nuzhah) | النزهة | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/26095/Uncle-Fluffy-An-Nuzhah?lang=en) |
| مطعم أسماك النسيم (Asmak Al Naseem) | النسيم | h | supplied photo | [facebook.com](https://www.facebook.com/nasimfish/) |
| مطعم فينيسيا النسيم (Venicia Al Naseem) | النسيم | m | category visual | [facebook.com](https://www.facebook.com/finisiyaalnasim/) |
| زاد القصر (Zad Al Qasr) | النسيم | m | category visual | [tiktok.com](https://www.tiktok.com/@xmhoa_1/video/7574831747888680212) |
| مطعم العوالي — بارك إن النسيم (Al Awali Restaurant (Park Inn by Radisson Makkah Al Naseem)) | النسيم | m | category visual | [radissonhotels.com](https://www.radissonhotels.com/en-us/hotels/park-inn-makkah-al-naseem/dining/al-awali-restaurant) |
| نسائم وجبة — النوارية (Nsaeim Wajba — An Nawwariyah) | النوارية | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/24218/Nsaeim-Wajba-An-Nawwariyyah?lang=en) |
| هرمان — الهجرة (Harman — Al Hijrah) | الهجرة | m | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/17079/Harman-Mecca?lang=en) |
| مطبق السندي (Mutabbaq Al Sindi) | الهجرة | m | supplied photo | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%B9%D9%85-%D9%85%D8%B7%D8%A8%D9%82-%D8%A7%D9%84%D8%B3%D9%86%D8%AF%D9%8A-%D9%85%D9%83%D8%A9/) |
| مطعم مأكولات ماليزيا — فرع الهجرة (Malaysia Food Restaurant — Al Hijrah branch) | الهجرة | m | supplied photo | [pinterest.com](https://www.pinterest.com/pin/646548090275611343/) · [wanderboat.ai](https://wanderboat.ai/restaurants/saudi-arabia/makkah-al-mukarramah/%D9%85%D8%B7%D8%B9%D9%85-%D9%85%D8%A3%D9%83%D9%88%D9%84%D8%A7%D8%AA-%D9%85%D8%A7%D9%84%D9%8A%D8%B2%D9%8A%D8%A7-%D9%81%D8%B1%D8%B9-%D8%A7%D9%84%D9%87%D8%AC%D8%B1%D8%A9/304UuHZYTTawxywJYkWhOw) |
| حاشي باشا — بطحاء قريش (Hashi Pasha — Batha Quraish) | بطحاء قريش | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/31641/-?lang=en) |
| أيام شامية — بطحاء قريش (Ayyam Shamiyya — Batha Quraish) | بطحاء قريش | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/39326/%D8%A3%D9%8A%D8%A7%D9%85-%D8%B4%D8%A7%D9%85%D9%8A%D8%A9--%D8%A8%D8%B7%D8%AD%D8%A7%D8%A1-%D9%82%D8%B1%D9%8A%D8%B4?lang=en) |
| شاورماتي على الفحم — بطحاء قريش (Shawarmati on Charcoal — Batha Quraish) | بطحاء قريش | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/21663/Shawarmati-on-charcoal-Batha-Quraish?lang=en) |
| بروست الفروج — بطحاء قريش (Broast Al Farooj — Batha Quraish) | بطحاء قريش | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/39327/%D8%A8%D8%B1%D9%88%D8%B3%D8%AA-%D8%A7%D9%84%D9%81%D8%B1%D9%88%D8%AC-%D8%A8%D8%B7%D8%AD%D8%A7%D8%A1-%D9%82%D8%B1%D9%8A%D8%B4?lang=en) |
| مطاعم سليق ومضغوط الديرة (Al Deira Saleeg & Madghoot) | بطحاء قريش | m | category visual | [besteaterys.com](https://besteaterys.com/%D9%85%D8%B7%D8%A7%D8%B9%D9%85-%D8%B3%D9%84%D9%8A%D9%82-%D9%88%D9%85%D8%B6%D8%BA%D9%88%D8%B7-%D8%A7%D9%84%D8%AF%D9%8A%D8%B1%D8%A9/) |
| فول باجندوح (Foul Bajandouh) | جرول | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/19864/Bjnduh-bens-Jrwl?lang=en) · [x.com](https://x.com/Ask_Makkah_/status/1913690379179954659) |
| مطعم الرواق الباكستاني (Al Rawaq Pakistani Restaurant) | جرول | h | supplied logo | [magicpin.com](https://magicpin.com/saudi-arabia/Mecca/Jarwal/Other/Al-Rawaq-Pakistani-Restaurant/store/229956a) |
| مطبق ابن محمد شرف (Mutabbaq Ibn Mohammed Sharaf) | جرول | m | category visual | [tiktok.com](https://www.tiktok.com/@user9au2v6k0oj/video/7377882285426642192) |
| طيبات الأموي — الجامعة (Tayibat Al Umawi — Al Jamiah) | حي الجامعة | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/19990/%D8%B7%D9%8A%D8%A8%D8%A7%D8%AA-%D8%A7%D9%84%D8%A7%D9%85%D9%88%D9%8A-%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-?lang=en) |
| كودو — مكة مول (Kudu — Makkah Mall) | حي الجامعة | m | supplied logo | [peekaboo.guru](https://peekaboo.guru/makkah/detail/59573/kudu---%D9%83%D9%88%D8%AF%D9%88/branches) |
| مطعم فيصل — الجامعة (Faisal Restaurant — Al Jamiah) | حي الجامعة | h | category visual | [maps.yango.com](https://maps.yango.com/ar-sa/org/215969966299/related/?lang=ar) |
| مطعم ومشويات أشرف (Ashraf Restaurant & Grills) | حي الجامعة | h | supplied logo | [maps.yango.com](https://maps.yango.com/ar/org/184142373395/) |
| فريندز بيتزا — الجامعة (Friends Pizza — Al Jamiah) | حي الجامعة | h | category visual | [mat3am.net](https://www.mat3am.net/restaurant/19855/Friends-Pizza-Al-Jamiah?lang=en) |
| البيك — جبل عمر (ALBAIK — Jabal Omar) | محيط الحرم | h | supplied logo | [maps.yango.com](https://maps.yango.com/ar-sa/org/139980656490/) |
| كشري التحرير — مكة (Koshary El Tahrir — Makkah) | محيط الحرم | m | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/27353/Koshary-El-Tahrir-Makkah?lang=en) |
| جان برجر — جبل عمر (Jan Burger — Jabal Omar) | محيط الحرم | h | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/37566/%D8%AC%D8%A7%D9%86-%D8%A8%D8%B1%D8%AC%D8%B1-%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D9%8A?lang=en) |
| الرومانسية — الشبيكة (Al Romansiah — Al Shubaikah) | محيط الحرم | h | supplied photo | [mat3am.net](https://www.mat3am.net/restaurant/39423/%D8%A7%D9%84%D8%B1%D9%88%D9%85%D8%A7%D9%86%D8%B3%D9%8A%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D9%8A%D9%83%D8%A9?lang=en) |

### مقاهٍ (27)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| مطعم جوينت — التنعيم (Joint — Al Tan'im) | التنعيم | h | supplied photo | [ananinja.com](https://ananinja.com/sa/ar/restaurants/joint-9475) |
| مقهى ثبات (Thabat Café) | التنعيم | m | supplied logo | [ananinja.com](https://ananinja.com/sa/ar/restaurants/thabat-cafe-19284) |
| ترانزيت كافيه (Transit Café) | الرصيفة | m | supplied logo | [readymap.city](https://readymap.city/20292/9580) |
| وقت القهوة (Waqt Al Qahwa) | الرصيفة | m | category visual | [maps.yango.com](https://maps.yango.com/ar/org/187556759948/) |
| ستاربكس — الحكير تايم (Starbucks — Hokair Time Makkah) | الزاهر | m | brand logo (Starbucks) | [locations.alshaya.com](https://locations.alshaya.com/starbucks/sa/mecca/hokair-time-makkah) |
| زيكا كافيه — الزاهر (Zeeka Café — Al Zahir) | الزاهر | h | supplied logo | [tiktok.com](https://www.tiktok.com/@zeeka_sa/video/7553606633704672530) |
| كوستا كوفي — الضيافة مول (Costa Coffee — Al Diyafa Mall) | الزاهر | m | supplied logo | [ananinja.com](https://ananinja.com/sa/ar/restaurants/costa-coffee-33438) |
| هاف مليون — الشرائع (Half Million — Al Sharaie) | الشرائع | m | supplied photo | [tiktok.com](https://www.tiktok.com/@jabri.saa/video/7439425412305784071) |
| بارنز — العزيزية (Barn's — Aziziyah) | العزيزية | m | supplied logo | [mat3am.net](https://www.mat3am.net/restaurant/28679/branches/%D9%81%D8%B1%D9%88%D8%B9-%D8%A8%D8%A7%D8%B1%D9%86%D8%B2--%D9%81%D9%8A-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9?lang=en) |
| دانكن — العوالي (Dunkin' — Al Awali) | العوالي | m | supplied logo | [ksarestaurant.com](https://ksarestaurant.com/en/listing/makkah/dunkin-donuts-al-awali) |
| دوز كافيه — العوالي (Dose Café — Al Awali) | العوالي | h | supplied logo | [mat3am.net](https://www.mat3am.net/en/restaurants/dose-cafe-7028) |
| بارنز — الكعكية (Barn's — Al Kakiyah) | الكعكية | m | supplied logo | [barns.com.sa](https://barns.com.sa/ar/store-locator?city_id=4218&country_id=191) |
| تيم هورتنز — النسيم (Tim Hortons — An Naseem) | النسيم | m | supplied logo | [maps.yango.com](https://maps.yango.com/en-sa/org/tim_hortons/122169129869/) |
| أرك كافيه (ARC Café) | النسيم | m | supplied logo | [instagram.com](https://www.instagram.com/arc.c.sa/) |
| اپ كوفي — النسيم (UP Coffee — An Naseem) | النسيم | m | category visual | [instagram.com](https://www.instagram.com/upcoffee.sa/) |
| بارنز — الجاد (الهجرة) (Barn's — Al Jad (Al Hijrah)) | الهجرة | m | supplied logo | [barns.com.sa](https://barns.com.sa/ar/store-locator) |
| كافيه سلالة — بطحاء قريش (Sulala Café — Batha Quraish) | بطحاء قريش | m | supplied photo | [besteaterys.com](https://besteaterys.com/%D9%83%D8%A7%D9%81%D9%8A%D9%87-%D8%B3%D9%84%D8%A7%D9%84%D8%A9-%D8%A8%D8%B7%D8%AD%D8%A7%D8%A1-%D9%82%D8%B1%D9%8A%D8%B4/) |
| عنوان القهوة — جبل النور (The Coffee Address — Jabal Al-Nour) | جبل النور | h | supplied logo | [x.com](https://x.com/AddressCafe/status/1984206643383685395?lang=en) |
| ستاربكس — مكة مول (Starbucks — Makkah Mall) | حي الجامعة | m | brand logo (Starbucks) | [locations.alshaya.com](https://locations.alshaya.com/starbucks/sa/mecca/makkah-mall) |
| مادو — جبل عمر (MADO — Jabal Omar) | محيط الحرم | h | supplied photo | [welcomesaudi.com](https://welcomesaudi.com/restaurant/mado-makkah) |
| ستاربكس — أبراج البيت (الدور الثاني) (Starbucks — Abraj Al Bait 2nd Floor) | محيط الحرم | h | brand logo (Starbucks) | [locations.alshaya.com](https://locations.alshaya.com/starbucks/sa/mecca/abraj-al-bait-2nd-floor) |
| ستاربكس — جبل عمر C1 (Starbucks — Jabal Omar C1) | محيط الحرم | h | brand logo (Starbucks) | [locations.starbucks.sa](https://locations.starbucks.sa/mecca/jabal-omar-c1) |
| تيم هورتنز — أبراج البيت (Tim Hortons — Abraj Al Bait) | محيط الحرم | h | supplied logo | [tripadvisor.com](https://www.tripadvisor.com/Restaurant_Review-g293993-d33442237-Reviews-Tim_Hortons-Mecca_Makkah_Province.html) |
| برو 92 — برج الساعة (Brew92 — Clock Tower) | محيط الحرم | m | supplied photo | [brew92.com](https://www.brew92.com/locations) |
| برو 92 — شركة مكة (Brew92 — Makkah Company) | محيط الحرم | m | supplied photo | [tiktok.com](https://www.tiktok.com/@yo_qary/video/7533343387584318727) |
| خطوة جمل — جبل عمر (Camel Step — Jabal Omar) | محيط الحرم | h | supplied photo | [x.com](https://x.com/Riy_coffeeholic/status/1557365801711198211) · [tiktok.com](https://www.tiktok.com/@seham.z5/video/7421929328998403346) |
| مقهى لحظة كيف (Lahza Kaif Coffee) | محيط الحرم | m | supplied logo | [momo-cafe.com](https://www.momo-cafe.com/) · [blog.wasalt.sa](https://blog.wasalt.sa/%D9%83%D8%A7%D9%81%D9%8A%D9%87%D8%A7%D8%AA-%D9%85%D9%83%D8%A9/) |

### أسواق وتسوق (23)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| الضيافة مول (سوق الضيافة) (Al Diyafa Mall (Souk Al Diyafa)) | الزاهر | h | supplied photo | [blog.wasalt.sa](https://blog.wasalt.sa/%D8%A7%D9%84%D8%B6%D9%8A%D8%A7%D9%81%D8%A9-%D9%85%D9%88%D9%84-%D9%85%D9%83%D8%A9/) · [ananinja.com](https://ananinja.com/sa/ar/restaurants/costa-coffee-33438) |
| بن داود — هايبر الششة (BinDawood Hypermarket — Al Shisha) | الششة | m | supplied logo | [hypermarketoffers.com](https://www.hypermarketoffers.com/hypermarket-addresses/%D9%81%D8%B1%D9%88%D8%B9-%D8%A3%D8%B3%D9%88%D8%A7%D9%82-%D8%A8%D9%86-%D8%AF%D8%A7%D9%88%D8%AF-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9/) |
| سوق العتيبية (Al-Otaibiyah Market) | العتيبية | official | category visual | [saaih.com](https://www.saaih.com/%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9/%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/%D8%B3%D9%88%D9%82-%D8%A7%D9%84%D8%B9%D8%AA%D9%8A%D8%A8%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B1%D9%83%D8%B2%D9%8A) |
| مكتبة جرير — فرع العدل (Jarir Bookstore — Al Adel) | العدل | h | supplied logo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D9%83%D8%AA%D8%A8%D8%A9-%D8%AC%D8%B1%D9%8A%D8%B1-%D8%B7%D8%B1%D9%8A%D9%82-%D8%A7%D9%84%D8%B3%D9%8A%D9%84%D8%8C-%D8%AD%D9%8A-%D8%A7%D9%84%D8%B9%D8%AF%D9%84%D8%8C-%D9%85%D9%83%D8%A9-%D8%A7%D9%84) · [wowdeals.me](https://www.wowdeals.me/sa/jarir-bookstore/mecca/al-adel) |
| مكتبة الرشد — فرع مكة (Al-Rushd Bookstore — Makkah) | العزيزية | m | supplied logo | [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/mktb-alrshd-fraa-mk) · [sa.readymap.info](https://sa.readymap.info/20292/14736) |
| أسواق العزيزية (Al-Aziziyah Markets) | العزيزية | m | category visual | [bayut.sa](https://www.bayut.sa/blog/%D8%A7%D9%83%D8%AA%D8%B4%D9%81-%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9/%D8%A7%D8%B3%D9%88%D8%A7%D9%82-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9-%D9%85%D9%83%D8%A9/) · [makkahhotels.co](https://www.makkahhotels.co/ar/azizia-market/) |
| بن داود — العزيزية (BinDawood — Aziziyah) | العزيزية | h | supplied logo | [sa.ilofo.com](https://sa.ilofo.com/bin-dawood/makkah/azizia) · [wowdeals.me](https://www.wowdeals.me/sa/bin-dawood/mecca/aziziyah) |
| مكتبة جرير — فرع العوالي (Jarir Bookstore — Al Awali) | العوالي | h | supplied logo | [wowdeals.me](https://www.wowdeals.me/sa/jarir-bookstore/mecca/al-awali) · [aljazeeramaps.com](https://www.aljazeeramaps.com/listing/%D9%85%D9%83%D8%AA%D8%A8%D8%A9-%D8%AC%D8%B1%D9%8A%D8%B1-%D9%81%D8%B1%D8%B9-%D8%AD%D9%8A-%D8%A7%D9%84%D8%B9%D9%88%D8%A7%D9%84%D9%8A%D8%8C-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9) |
| هايبر بنده — العوالي (Hyper Panda — Al Awali) | العوالي | h | supplied logo | [sa.ilofo.com](https://sa.ilofo.com/en/bndh/makkah/al-awali) · [aleqt.com](https://www.aleqt.com/2011/04/17/article_527543.html) |
| بن داود — العوالي (BinDawood — Al Awali) | العوالي | h | supplied logo | [sa.ilofo.com](https://sa.ilofo.com/en/bin-dawood/makkah/al-awali) |
| الدانوب — دان بلازا العوالي (Danube — Dan Plaza, Al Awali) | العوالي | h | supplied logo | [argaam.com](https://www.argaam.com/ar/article/articledetail/id/1491962) |
| سوق الحلقة (حلقة الكعكية) (Souq Al-Halaqa (Kakiyah wholesale market)) | الكعكية | h | supplied photo | [mahally.com](https://mahally.com/stores/1082282693/) · [en.wikipedia.org](https://en.wikipedia.org/wiki/Souq_al-Hilla) |
| هايبر بنده — الكعكية (Hyper Panda — Al Kakiyah) | الكعكية | h | supplied logo | [dealzsaudi.com](https://www.dealzsaudi.com/panda/mecca/hyper-panda-cake) · [x.com](https://x.com/PandaSaudi/status/1006370278144991232) |
| بن داود — هايبر الكعكية (BinDawood Hypermarket — Al Kakiyah) | الكعكية | h | supplied logo | [sa.ilofo.com](https://sa.ilofo.com/en/bin-dawood/makkah/al-kakiya-hypermarket) |
| سوق المسفلة (Al-Misfalah Market) | المسفلة | m | supplied photo | [makkahnewspaper.com](https://makkahnewspaper.com/article/79989/%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86-%D8%AD%D9%88%D9%8A%D8%AA---%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9) · [bindayel.com](https://bindayel.com/projects/0004ar.html) |
| مكتبة جرير — فرع الحجاز مول (Jarir Bookstore — Al Hijaz Mall) | النزهة | h | supplied logo | [wowdeals.me](https://www.wowdeals.me/sa/jarir-bookstore/mecca/al-hijaz-mall) |
| الحجاز مول (Al Hijaz Mall) | النزهة | h | supplied photo | [maps.yango.com](https://maps.yango.com/ar-sa/org/242548463233/) · [hijazmalls.com](https://hijazmalls.com/ar/branchinfo/1) |
| السرايا مول (Al Saraya Mall) | النزهة | m | supplied photo | [blog.wasalt.sa](https://blog.wasalt.sa/%D8%A7%D9%84%D8%B3%D8%B1%D8%A7%D9%8A%D8%A7-%D9%85%D9%88%D9%84-%D9%81%D9%8A-%D9%85%D9%83%D8%A9/) |
| بنده — بطحاء قريش (Panda — Batha Quraish) | بطحاء قريش | h | supplied logo | [dealzsaudi.com](https://www.dealzsaudi.com/panda/mecca/panda-batha-quraish) · [x.com](https://x.com/PandaSaudi/status/1006370278144991232) |
| مكة مول (Makkah Mall) | حي الجامعة | m | supplied photo | [makkah-madinah.accor.com](https://makkah-madinah.accor.com/blog/introducing-the-best-places-to-shop-in-makkah/) · [al-rahhala.com](https://al-rahhala.com/%D9%85%D8%AD%D9%84%D8%A7%D8%AA-%D9%85%D9%83%D8%A9-%D9%85%D9%88%D9%84-%D8%A3%D9%87%D9%85-%D9%85%D8%AD%D9%84%D8%A7%D8%AA-%D8%A7%D9%84%D9%85%D9%84%D8%A7%D8%A8%D8%B3-%D9%88%D8%A7%D9%84%D8%B9%D8%B7%D9%88/) |
| مجمع أبراج البيت التجاري (Abraj Al Bait Mall (Clock Tower)) | محيط الحرم | h | supplied photo | [getoccupi.com](https://getoccupi.com/malls/abraj-al-bait-mall) · [makkah-madinah.accor.com](https://makkah-madinah.accor.com/blog/discover-abraj-al-bait-makkahs-sensational-shopping-and-hotel-complex/) |
| أسواق الخليل — جبل عمر (Souk Al-Khalil — Jabal Omar) | محيط الحرم | h | category visual | [discovermakkah.sa](https://discovermakkah.sa/en/activities/shopping-in-mecca/list-of-popular-commercial-markets/alkhalil-market-jabal-omar) · [getoccupi.com](https://getoccupi.com/malls/souk-al-khalil-3-jabal-omar) |
| بن داود — أبراج البيت (BinDawood — Abraj Al Bait) | محيط الحرم | h | supplied logo | [sa.ilofo.com](https://sa.ilofo.com/en/bin-dawood/makkah/abraj-al-bait-al-haram) |

### ثقافة وتاريخ (9)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| متحف مكة المكرمة للتراث والحضارة (Makkah Museum of Heritage and Civilisation) | الزاهر | official | supplied photo | [sadaa.com.sa](https://sadaa.com.sa/attraction/makkah-museum/) · [saudipedia.com](https://saudipedia.com/article/15786) |
| معرض عمارة الحرمين الشريفين (Exhibition of the Two Holy Mosques' Architecture) | أم الجود | official | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/N2338423) · [spa.gov.sa](https://www.spa.gov.sa/811955) |
| حي حراء الثقافي (Hira Cultural District) | جبل النور | official | context | [visitsaudi.com](https://www.visitsaudi.com/ar/makkah/attractions/hira-cultural-district-tour) · [spa.gov.sa](https://www.spa.gov.sa/w1846088) |
| معرض الوحي (The Revelation Exhibition) | جبل النور | official | supplied photo | [saudipedia.com](https://saudipedia.com/article/12730/%D8%B4%D8%A4%D9%88%D9%86-%D8%AF%D9%8A%D9%86%D9%8A%D8%A9/%D8%AD%D9%8A-%D8%AD%D8%B1%D8%A7%D8%A1-%D8%A7%D9%84%D8%AB%D9%82%D8%A7%D9%81%D9%8A) |
| متحف القرآن الكريم (Holy Quran Museum) | جبل النور | h | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/N2246702) · [rcmc.gov.sa](https://www.rcmc.gov.sa/news/%D8%A7%D9%84%D9%87%D9%8A%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D9%84%D9%83%D9%8A%D8%A9-%D8%AA%D8%AF%D8%B4%D9%86-%D9%85%D8%AA%D8%AD%D9%81-%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86-%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%D8%8C-%D8%A7%D8%AD%D8%AF-%D9%85%D9%83%D9%88%D9%86%D8%A7%D8%AA-%D8%AD%D9%8A-%D8%AD%D8%B1%D8%A7%D8%A1-%D8%A7%D9%84%D8%AB%D9%82%D8%A7%D9%81%D9%8A) |
| متحف القهوة السعودية (Saudi Coffee Museum) | جبل النور | h | context photo | [spa.gov.sa](https://www.spa.gov.sa/w1886154) |
| المسجد الحرام (Al-Masjid al-Haram) | محيط الحرم | official | exact | [discovermakkah.sa](https://www.discovermakkah.sa/en/places-worth-visiting/landmarks) |
| متحف برج الساعة (Clock Tower Museum) | محيط الحرم | official | context | [discovermakkah.sa](https://www.discovermakkah.sa/en/places-worth-visiting/landmarks/clock-tower-museum) |
| المعرض والمتحف الدولي للسيرة النبوية والحضارة الإسلامية (International Fair and Museum of the Prophet's Biography and Islamic Civilization) | محيط الحرم | h | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/N2385685) |

### تراث ومسارات (6)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| مسجد التنعيم (مسجد السيدة عائشة) (Al-Tan'eem Mosque (Masjid Aisha)) | التنعيم | h | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/2367410) · [discovermakkah.sa](https://www.discovermakkah.sa/en/places-worth-visiting/landmarks/al-taneem-mosque-(lady-aisha)) |
| الحديبية (Al-Hudaybiyah) | الشميسي (الحديبية) | official | supplied photo | [x.com](https://x.com/RCMC_KSA/status/1912514068696490297) |
| مسجد الجن (Masjid al-Jinn) | الغزة | h | supplied photo | [saudipedia.com](https://saudipedia.com/en/al-jinn-mosque) |
| خاصرة عين زبيدة (Khasirat Ain Zubaidah) | المشاعر المقدسة | official | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/N2249745) · [okaz.com.sa](https://www.okaz.com.sa/news/local/2152095) |
| مسجد الإجابة (Al-Ijabah Mosque) | المعابدة | h | supplied photo | [ar.wikipedia.org](https://ar.wikipedia.org/wiki/%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A5%D8%AC%D8%A7%D8%A8%D8%A9_(%D9%85%D9%83%D8%A9_%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9)) |
| بئر طوى (Bi'r Tuwa (Well of Dhi Tuwa)) | جرول | h | category visual | [saudipedia.com](https://saudipedia.com/article/12896) · [rcmc.gov.sa](https://www.rcmc.gov.sa/historical-sites/tuwa-well-makkah) |

### تعلّم وورش (2)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| مكتبة المسجد الحرام (Grand Mosque Library (Maktabat al-Masjid al-Haram)) | بطحاء قريش | h | supplied photo | [library.gph.gov.sa](https://library.gph.gov.sa/ar/about-library/the-grand-mosque-library/) · [spa.gov.sa](https://www.spa.gov.sa/N2230708) |
| مكتبة مكة المكرمة (Makkah Public Library) | محيط الحرم | official | supplied photo | [albayan.ae](https://www.albayan.ae/supplements/ramadan/nafahat/2012-08-01-1.1699314) |

### حرف ومهارات (1)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| مجمع الملك عبدالعزيز لكسوة الكعبة المشرفة (King Abdulaziz Complex for the Kaaba Kiswah) | أم الجود | official | supplied photo | [al-madina.com](https://al-madina.com/article/702977) · [sayidaty.net](https://www.sayidaty.net/node/605156) |

### طبيعة وجبال (2)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| جبل ثور (Jabal Thawr) | الهجرة | official | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/1536697) |
| جبل النور (Jabal al-Nour) | جبل النور | official | exact | [spa.gov.sa](https://www.spa.gov.sa/2115751) · [saudipedia.com](https://saudipedia.com/en/ghar-hira) |

### عائلات وأطفال (11)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| حديقة الأراك (حديقة الحسينية) (Arak Park (Al-Husayniyah Park)) | الحسينية | h | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/w1893283) · [x.com](https://x.com/AkhbarMakkah/status/1915402051862806955) |
| الحكير تايم مكة (Al Hokair Time Makkah) | الزاهر | h | category visual | [destinationksa.com](https://destinationksa.com/ar/%D8%A7%D9%84%D8%AD%D9%83%D9%8A%D8%B1-%D8%AA%D8%A7%D9%8A%D9%85-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D8%B2%D8%A7%D9%87%D8%B1/) |
| حديقة الملك عبدالله (King Abdullah Park) | الشرائع | m | supplied photo | [discovermakkah.sa](https://www.discovermakkah.sa/en/places-worth-visiting/landmarks/king-abdullah-park) · [altar7al.com](https://www.altar7al.com/%D8%AD%D8%AF%D9%8A%D9%82%D8%A9-%D8%A7%D9%84%D9%85%D9%84%D9%83-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87-%D8%A8%D9%85%D9%83%D8%A9/) |
| حديقة الشوقية العامة (Al-Shawqiyah Public Park) | الشوقية | m | category visual | [bayut.sa](https://www.bayut.sa/blog/%D8%AF%D9%84%D9%8A%D9%84-%D8%A7%D9%84%D8%A3%D8%AD%D9%8A%D8%A7%D8%A1/%D8%AD%D9%8A-%D8%B4%D9%88%D9%82%D9%8A%D8%A9/) |
| حديقة العزيزية (Al-Aziziyah Park) | العزيزية | m | category visual | [saudigates.net](https://www.saudigates.net/%D8%AD%D8%AF%D9%8A%D9%82%D8%A9-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9-%D9%81%D9%8A-%D9%85%D9%83%D8%A9/) |
| حديقة الخطاطين (Al-Khattatin Park) | العزيزية | m | category visual | [altar7al.com](https://www.altar7al.com/%D8%AD%D8%AF%D9%8A%D9%82%D8%A9-%D8%A7%D9%84%D8%AE%D8%B7%D8%A7%D8%B7%D9%8A%D9%86-%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%D9%8A%D8%A9-%D9%85%D9%83%D8%A9/) |
| حديقة جنوب العزيزية (South Aziziyah Park) | العزيزية | m | category visual | [x.com](https://x.com/Mkhnews/status/1988305629359083523) |
| حديقة حي العوالي (الدهان) (Al-Awali Park (Al-Dahhan)) | العوالي | m | category visual | [x.com](https://x.com/Mkhnews/status/1988305629359083523) |
| حديقة العوالي (شارع البروجي) (Al-Awali Park (Al-Burouji Street)) | العوالي | m | category visual | [x.com](https://x.com/Mkhnews/status/1988305629359083523) |
| حديقة المسفلة (بركة ماجد) (Al-Misfalah Park (Birkat Majid)) | المسفلة | h | supplied photo | [spa.gov.sa](https://spa.gov.sa/N2100483) · [x.com](https://x.com/Mkhnews/status/1798066818143391933?lang=ar) |
| الحديقة الحجرية (Stone Garden) | النزهة | h | category visual | [spa.gov.sa](https://www.spa.gov.sa/N2167367) · [alyaum.com](https://www.alyaum.com/articles/6550832) |

### رياضة ومشي (5)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| مدينة الملك عبدالعزيز الرياضية (ملعب الشرائع) (King Abdulaziz Sports City (Al-Sharaie Stadium)) | الشرائع | h | category visual | [ar.wikipedia.org](https://ar.wikipedia.org/wiki/%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%84%D9%83_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2_%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D9%8A%D8%A9) · [destinationksa.com](https://destinationksa.com/ar/%D9%85%D9%84%D8%B9%D8%A8-%D8%A7%D9%84%D8%B4%D8%B1%D8%A7%D8%A6%D8%B9-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9-%D9%81%D9%8A-%D9%85%D9%83%D8%A9-%D8%A7%D9%84%D9%85%D9%83%D8%B1%D9%85%D8%A9/) |
| ممشى إسكان الملك فهد (ممرات الإسكان) (King Fahd Housing Walkway) | الشوقية | h | supplied photo | [spa.gov.sa](https://www.spa.gov.sa/2316977) · [spa.gov.sa](https://www.spa.gov.sa/2316977) |
| ممشى زينب الهلالية (Zainab al-Hilaliyah Walkway) | الشوقية | m | supplied photo | [blog.wasalt.sa](https://blog.wasalt.sa/%D8%AD%D9%8A-%D8%A7%D9%84%D8%B4%D9%88%D9%82%D9%8A%D8%A9-%D9%85%D9%83%D8%A9/) · [maps.yango.com](https://maps.yango.com/ar/org/184747182345/) |
| ممشى وحديقة النسيم (Al-Naseem Walkway and Park) | النسيم | m | category visual | [snapchat.com](https://www.snapchat.com/place/-/2532da6c-647c-11ed-9450-1f4fe90ea545) · [ahwal.sa](https://ahwal.sa/archives/202527) |
| ممشى بطحاء قريش (Batha Quraish Walkway) | بطحاء قريش | m | supplied photo | [x.com](https://x.com/SaudiProject/status/632246158786621440) |

### خدمات (1)

| Place | District | Conf. | Photo | Sources |
|---|---|---|---|---|
| محطة قطار الحرمين السريع — مكة المكرمة (Haramain High Speed Railway — Makkah Station) | الرصيفة | h | supplied photo | [x.com](https://x.com/haramainrailway/status/1630782150151749633) |

## Left out (75)

| Candidate | Area / district given | Conf. | Why |
|---|---|---|---|
| البيك - أجياد | ajyad | low | low confidence |
| الطازج - أجياد | ajyad | low | low confidence |
| مطعم مأكولات ماليزيا - فرع الششة | shisha | low | low confidence |
| الطازج - فرع الزاهر | حي الشهداء (branch named الزاهر) | medium | district not placeable on the app map (حي الشهداء (branch named الزاهر)) |
| فول ابن منسي - ولي العهد | حي ولي العهد | low | low confidence |
| مطعم شاميات | rusayfah | low | low confidence |
| برجر كنج - الحمراء وأم الجود | Al-Hamra and Umm Al-Joud | high | district not placeable on the app map (Al-Hamra and Umm Al-Joud) |
| حلويات قطوف - الخضراء | Al-Khadra | medium | district not placeable on the app map (Al-Khadra) |
| وادي البرجر - الخالدية | Al Khalidiyyah | medium | district not placeable on the app map (Al Khalidiyyah) |
| عاشور - الحجلة | Al-Hujela | high | district not placeable on the app map (Al-Hujela) |
| كودو - الخالدية | Al Khalidiyyah | medium | district not placeable on the app map (Al Khalidiyyah) |
| فول الغامدي - الحمراء وأم الجود | الحمراء وأم الجود (الزايدي) | medium | district not placeable on the app map (الحمراء وأم الجود (الزايدي)) |
| فول الغامدي - الشهداء | الشهداء | medium | district not placeable on the app map (الشهداء) |
| مطعم لحمة ونص | حي ولي العهد | high | district not placeable on the app map (حي ولي العهد) |
| مطعم البركة البخاري | حي ولي العهد | high | district not placeable on the app map (حي ولي العهد) |
| مطبخ الجبلي | حي الزهراء | high | district not placeable on the app map (حي الزهراء) |
| سوق العتيبية | العتيبية | high | duplicate of an existing record or outside scope |
| حلقة جرول | jarwal | medium | duplicate of an existing record or outside scope |
| سوق الششة | الروضة (حسب المصدر) | medium | district not placeable on the app map (الروضة (حسب المصدر)) |
| شارع أجياد السد التجاري | ajyad | low | low confidence |
| هايبر بنده - النوارية | النوارية | medium | supermarket branch not confirmed by two sources |
| هايبر بنده - شرائع مول | الشرائع / الراشدية | medium | supermarket branch not confirmed by two sources |
| بنده - إسكان الرصيفة | rusayfah | low | low confidence |
| بن داود - الشوقية | shawqiyah | medium | supermarket branch not confirmed by two sources |
| بن داود - هايبر الششة | shisha | medium | supermarket branch not confirmed by two sources |
| الدانوب - محطة قطار الحرمين | rusayfah | medium | supermarket branch not confirmed by two sources |
| أسواق العثيم - الشوقية | shawqiyah | medium | supermarket branch not confirmed by two sources |
| هوم ماركت | kakiyah | medium | supermarket branch not confirmed by two sources |
| ستاربكس - محطة الحرمين | rusayfah | low | low confidence |
| ستاربكس - الدائري الثالث الخالدية (سيارات) | الخالدية | high | district not placeable on the app map (الخالدية) |
| تيم هورتنز - بطحاء قريش | bathaquraish | high | duplicate of an existing record or outside scope |
| عنوان القهوة - برج زمزم | haram-area | low | low confidence |
| عنوان القهوة - الشوقية | shawqiyah | low | low confidence |
| تونتي بينز - الحكير تايم | zahir | low | low confidence |
| بلوز كافيه - التنعيم | tanim | low | low confidence |
| اپ كوفي - الرصيفة | rusayfah | low | low confidence |
| هارلو كافيه | rusayfah | low | low confidence |
| مقهى المها النسائي | shawqiyah | low | low confidence |
| كافيه ليمى | shawqiyah | low | low confidence |
| كافيه أسانتي | awali | low | low confidence |
| ليبيريكا كافيه | awali | low | low confidence |
| كافيه دارة القهوة | aziziyah | low | low confidence |
| حي حراء الثقافي | سفح جبل النور (حراء) | high | duplicate of an existing record or outside scope |
| معرض الوحي | حي حراء الثقافي | high | duplicate of an existing record or outside scope |
| حديقة حراء | حي حراء الثقافي | medium | duplicate of an existing record or outside scope |
| جبل النور وغار حراء | شمال شرق المسجد الحرام (حراء) | high | duplicate of an existing record or outside scope |
| جبل ثور وغار ثور | hijrah | medium | duplicate of an existing record or outside scope |
| حي جبل ثور الثقافي | سفح جبل ثور | medium | duplicate of an existing record or outside scope |
| معرض عمارة الحرمين الشريفين | أم الجود | high | duplicate of an existing record or outside scope |
| مجمع الملك عبدالعزيز لكسوة الكعبة المشرفة | أم الجود | high | duplicate of an existing record or outside scope |
| متحف مكة المكرمة (قصر الزاهر) | zahir | high | duplicate of an existing record or outside scope |
| متحف برج الساعة | haram-area | high | duplicate of an existing record or outside scope |
| المسجد الحرام | haram-area | high | duplicate of an existing record or outside scope |
| مكتبة مكة المكرمة | haram-area | medium | duplicate of an existing record or outside scope |
| مسجد الجعرانة | الجعرانة (شمال شرق مكة) | high | duplicate of an existing record or outside scope |
| منتزه الجعرانة | الجعرانة | high | duplicate of an existing record or outside scope |
| ممشى التنعيم | tanim | low | low confidence |
| مسجد البيعة | منى (المشاعر) | high | duplicate of an existing record or outside scope |
| مسجد الخيف | منى (المشاعر) | high | duplicate of an existing record or outside scope |
| منشأة الجمرات | منى (المشاعر) | high | duplicate of an existing record or outside scope |
| مشعر منى | المشاعر المقدسة | high | duplicate of an existing record or outside scope |
| مسجد المشعر الحرام | مزدلفة (المشاعر) | medium | duplicate of an existing record or outside scope |
| مسجد نمرة | عرفات (المشاعر) | high | duplicate of an existing record or outside scope |
| جبل الرحمة | عرفات (المشاعر) | high | duplicate of an existing record or outside scope |
| خاصرة عين زبيدة | المشاعر المقدسة | high | duplicate of an existing record or outside scope |
| مقبرة المعلاة | الحجون | high | duplicate of an existing record or outside scope |
| مسجد الحديبية (الشميسي) | الشميسي (طريق جدة القديم) | medium | duplicate of an existing record or outside scope |
| بوابة مكة (مجسم المصحف) | طريق مكة–جدة السريع | high | duplicate of an existing record or outside scope |
| مكتبة الملك عبدالله بن عبدالعزيز الجامعية | العابدية (المدينة الجامعية) | high | duplicate of an existing record or outside scope |
| حديقة الكعكية | kakiyah | low | low confidence |
| حديقة الهلال | rusayfah | low | low confidence |
| حديقة حي الهجرة | hijrah | low | low confidence |
| بستان الزاهر | zahir | low | low confidence |
| حافلات مكة | على مستوى المدينة | high | duplicate of an existing record or outside scope |
| مستشفى أجياد للطوارئ | ajyad | medium | duplicate of an existing record or outside scope |
