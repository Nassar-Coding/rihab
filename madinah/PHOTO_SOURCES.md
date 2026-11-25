# Rihab Madinah — photo sources

Every photograph and logo the application can render is listed here. Nothing is loaded from an image host at run time:
the library photographs (`assets/photos/`) are inlined by `scripts/photo-sync.mjs` as `PHOTO_DATA`, and the place
photographs and brand logos (`assets/places/`) by `scripts/place-sync.mjs` as `PLACE_ASSETS`. The app never captions a
photograph or explains where it came from; that record lives in this file and in `assets/madinah/SOURCES.csv`.

## Real places

- **Own photograph only.** A real place shows the photograph of that very place, or its brand's logo, or else a drawn
  tile for the kind of place. It is never given a pool photograph or another place's photograph.
- **Context only where the record says so.** A dated event or visit held at a real place (the Ramadan iftar at the
  Prophet's Mosque, the Dates Season at the Central Dates Market, a walk on the Quba Walking Trail) shows that place's
  own photograph as context.
- **The holy mosques never sell anything.** A commercial listing without its own photograph never takes a photograph
  of the Prophet's Mosque or Quba Mosque.
- **No Makkah imagery.** The library holds no photograph of Makkah; the Madinah collection holds none either.

Of 197 real places: 154 show their own photograph, 25 a supplied brand logo,
4 a Simple Icons brand mark (Starbucks ×2, Burger King, McDonald's — CC0-1.0, https://simpleicons.org;
the trademarks belong to their owners) and 14 a drawn category tile.

**The Madinah collection** (`assets/madinah/images/`, 162 files: 156 photographs and 6 logos, sources in
`assets/madinah/SOURCES.csv`, gaps in `assets/madinah/MISSING.txt`). Two photographs are kept in the collection but not
used: `lulu_express_madinah` and `lulu_hypermarket_madinah` show opening ceremonies rather than the stores, so those two
branches show their category tile. 18 brand logos from the project's supplied brand collection are reused for the
same brands' Madinah branches. `scripts/real-visuals-check.mjs` fails on any logo whose brand is not in the branch's
name, or any context photograph its record does not support.

| Place (workbook id) | File in the app | Kind | Source page |
|---|---|---|---|
| Fire Grill — Al-Aridh (PLC-001) | `assets/places/fire_grill.webp` | logo | supplied brand collection |
| Burger King — Al Noor Mall (PLC-002) | Simple Icons mark (Burger King) | brand mark | https://simpleicons.org |
| Al Tazaj — Urwa / Al-Aridh (PLC-003) | `assets/places/al_tazaj.webp` | logo | supplied brand collection |
| ALBAIK — Al-Aziziyah (PLC-004) | `assets/places/albaik.webp` | logo | supplied brand collection |
| Al Romansiah — Central Area (PLC-005) | `assets/places/al_romansiah_logo.webp` | logo | https://commons.wikimedia.org/wiki/File%3AAlromanisiah-logo.svg |
| Saadeddin Pastry — Al-Khalidiyah (PLC-006) | `assets/places/saadeddin_logo.webp` | logo | https://saadeddin.com/ |
| Hashi Pasha — Al-Rabwah (PLC-007) | `assets/places/hashi_pasha.webp` | logo | supplied brand collection |
| Harman — Umm Khalid (PLC-008) | `assets/places/harman.webp` | logo | supplied brand collection |
| Moroccan Taste — Bir Uthman (PLC-009) | `assets/places/moroccan_taste_logo.webp` | logo | https://x.com/moroccantaste |
| Deep Fries — Al-Khalidiyah (PLC-010) | `assets/places/deep_fries.webp` | logo | supplied brand collection |
| Kudu — Central Area (PLC-011) | `assets/places/kudu.webp` | logo | supplied brand collection |
| Simit Sarayi — Madinah Airport (PLC-012) | `assets/places/simit_sarayi.webp` | logo | supplied brand collection |
| Jan Burger — Al-Khalidiyah (PLC-013) | `assets/places/jan_burger.webp` | logo | supplied brand collection |
| Jan Burger — Masjid Ad Dar (PLC-014) | `assets/places/jan_burger.webp` | logo | supplied brand collection |
| McDonald's — Aliat Al Madinah Mall (PLC-015) | Simple Icons mark (McDonald's) | brand mark | https://simpleicons.org |
| Abu Zaid Restaurant — Bani Zafar (PLC-016) | `assets/places/abu_zaid_restaurant_logo.webp` | logo | https://hungerstation.com/sa-en/restaurant/abu-zaid-3/mecca/asharai/31707 |
| Jarir Bookstore — King Abdullah Road (PLC-017) | `assets/places/jarir.webp` | logo | supplied brand collection |
| Al Hokair Time Madinah (PLC-018) | `assets/places/al_hokair_time_madinah.webp` | photo | https://sa.wingie.com/en/blog/top-attractions-in-madinah/ |
| Hyper Panda — Al Noor Mall (PLC-019) | `assets/places/panda.webp` | logo | supplied brand collection |
| BinDawood — Madinah (PLC-020) | `assets/places/bindawood.webp` | logo | supplied brand collection |
| Danube — King Abdullah Road (PLC-021) | `assets/places/danube.webp` | logo | supplied brand collection |
| Starbucks — Hizam Street (PLC-022) | Simple Icons mark (Starbucks) | brand mark | https://simpleicons.org |
| Starbucks — Al Dakhail Mall (PLC-023) | Simple Icons mark (Starbucks) | brand mark | https://simpleicons.org |
| Tim Hortons — Qurban (PLC-024) | `assets/places/tim_hortons.webp` | logo | supplied brand collection |
| Dunkin' — Al-Khalidiyah (PLC-025) | `assets/places/dunkin.webp` | logo | supplied brand collection |
| Brew92 — Badaah (PLC-026) | `assets/places/brew92_logo.webp` | logo | https://modernsupply.com.sa/categories/337823/brew92 |
| Barn's — Madinah (PLC-027) | `assets/places/barns.webp` | logo | supplied brand collection |
| Half Million — Al-Hadiqah (PLC-028) | `assets/places/half_million_logo.webp` | logo | https://www.halfm.sa/en-US |
| Costa Coffee — Al-Zahra (PLC-029) | `assets/places/costa_coffee.webp` | logo | supplied brand collection |
| Haramain High Speed Railway — Madinah Station (PLC-030) | `assets/places/haramain_high_speed_railway_madinah_station.webp` | photo | https://mindtrip.ai/attraction/medina-al-madinah/madinah-haramain-railway-station/at-B29owLmo |
| Al-Salam Museum (PLC-031) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| As-Safiyyah Museum and Park (PLC-032) | `assets/places/as_safiyyah_museum_and_park.webp` | photo | https://book.visitsaudi.com/product/c3559eb7-61f8-4f4c-9ccd-3cc84163d217?locale=en |
| Dar Al Madinah Museum (PLC-033) | `assets/places/dar_al_madinah_museum.webp` | photo | https://commons.wikimedia.org/wiki/File%3A%D9%85%D8%AA%D8%AD%D9%81_%D8%AF%D8%A7%D8%B1_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_3.jpg |
| Hejaz Railway Museum (Al-Madinah Museum) (PLC-034) | `assets/places/hejaz_railway_museum.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Hijaz-Railway-Museum |
| International Fair and Museum of the Prophet's Biography and Islamic Civilisation (PLC-035) | `assets/places/international_fair_and_museum_of_the_prophets_biography_and_islamic_civilisation.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Prophet's-Biography-Exhibition |
| King Fahd Glorious Quran Printing Complex (PLC-036) | `assets/places/king_fahd_glorious_quran_printing_complex.webp` | photo | https://www.spa.gov.sa/2044496 |
| Madinah Arts Center (PLC-037) | `assets/places/madinah_arts_center.webp` | photo | https://mac.nm.sa/home |
| Museum and Exhibition of the Holy Quran (PLC-038) | `assets/places/museum_and_exhibition_of_the_holy_quran.webp` | photo | https://www.spa.gov.sa/w482495 |
| Prophet's Mosque Museum (Exhibition of the Prophet's Mosque Architecture) (PLC-039) | `assets/places/prophets_mosque_museum.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Prophet's-Mosque-Museum |
| The Prophet's Mosque (Al-Masjid an-Nabawi) (PLC-040) | `assets/places/the_prophets_mosque.webp` | photo | https://saudipedia.com/ch/%E5%85%88%E7%9F%A5%E5%AF%BA%E7%9A%84%E5%BA%AD%E9%99%A2 |
| Abu Bakr Al-Siddiq Mosque (near the Prophet's Mosque) (PLC-041) | `assets/places/abu_bakr_al_siddiq_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Abu-Bakr-As-Siddiq-Mosque |
| Ain Al-Zarqa (Al-Zarqa Spring Channel) (PLC-042) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Al-Baqi' Cemetery (Baqi' Al-Gharqad) (PLC-043) | `assets/places/al_baqi_cemetery.webp` | photo | https://www.hop-on-hop-off-tickets.com/medina-bus-tours/medina-city-sightseeing/ |
| Al-Fadeekh Mosque (PLC-044) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Al-Fath Mosque (Upper Mosque) (PLC-045) | `assets/places/al_fath_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Seven-Mosques |
| Al-Ghamama Mosque (PLC-046) | `assets/places/al_ghamama_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Ghamamah-Mosque |
| Al-Hijrah Walking Trail (PLC-047) | `assets/places/al_hijrah_walking_trail.webp` | photo | https://visitmadinahsa.com/sa-ar/destinations/%D9%85%D9%85%D8%B4%D9%89-%D8%A7%D9%84%D9%87%D8%AC%D8%B1%D8%A9 |
| Al-Ijabah Mosque (PLC-048) | `assets/places/al_ijabah_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Ijabah-Mosque |
| Al-Jumu'ah Mosque (PLC-049) | `assets/places/al_jumuah_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Jumah-Mosque. |
| Al-Mustarah Mosque (PLC-050) | `assets/places/al_mustarah_mosque.webp` | photo | https://x.com/imarat_almadina/status/1221429062083710979 |
| Al-Qiblatayn Mosque (PLC-051) | `assets/places/al_qiblatayn_mosque.webp` | photo | https://www.tripadvisor.co.nz/Attraction_Review-g298551-d2649199-Reviews-Masjid_Al_Qiblatayn-Medina_Al_Madinah_Province.html |
| Ali ibn Abi Talib Mosque (near the Prophet's Mosque) (PLC-052) | `assets/places/ali_ibn_abi_talib_mosque.webp` | photo | https://visitmadinahsa.com/sa-ar/destinations/%D9%85%D8%B3%D8%AC%D8%AF---%D8%B9%D9%84%D9%8A-%D8%A8%D9%86-%D8%A3%D8%A8%D9%8A-%D8%B7%D8%A7%D9%84%D8%A8 |
| As-Saqiya Mosque (PLC-053) | `assets/places/as_saqiya_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Suqya-Mosque |
| Bani Haram Mosque (PLC-054) | `assets/places/bani_haram_mosque.webp` | photo | https://saudipedia.com/%D9%85%D8%B3%D8%AC%D8%AF-%D8%A8%D9%86%D9%8A-%D8%AD%D8%B1%D8%A7%D9%85 |
| Bani Unaif (Bani Anif) Mosque (PLC-055) | `assets/places/bani_unaif_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Bani-Unaif-mosque |
| Bustan Al-Mustazill (PLC-056) | `assets/places/bustan_al_mustazill.webp` | photo | https://www.tripadvisor.nl/AttractionProductReview-g298551-d33477355-Follow_the_First_Steps_of_the_Hijra_in_Madinah_Private_tour-Medina_Al_Madinah_Prov.html |
| Dhu al-Hulayfah Miqat (Abyar Ali) (PLC-057) | `assets/places/dhu_al_hulayfah_miqat.webp` | photo | https://x.com/HajMinistry/status/1155528983519354880 |
| Ghars Well (PLC-058) | `assets/places/ghars_well.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Well-of-Ghars. |
| Jabal Al-Rumah (Archers' Hill) (PLC-059) | `assets/places/jabal_al_rumah.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Uhud-battle-area |
| Quba Mosque (PLC-060) | `assets/places/quba_mosque.webp` | photo | https://www.hop-on-hop-off-tickets.com/medina-bus-tours/medina-city-sightseeing/ |
| Quba Square (PLC-061) | `assets/places/quba_square.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Quba-Square |
| Quba Walking Trail (PLC-062) | `assets/places/quba_walking_trail.webp` | photo | https://www.amana-md.gov.sa/MDWebsite/AboutMadina/Index |
| Saqifat Bani Sa'idah (PLC-063) | `assets/places/saqifat_bani_saidah.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Saqifat-Bani-Sa%27idah |
| Sayyid Al-Shuhada Mosque (PLC-064) | `assets/places/sayyid_al_shuhada_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Uhud-Martyrs-Square |
| Site of the Battle of the Trench (Al-Khandaq) (PLC-065) | `assets/places/site_of_the_battle_of_the_trench.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Trench- |
| The Seven Mosques (Al-Khandaq) (PLC-066) | `assets/places/the_seven_mosques.webp` | photo | https://www.detik.com/hikmah/khazanah/d-7378188/masjid-tujuh-madinah-saksi-perjalanan-rasulullah-saw-membela-islam |
| Uhud Martyrs Square (PLC-067) | `assets/places/uhud_martyrs_square.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Uhud-Martyrs-Square |
| Uhud Martyrs' Cemetery (PLC-068) | `assets/places/uhud_martyrs_cemetery.webp` | photo | https://takemetoumrah.com/martyrs-of-uhud-cemetery/ |
| Umar ibn Al-Khattab Mosque (near the Prophet's Mosque) (PLC-069) | `assets/places/umar_ibn_al_khattab_mosque.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Omar-ibn-Al-Khattab-Mosque |
| Urwa ibn al-Zubayr Palace (PLC-070) | `assets/places/urwa_ibn_al_zubayr_palace.webp` | photo | https://saudipedia.com/%D9%82%D8%B5%D8%B1-%D8%B9%D8%B1%D9%88%D8%A9-%D8%A8%D9%86-%D8%A7%D9%84%D8%B2%D8%A8%D9%8A%D8%B1 |
| Well of Aris (The Ring Well) (PLC-071) | `assets/places/well_of_aris.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Well-of-the-Ring- |
| Well of Rumah (Uthman ibn Affan's Well) (PLC-072) | `assets/places/well_of_rumah.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Well-of-Rumah-(The-Well-of-Uthman-ibn-Affan) |
| Al-Aqiq Valley Walking Trail (PLC-073) | `assets/places/al_aqiq_valley_walking_trail.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Aqiq-Valley-Walking-Trail |
| Aliat Al-Madinah Farms (PLC-074) | `assets/places/aliat_al_madinah_farms.webp` | photo | https://visitmadinahsa.com/sa-ar/destinations/%D9%85%D8%B2%D8%A7%D8%B1%D8%B9-%D8%B9%D8%A7%D9%84%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9 |
| Jabal Ayr (PLC-075) | `assets/places/jabal_ayr.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/A%27yr-Mountain |
| Mount Uhud (PLC-076) | `assets/places/mount_uhud.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Mount-Uhud- |
| Wadi Al-Aqiq (PLC-077) | `assets/places/wadi_al_aqiq.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Aqiq-Valley |
| Wadi Al-Baida (Wadi al-Jinn / Magnetic Hill) (PLC-078) | `assets/places/wadi_al_baida.webp` | photo | https://www.regencyholidays.com/blog/things-to-do-in-medina-saudi-arabia/ |
| Al Majeedi (Millennium Al Aqeeq Hotel) (PLC-079) | `assets/places/al_majeedi.webp` | photo | https://www.medina-hotels-sa.com/en/property/millennium-al-aqeeq-hotel.html |
| Al Modeef Restaurant (PLC-080) | `assets/places/al_modeef_restaurant.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Hamra-Medina/Restaurant/Al-Modeef-Restaurant/store/228a05b |
| Al Nakheel (PLC-081) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Al Rayhan Restaurant (PLC-082) | `assets/places/al_rayhan_restaurant.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Rayah/Restaurant/Al-Rayhan-Restaurant/store/228c1b8/reviews |
| Al Rukn Al Shami Restaurant (PLC-083) | `assets/places/al_rukn_al_shami_restaurant.webp` | photo | https://restaurantscorner.com/%D8%A7%D9%84%D8%B1%D9%83%D9%86-%D8%A7%D9%84%D8%B4%D8%A7%D9%85%D9%8A/ |
| Arabesque Restaurant (PLC-084) | `assets/places/arabesque_restaurant.webp` | photo | https://www.makemytrip.com/tripideas/attractions/arabesque-restaurant |
| Atlas Morocco (PLC-085) | `assets/places/atlas_morocco.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Aziziyah-Medina/Restaurant/%28%D9%85%D8%B7%D8%B9%D9%85-%D8%A7%D8%B7%D9%84%D8%B3-%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%29-%D8%B4%D8%A7%D9%88%D8%B1%D9%85%D8%A7-%D9%85%D8%BA%D8%B1%D8%A8%D9%8A%D9%87..-%D8%B9%D9%84%D9%89-%D8%A7%D9%84%D9%81%D8%AD%D9%85/store/22c0918 |
| Bab Sana'a Restaurant (PLC-086) | `assets/places/bab_sanaa_restaurant.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Fath-Medina/Restaurant/%D9%85%D8%B7%D8%B9%D9%85-%D8%A8%D8%A7%D8%A8-%D8%B5%D9%86%D8%B9%D8%A7%D8%A1-%28%D8%A7%D9%84%D8%B4%D9%8A%D8%A8%D8%A7%D9%86%D9%8A-%D8%B3%D8%A7%D8%A8%D9%82%D8%A7%29%28%D8%AA%D9%85-%D8%A7%D9%81%D8%AA%D8%AA%D8%A7%D8%AD-%D9%82%D8%B3%D9%85-%D8%A7%D9%84%D8%B9%D9%88%D8%A7%D8%A6%D9%84%29/store/22aaab9 |
| Fateer Sharqi (PLC-087) | `assets/places/fateer_sharqi.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Iskan-Medina/Restaurant/%D9%81%D8%B7%D9%8A%D8%B1-%D8%B4%D8%B1%D9%82%D9%8A%28%D9%85%D8%B4%D9%84%D8%AA%D8%AA-%D9%88-%D8%AD%D8%A7%D8%AF%D9%82-%D9%88-%D8%AD%D9%84%D9%88-%D9%88-%D9%83%D8%B1%D9%8A%D8%A8-%D9%88-%D8%A8%D9%8A%D8%AA%D8%B2%D8%A7-%29/store/22bb713 |
| Food Master (PLC-088) | `assets/places/food_master.webp` | photo | https://wanderlog.com/place/details/5735164/food-master |
| Golden Village Cafeteria (PLC-089) | `assets/places/golden_village_cafeteria.webp` | photo | https://magicpin.com/saudi-arabia/Medina/King-Fahd-District-Medina/Other/%D9%88%D8%AC%D8%A8%D8%A7%D8%AA-%D8%A7%D9%84%D9%82%D8%B1%D9%8A%D8%A9-%D8%A7%D9%84%D8%B0%D9%87%D8%A8%D9%8A%D8%A9/store/22c482a |
| Hadramout Kitchen (PLC-090) | `assets/places/hadramout_kitchen.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Markazia/Other/Hadramout-Kitchen/store/2298746/photos |
| Hamsa Chef / Lahori Hotel (PLC-091) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Hardee's (Madinah) (PLC-092) | `assets/places/hardees.webp` | photo | https://magicpin.in/saudi-arabia/Medina/Al-Hadiqah/Restaurant/Hardees/store/22a9b85 |
| Hosni (PLC-093) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Huda Turk (PLC-094) | `assets/places/huda_turk.webp` | photo | https://www.ksa.directory/huda-turk-restaurant/i/1300 |
| Hyderabad House (PLC-095) | `assets/places/hyderabad_house.webp` | photo | https://discoverharamain.com/venue/hyderabad-house-indian-madinah |
| Medina Kabsa (PLC-096) | `assets/places/medina_kabsa.webp` | photo | https://wanderlog.com/place/details/11056199/medina-kabsa |
| Memaz (PLC-097) | `assets/places/memaz.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Haram-Medina/Restaurant/Memaz-Restaurant-and-Cafe/store/22a66c2/photos |
| Nabaa Al Imtiyaz Sweets (PLC-098) | `assets/places/nabaa_al_imtiyaz_sweets.webp` | photo | https://magicpin.com/saudi-arabia/Medina/King-Fahd-District-Medina/Restaurant/%D9%86%D8%A8%D8%B9-%D8%A7%D9%84%D8%A7%D9%85%D8%AA%D9%8A%D8%A7%D8%B2-%D9%84%D9%84%D8%AD%D9%84%D9%88%D9%8A%D8%A7%D8%AA/store/22b0544/photos |
| Pakistani Multani Restaurant Rukn Rihab (PLC-099) | `assets/places/pakistani_multani_restaurant_rukn_rihab.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Awali-Medina/Other/Pakistani-Multani-Restaurant-Rukn-Rihab/store/2291189 |
| Shawarma Al Chef (PLC-100) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Shing Yang Restaurant (PLC-101) | `assets/places/shing_yang_restaurant.webp` | photo | https://middleeastyellowpages.com/shing-yang-restaurant-authentic-chinese-japanese-cuisine-in-madinah-saudi-arabia-255 |
| Souq Al-Tabbakha (PLC-102) | `assets/places/souq_al_tabbakha.webp` | photo | https://visitmadinahsa.com/sa-ar/destinations/%D8%B3%D9%88%D9%82-%D8%A7%D9%84%D8%B7%D8%A8%D8%A7%D8%AE%D8%A9 |
| Swiss House (PLC-103) | `assets/places/swiss_house.webp` | photo | https://restaurantscorner.com/swiss-house/ |
| Tasty Burger Grille (PLC-104) | `assets/places/tasty_burger_grille.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Khatim/Restaurant/%D8%AA%D9%8A%D8%B3%D8%AA%D9%8A-%D8%A8%D9%8A%D8%B1%D8%AC%D8%B1-%D8%AC%D8%B1%D9%8A%D9%84-Tasty-Burger-Grille/store/22c0b31 |
| The Moghul Room (The Oberoi, Madina) (PLC-105) | `assets/places/the_moghul_room.webp` | photo | https://wanderlog.com/place/details/1162366/the-moghul-room |
| Tokushi - Sushi House (PLC-106) | `assets/places/tokushi_sushi_house.webp` | photo | https://www.ksa.directory/tokushi-sushi-house/i/1282 |
| Wesal Bukhari Restaurant (PLC-107) | `assets/places/wesal_bukhari_restaurant.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Ar-Ranuna/Restaurant/Wesal-Bukhari-Restaurant/store/229bbc3 |
| Zaitoon Restaurant (PLC-108) | `assets/places/zaitoon_restaurant.webp` | photo | https://ar.tripadvisor.com/Restaurants-g298551-Medina_Al_Madinah_Province.html |
| Zaman Jaddi (PLC-109) | `assets/places/zaman_jaddi.webp` | photo | https://www.visitsaudi.com/en/madinah/attractions/zaman-jaddi |
| 44X Specialty Coffee (PLC-110) | `assets/places/44x_specialty_coffee.webp` | photo | https://www.tripadvisor.com/Restaurant_Review-g298551-d19094918-Reviews-44X_Specialty_Coffee-Medina_Al_Madinah_Province.html |
| Aletta Cafe (PLC-111) | `assets/places/aletta_cafe.webp` | photo | https://discoverharamain.com/places-to-eat/madinah |
| Coffee 20GM (PLC-112) | `assets/places/coffee_20gm.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Quba/Restaurant/%D9%85%D9%82%D9%87%D9%89-%D8%B9%D8%B4%D8%B1%D9%8A%D9%86-%D8%AC%D9%85-Coffee-20gm/store/228bb97 |
| Coffee Selham (PLC-113) | `assets/places/coffee_selham.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Haram-Medina/Restaurant/%D9%85%D9%82%D9%87%D9%89-%D8%B3%D9%84%D9%87%D9%85/store/2297160 |
| Dose Cafe (Madinah) (PLC-114) | `assets/places/dose_cafe.webp` | logo | supplied brand collection |
| Etruh Cafe (PLC-115) | `assets/places/etruh_cafe.webp` | photo | https://www.tripadvisor.com/Restaurant_Review-g298551-d25303360-Reviews-Etruh-Medina_Al_Madinah_Province.html |
| Fragrance Cafe (PLC-116) | `assets/places/fragrance_cafe.webp` | photo | https://5e7a61fb427ad.site123.me |
| Khasamah Coffee (PLC-117) | `assets/places/khasamah_coffee.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Zahra-Medina/Restaurant/%D8%AE%D8%B2%D8%A7%D9%85%D8%A9-%D9%82%D9%87%D9%88%D8%A9-%D9%85%D8%AE%D8%AA%D8%B5%D9%87/store/22b4118 |
| Kiffa (PLC-118) | `assets/places/kiffa.webp` | photo | https://discoverharamain.com/places-to-eat/madinah |
| Madiniat Cafe (PLC-119) | `assets/places/madiniat_cafe.webp` | photo | https://www.arabnews.com/saudi-arabia/madinah-cafe-revives-citys-good-old-days-1632636 |
| Molten Chocolate Cafe (PLC-120) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Namq Cafe (Sultanah Gardens Mall) (PLC-121) | `assets/places/namq_cafe.webp` | photo | https://www.tripzilla.id/rekomendasi-coffee-shop-viral-di-mekkah-dan-madinah/24630 |
| The Porch Cafe (PLC-122) | `assets/places/the_porch_cafe.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Zahra-Medina/Restaurant/The-Porch-Cafe/store/22bc849/photos |
| The Tea House (PLC-123) | `assets/places/the_tea_house.webp` | photo | https://wanderlog.com/place/details/1162345/the-tea-house |
| Tohfa Cafe (PLC-124) | `assets/places/tohfa_cafe.webp` | photo | https://www.arabnews.com/food-health/review-tohfa-cafe-in-madinah-2228806 |
| Al Maktaba Al Asriya (Modern Library) (PLC-125) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Al Manar Mall (PLC-126) | `assets/places/al_manar_mall.webp` | photo | https://sa.wingie.com/en/blog/best-malls-and-souqs-in-madinah/ |
| Al Noor Mall (Cenomi Al Noor Mall) (PLC-127) | `assets/places/al_noor_mall.webp` | photo | https://www.visitsaudi.com/fr/madinah/attractions/al-noor-mall |
| Al-Rashid Mega Mall (PLC-128) | `assets/places/al_rashid_mega_mall.webp` | photo | https://sa.wingie.com/en/blog/top-attractions-in-madinah/ |
| Bilal Market (PLC-129) | `assets/places/bilal_market.webp` | photo | https://mindtrip.ai/attraction/medina-al-madinah/masjid-bilal-market/at-dTRmLTf3 |
| Central Dates Market (Souq Al Tumor) (PLC-130) | `assets/places/central_dates_market.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Fath-Medina/Other/Al-Haidari-Dates/store/2291ba9 |
| Dawoodia Market (PLC-131) | `assets/places/dawoodia_market.webp` | photo | https://mindtrip.ai/attraction/medina-al-madinah/dawoodia-market/at-RiEXaU2I |
| Lulu Express Madinah (PLC-132) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Lulu Hypermarket Madinah (King Khalid Road) (PLC-133) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Old Bazaar (Souq Al-Qadim) (PLC-134) | `assets/places/old_bazaar.webp` | photo | https://www.tripadvisor.com.ar/Attraction_Review-g298551-d319510-Reviews-Old_Bazaar-Medina_Al_Madinah_Province.html |
| Souq Al Manakha (PLC-135) | `assets/places/souq_al_manakha.webp` | photo | https://www.spa.gov.sa/1643997 |
| Souq Suwaiqah (PLC-136) | `assets/places/souq_suwaiqah.webp` | photo | https://visitmadinahsa.com/sa-ar/destinations/%D8%B3%D9%88%D9%82-%D8%B3%D9%88%D9%8A%D9%82%D8%A9- |
| Taiba Commercial Centre (Taiba Mall) (PLC-137) | `assets/places/taiba_commercial_centre.webp` | photo | https://www.tripadvisor.co.id/Attraction_Review-g298551-d10597144-Reviews-Taiba_Commercial_Center-Medina_Al_Madinah_Province.html |
| Thaqafa Library (bookstore) (PLC-138) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Al-Khalidiyah Park (PLC-139) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Empire Cinemas - Al Rashid Mall (PLC-140) | `assets/places/empire_cinemas_al_rashid_mall.webp` | photo | https://muslim.okezone.com/read/2024/06/26/398/3026123/empire-cinemas-bioskop-mewah-satu-satunya-di-kota-nabi-muhammad |
| Jabal Ohud Garden (PLC-141) | `assets/places/jabal_ohud_garden.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Prince-Mohammed-bin-Abdulaziz-Park |
| King Fahd Central Park (PLC-142) | `assets/places/king_fahd_central_park.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/King-Fahd-Park |
| Madinah Boulevard (PLC-143) | `assets/places/madinah_boulevard.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Madinah-Boulevard |
| Al-Ansar Club (PLC-144) | `assets/places/al_ansar_club.webp` | photo | https://www.europlan-online.de/al-ansar-club-stadium/stadion-85062.html |
| Al-Qaswa Walking Trail (PLC-145) | `assets/places/al_qaswa_walking_trail.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/Al-Qaswa-Walking-Trail |
| Ohud Club (PLC-146) | `assets/places/ohud_club.webp` | photo | https://nabd.com/s/122591764-85e0a9/%D9%85%D8%B5%D8%A7%D8%AF%D8%B1-%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9-%D8%A3%D8%AD%D8%AF-%D9%88%D8%A7%D9%84%D9%86%D8%B5%D8%B1-%D9%81%D9%8A-%D9%83%D8%A3%D8%B3-%D8%AE%D8%A7%D8%AF%D9%85-%D8%A7%D9%84%D8%AD%D8%B1%D9%85%D9%8A%D9%86-%D8%A7%D9%84%D8%B4%D8%B1%D9%8A%D9%81%D9%8A%D9%86-%D8%B3%D8%AA%D9%82%D8%A7%D9%85-%D8%B9%D9%84%D9%89-%D9%85%D9%84%D8%B9%D8%A8-%D9%86%D8%A7%D8%AF%D9%8A-%D8%A3%D8%AD%D8%AF-%D9%88%D8%A7%D9%84%D8%B0%D9%8A-%D9%8A%D8%B3%D8%AA%D9%88%D8%B9%D8%A8-5000-%D8%A7%D9%84%D8%A2%D9%81-%D9%85%D8%B4%D8%AC%D8%B9-%D9%86%D8%B8%D8%B1%D8%A7-%D9%84%D8%A3%D9%86-%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D8%A3%D9%85%D9%8A%D8%B1-%D9%85%D8%AD%D9%85%D8%AF-%D8%A8%D9%86-%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2-%D8%A8%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9-%D8%AA%D8%AE%D8%B6%D8%B9-%D9%84%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9-%D8%AD%D8%A7%D9%84%D9%8A%D8%A7 |
| Padel Side (PLC-147) | `assets/places/padel_side.webp` | photo | https://magicpin.com/saudi-arabia/Medina/Al-Difa/Other/%D8%A8%D8%A7%D8%AF%D9%84-%D8%B3%D8%A7%D9%8A%D8%AF-%7C-Padel-Side/store/22a90ab |
| Prince Mohammed bin Abdulaziz Sports City (Stadium) (PLC-148) | `assets/places/prince_mohammed_bin_abdulaziz_sports_city.webp` | photo | https://www.europlan-online.de/prince-mohammed-bin-abdul-aziz-stadium/stadion-7294.html |
| Al-Madinah Al-Munawwarah Research and Studies Center (PLC-149) | `assets/places/al_madinah_al_munawwarah_research_and_studies_center.webp` | photo | https://www.spa.gov.sa/1120974 |
| Islamic University of Madinah (PLC-150) | `assets/places/islamic_university_of_madinah.webp` | photo | https://iu.edu.sa/en-us |
| King Abdulaziz Complex for Endowment Libraries (PLC-151) | `assets/places/king_abdulaziz_complex_for_endowment_libraries.webp` | photo | https://www.spa.gov.sa/2120552 |
| King Abdulaziz Library, Madinah (PLC-152) | — | category tile | no verified photograph (see `assets/madinah/MISSING.txt`) |
| Prophet's Mosque Library (PLC-153) | `assets/places/prophets_mosque_library.webp` | photo | https://visitmadinahsa.com/sa-en/destinations/The-Prophet's-Mosque-Library |
| Saudi Electronic University - Madinah Branch (PLC-154) | `assets/places/saudi_electronic_university_madinah_branch.webp` | photo | https://seu.edu.sa/ar/centers/madinah/news/290823/ |
| Taibah University (PLC-155) | `assets/places/taibah_university.webp` | photo | https://saudipedia.com/en/taibah-university |
| Al-Ansar Hospital (PLC-156) | `assets/places/al_ansar_hospital.webp` | photo | https://sehaguide.com/en/Item/9112/Al-Ansar-Hospital |
| Al-Miqat General Hospital (PLC-157) | `assets/places/al_miqat_general_hospital.webp` | photo | https://www.okaz.com.sa/local/na/1723817 |
| Al-Salam Endowment Hospital (PLC-158) | `assets/places/al_salam_endowment_hospital.webp` | photo | https://rafed.alshefa.sa/projects/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89-%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85-%D8%A7%D9%84%D9%88%D9%82%D9%81%D9%8A-%D8%A8%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9/ |
| Dr. Soliman Fakeeh Hospital Madina (PLC-159) | `assets/places/dr_soliman_fakeeh_hospital_madina.webp` | photo | https://dsfhmadinah.fakeeh.care/en |
| King Fahd Hospital, Madinah (PLC-160) | `assets/places/king_fahd_hospital_madinah.webp` | photo | https://www.spa.gov.sa/en/N2085287 |
| King Salman Medical City, Madinah (PLC-161) | `assets/places/king_salman_medical_city_madinah.webp` | photo | https://www.insuwrap.com/project/king-salman-medical-city |
| Madina National Hospital (PLC-162) | `assets/places/madina_national_hospital.webp` | photo | https://sehaguide.com/en/Item/9353/Madina-National-Hospital |
| Madinah Bus (public transport) (PLC-163) | `assets/places/madinah_bus.webp` | photo | https://www.arabnews.com/node/2011291/business-economy |
| Madinah Hop-On Hop-Off Sightseeing Bus (PLC-164) | `assets/places/madinah_hop_on_hop_off_sightseeing_bus.webp` | photo | https://www.headout.com/hop-on-hop-off-bus-tours/al-madinah-hop-on-hop-off-bus-tour-e-20036/ |
| Madinah Region Municipality (Amanah) (PLC-165) | `assets/places/madinah_region_municipality.webp` | photo | https://services.amana-md.gov.sa/EAOffice/ |
| Ohud Hospital (PLC-166) | `assets/places/ohud_hospital.webp` | photo | https://www.ksa.directory/ohud-hospital/i/568 |
| Prince Mohammad bin Abdulaziz International Airport (PLC-167) | `assets/places/prince_mohammad_bin_abdulaziz_international_airport.webp` | photo | https://jambiindependent.disway.id/amp/710477/ribuan-jemaah-umrah-tertahan-di-bandara-serangan-asisrael-ke-iran-lumpuhkan-penerbangan-timur-tengah |
| Prince Mohammed bin Abdulaziz Hospital (National Guard Health Affairs) (PLC-168) | `assets/places/prince_mohammed_bin_abdulaziz_hospital.webp` | photo | https://www.spa.gov.sa/1486253 |
| Saudi German Hospital Madinah (PLC-169) | `assets/places/saudi_german_hospital_madinah.webp` | photo | https://en.saudishopper.com.sa/saudi-german-health-advances-digital-healthcare-services-with-nutanix/ |
| Al Rayyan Hotel (Qiba Road) (PLC-170) | `assets/places/al_rayyan_hotel.webp` | photo | https://www.hotels.com/ho3629892864/ |
| Anwar Al Madinah Mövenpick Hotel (PLC-171) | `assets/places/anwar_al_madinah_movenpick_hotel.webp` | photo | https://www.expedia.com/Medina-Hotels-Anwar-Al-Madinah-Movenpick-Hotel.h2770302.Hotel-Information |
| Crowne Plaza Madinah (PLC-172) | `assets/places/crowne_plaza_madinah.webp` | photo | https://www.ihg.com/crowneplaza/hotels/us/en/madinah/medin/hoteldetail |
| Dar Al Taqwa Hotel Madinah (PLC-173) | `assets/places/dar_al_taqwa_hotel_madinah.webp` | photo | https://www.taqwamadinah.com/ |
| DoubleTree by Hilton Madinah Gate (PLC-174) | `assets/places/doubletree_by_hilton_madinah_gate.webp` | photo | https://www.hotels.com/ho3850690848/doubletree-by-hilton-madinah-gate/ |
| Elaf Al Taqwa Hotel (PLC-175) | `assets/places/elaf_al_taqwa_hotel.webp` | photo | https://www.medina-hotels-sa.com/en/property/elaf-al-taqwa-hotel.html |
| Elaf Taiba Hotel (PLC-176) | `assets/places/elaf_taiba_hotel.webp` | photo | https://www.elafhotels.com/ |
| Eqamh Etlala El Quba (PLC-177) | `assets/places/eqamh_etlala_el_quba.webp` | photo | https://thevendry.com/venue/445671/eqamh-etlala-qubaa-%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9-saudi-arabia |
| Frontel Al Harithia Hotel (PLC-178) | `assets/places/frontel_al_harithia_hotel.webp` | photo | https://loveumrah.com/hotel/Frontel-AlHarithia |
| Hafawah Suites (PLC-179) | `assets/places/hafawah_suites.webp` | photo | https://hafawah-suites.hotels-saudi-arabia.com/ar/ |
| InterContinental Dar Al Hijra Madinah (PLC-180) | `assets/places/intercontinental_dar_al_hijra_madinah.webp` | photo | https://www.ihg.com/intercontinental/hotels/gb/en/madinah/medhb/hoteldetail.html?scmisc=WEB-_-6C-_-IMEA-_-QE-_-REV-_-KSA-Umrah-_-LNK-_-MEDHB |
| InterContinental Madinah Dar Al Iman (PLC-181) | `assets/places/intercontinental_madinah_dar_al_iman.webp` | photo | https://www.haramaincompanion.com/ |
| Lumian Hotel Madinah (PLC-182) | `assets/places/lumian_hotel_madinah.webp` | photo | https://www.booking.com/hotel/sa/fndq-lwmyn-lumian.ar.html |
| Madinah Hilton (PLC-183) | `assets/places/madinah_hilton.webp` | photo | https://halalbooking.com/en/madinah-hilton/p/66794 |
| Marriott Executive Apartments Madinah (PLC-184) | `assets/places/marriott_executive_apartments_madinah.webp` | photo | https://www.marriott.com/en-us/hotels/meder-marriott-executive-apartments-madinah/photos/ |
| Millennium Al Aqeeq Hotel (PLC-185) | `assets/places/millennium_al_aqeeq_hotel.webp` | photo | https://www.medina-hotels-sa.com/ar/property/millennium-al-aqeeq-hotel.html |
| Millennium Madinah Airport (PLC-186) | `assets/places/millennium_madinah_airport.webp` | photo | https://www.millenniumhotels.com/en/madinah/millennium-madinah-airport/ |
| Pullman Zamzam Madina (PLC-187) | `assets/places/pullman_zamzam_madina.webp` | photo | https://all.accor.com/hotel/9245/index.ar.shtml |
| Radisson Hotel Madinah (PLC-188) | `assets/places/radisson_hotel_madinah.webp` | photo | https://www.radissonhotels.com/en-us/destination/saudi-arabia/madinah |
| Rasia Hotel Madinah (PLC-189) | `assets/places/rasia_hotel_madinah.webp` | photo | https://www.expedia.ae/Madinah-Hotels-Rasia-Hotel-Madinah.h114727015.Hotel-Information |
| Sofitel Shahd Al Madinah (PLC-190) | `assets/places/sofitel_shahd_al_madinah.webp` | photo | https://www.medina-hotels-sa.com/en/property/shaza-al-madina.html |
| Taiba Front Hotel (PLC-191) | `assets/places/taiba_front_hotel.webp` | photo | https://www.hotels.com/ho2957742336/taiba-front-hotel-dixcove-ghana/ |
| The Oberoi, Madina (PLC-192) | `assets/places/the_oberoi_madina.webp` | photo | https://www.roamsaudi.com/blog/hotels-for-all-budgets-at-walking-distance-of-al-nabawi/ |
| View Al Madinah Hotel (PLC-193) | `assets/places/view_al_madinah_hotel.webp` | photo | https://www.medina-hotels-sa.com/en/property/view-al-madinah.html |
| Hayat Charity Association, Madinah (PLC-194) | `assets/places/hayat_charity_association_madinah.webp` | photo | https://www.hayat.org.sa/gallery/%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D8%AC-%D8%A7%D9%84%D9%82%D9%88%D8%A7%D9%81%D9%84-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A%D8%A9-/ |
| Madinah Health Affairs 'Sawaed' Volunteer Programme (PLC-195) | `assets/places/madinah_health_affairs_sawaed_volunteer_programme.webp` | photo | https://www.alyaum.com/articles/6471155/%D8%A7%D9%84%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1/%D8%A7%D9%84%D9%85%D9%85%D9%84%D9%83%D8%A9-%D8%A7%D9%84%D9%8A%D9%88%D9%85/%D8%B3%D9%88%D8%A7%D8%B9%D8%AF-%D8%A7%D9%84%D8%B5%D8%AD%D8%A9-%D9%84%D8%AE%D8%AF%D9%85%D8%A9-%D9%83%D8%A8%D8%A7%D8%B1-%D8%A7%D9%84%D8%B3%D9%86-%D9%85%D9%86-%D8%B6%D9%8A%D9%88%D9%81-%D8%A7%D9%84%D8%B1%D8%AD%D9%85%D9%86-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9-%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9 |
| Madinah Warehouse Charity Association (PLC-196) | `assets/places/madinah_warehouse_charity_association.webp` | photo | https://x.com/almstwda |
| Prophet's Mosque Volunteer Programme (PLC-197) | `assets/places/prophets_mosque_volunteer_programme.webp` | photo | https://almoarekhsaudi.com/%D8%A7%D9%84%D8%AA%D8%B7%D9%88%D9%91%D8%B9-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF-%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A-%D8%B4%D8%B1%D9%81-%D8%A7%D9%84%D9%85%D9%83%D8%A7%D9%86-%D9%88%D8%A3/ |

## Library

The library also illustrates the Market's demo products and City Opportunities' demo homes and business opportunities.
None of those photographs shows the actual product, home, building or project; each is a generic subject photo.

Generic subject photographs for illustrative records (dishes, coffee, crafts, books, halls, palms, desert terrain). None shows
an identifiable place, and none is presented as a specific place. The library holds no photograph of Makkah
and no hotel-room photograph; the three illustrative stays show the stay category tile instead.

| File | Subject | Source | Creator | Licence / reuse basis | Classification |
|---|---|---|---|---|---|
| `assets/photos/coffee_black_cup.webp` | Lemongrass & Ginger tea. Pulled from garden. (generic) | https://www.flickr.com/photos/32552299@N04/6778001966 (Open Images V6 image `ac2a19be6aa6e088`) | Lucy Kalantari | CC BY 2.0 | Generic |
| `assets/photos/coffee_cup.webp` | cafe (generic) | https://www.flickr.com/photos/60986678@N08/5551396998 (Open Images V6 image `17416c467792e70f`) | berta_pastor | CC BY 2.0 | Generic |
| `assets/photos/coffee_cup_dark.webp` | Eric's Latte Art (generic) | https://www.flickr.com/photos/redbandcoffee/4877591846 (Open Images V6 image `7facac4942003401`) | Redband Coffee Co. | CC BY 2.0 | Generic |
| `assets/photos/coffee_latte_heart.webp` | Coffee love! (generic) | https://www.flickr.com/photos/dcadenas/5587600775 (Open Images V6 image `dcb9db5b0ab1bc7b`) | Daniel Cadenas | CC BY 2.0 | Generic |
| `assets/photos/coffee_latte_white.webp` | Mug Shots with George Howell (generic) | https://www.flickr.com/photos/breville/16913117516 (Open Images V6 image `a8b14d4a442bf4a8`) | Breville USA | CC BY 2.0 | Generic |
| `assets/photos/coffee_small_ornate.webp` | Turkish coffee (generic) | https://www.flickr.com/photos/absolutsara/17070965382 (Open Images V6 image `921f8ec5e40246cd`) | Sara D. | CC BY 2.0 | Generic |
| `assets/photos/craft_loom_frame.webp` | P1040182.JPG (generic) | https://www.flickr.com/photos/bradspry/4736630383 (Open Images V6 image `2e80e093d1965563`) | Brad Spry | CC BY 2.0 | Generic |
| `assets/photos/craft_loom_hands.webp` | Hands in Motion (generic) | https://www.flickr.com/photos/kretyen/5953163896 (Open Images V6 image `0c0d68281631c4eb`) | Ken Bosma | CC BY 2.0 | Generic |
| `assets/photos/craft_pottery_bowls.webp` | Rustic pots and dishes (generic) | https://www.flickr.com/photos/bonitalabanane/2472056158 (Open Images V6 image `65892cd9e4f9852b`) | Bonita de Boer | CC BY 2.0 | Generic |
| `assets/photos/craft_pottery_wheel.webp` | Hágalo usted mismo (generic) | https://www.flickr.com/photos/solrobayo/2960806084 (Open Images V6 image `ab552f0453075570`) | Sol Robayo | CC BY 2.0 | Generic |
| `assets/photos/craft_pottery_wheel2.webp` | North Carolina Potter (generic) | https://www.flickr.com/photos/46183897@N00/3492636579 (Open Images V6 image `f02e5fa4cf9459c7`) | Robert Nunnally | CC BY 2.0 | Generic |
| `assets/photos/food_bakery_rounds.webp` | ... Faschingkrapfen im Café Luitpold ... (generic) | https://www.flickr.com/photos/14646075@N03/5506895777 (Open Images V6 image `ca0c7a2b10950385`) | digital cat | CC BY 2.0 | Generic |
| `assets/photos/food_bowl.webp` | Bowl meal with fresh sides (generic) | https://unsplash.com/photos/1SPu0KT-Ejg (file via github.com/aloukikjoshi/Restaurant-website images/edgar-castrejon-1SPu0KT-Ejg-unsplash.jpg) | Edgar Castrejon | Unsplash License | Generic |
| `assets/photos/food_bread_loaf.webp` | it's about the crust (generic) | https://www.flickr.com/photos/yutakaseki/16971567450 (Open Images V6 image `519802347d9a5fcf`) | Yutaka Seki | CC BY 2.0 | Generic |
| `assets/photos/food_grill.webp` | Grilled meat on a board (generic) | https://github.com/adeeshperera/restaurant-website-template/blob/main/assets/img/team/8.jpg | not recorded by the source | Repository is Apache-2.0; photograph origin not recorded | Generic |
| `assets/photos/food_platter_rice.webp` | Rice platter with sides (generic) | https://github.com/adeeshperera/restaurant-website-template/blob/main/assets/img/team/1.jpg | not recorded by the source | Repository is Apache-2.0; photograph origin not recorded | Generic |
| `assets/photos/food_platter_sides.webp` | Rice dish with accompaniments (generic) | https://github.com/adeeshperera/restaurant-website-template/blob/main/assets/img/team/3.jpg | not recorded by the source | Repository is Apache-2.0; photograph origin not recorded | Generic |
| `assets/photos/food_prep_hands.webp` | Hands preparing food in a kitchen (generic) | https://www.pexels.com/photo/8951136/ (file via github.com/aloukikjoshi/Restaurant-website images/pexels-ivan-samkov-8951136.jpg) | Ivan Samkov | Pexels License | Generic |
| `assets/photos/food_shared_table.webp` | Shared table: curries, rice, flatbread (generic) | https://github.com/adeeshperera/restaurant-website-template/blob/main/assets/img/slider/1.jpg | not recorded by the source | Repository is Apache-2.0; the photograph's own origin is not recorded | Generic |
| `assets/photos/food_skewers_grill.webp` | DSCF1978 (generic) | https://www.flickr.com/photos/liormasculine/4364686222 (Open Images V6 image `c479a061acbf7ee6`) | Liormasculine | CC BY 2.0 | Generic |
| `assets/photos/food_skewers_tray.webp` | veggie kabobs (generic) | https://www.flickr.com/photos/gottshar/17316948902 (Open Images V6 image `2bdfe9748821f5d0`) | SharonaGott | CC BY 2.0 | Generic |
| `assets/photos/garden_palm_grove.webp` | Palm grove with planted beds (generic) | https://www.flickr.com/photos/masterplaan/3784809202/ (Open Images V6 image `7a3a82c259dc7d72`) | Joonas Plaan | CC BY 2.0 | Generic |
| `assets/photos/hall_auditorium.webp` | Auditorium seating and stage (generic) | https://www.flickr.com/photos/u-suke/2682177354 (Open Images V6 image `78d3d0b88b2fa091`) | Yusuke Kawasaki | CC BY 2.0 | Generic |
| `assets/photos/hall_seats_white.webp` | Small hall with white seats (generic) | https://www.flickr.com/photos/98360501@N03/14885801152 (Open Images V6 image `3c6e2a7df352f53b`) | cruisedotco | CC BY 2.0 | Generic |
| `assets/photos/hall_theatre.webp` | Theatre stage and seating (generic) | https://www.flickr.com/photos/cpflcultura/3794861209 (Open Images V6 image `c53e9e5ce002345f`) | CPFL Cultura | CC BY 2.0 | Generic |
| `assets/photos/heritage_lantern.webp` | Ornate wall lantern and carved lattice (generic) | https://www.flickr.com/photos/kewl/5315696058 (Open Images V6 image `1f0e7b8d37fec45b`) | Tristan Schmurr | CC BY 2.0 | Generic |
| `assets/photos/kids_play_frame.webp` | Children's climbing frame (generic) | https://www.flickr.com/photos/62030038@N02/8400425275 (Open Images V6 image `275a14535ec8b689`) | Hobbies on a Budget | CC BY 2.0 | Generic |
| `assets/photos/library_old_books.webp` | Book Stacks (generic) | https://www.flickr.com/photos/monkeymyshkin/468730533 (Open Images V6 image `cf2b1577b88dae7e`) | MonkeyMyshkin | CC BY 2.0 | Generic |
| `assets/photos/library_reading_room.webp` | Librería Desnivel de Madrid (generic) | https://www.flickr.com/photos/ofernandezberrios/7899374124 (Open Images V6 image `bb10f3e84b54bfc7`) | Olga Berrios | CC BY 2.0 | Generic |
| `assets/photos/library_shelves.webp` | Book Barn (generic) | https://www.flickr.com/photos/chillihead/1778980935 (Open Images V6 image `7566d3b732a9e208`) | Chilli Head | CC BY 2.0 | Generic |
| `assets/photos/market_dates.webp` | Dates in a glass bowl (generic) | https://www.flickr.com/photos/raucousrage/16226438781 (Open Images V6 image `2114f350f99f5b90`) | Laura Hadden | CC BY 2.0 | Generic |
| `assets/photos/museum_diorama.webp` | Museum gallery with lit display cases (generic) | https://www.flickr.com/photos/dugsong/4168000887 (Open Images V6 image `12380704ef402ba8`) | Dug Song | CC BY 2.0 | Generic |
| `assets/photos/outdoor_desert_peak.webp` | Conical peak in open desert (generic terrain, location not identifiable) | https://www.flickr.com/photos/mikewise/491595084 (Open Images V6 image `76466b5d007e49db`) | Mike Seidman | CC BY 2.0 | Generic |
| `assets/photos/outdoor_desert_peak2.webp` | Desert plain with a distant mountain (generic terrain, location not identifiable) | https://www.flickr.com/photos/mattkrause/8124916391 (Open Images V6 image `6b8b527a9b230af2`) | Matt Krause | CC BY 2.0 | Generic |
| `assets/photos/sport_bike_tyre.webp` | Mountain-bike wheel (generic) | https://www.flickr.com/photos/sharadaprasad/3668313524 (Open Images V6 image `65d11302b2f7d6d1`) | Sharada Prasad CS | CC BY 2.0 | Generic |
| `assets/photos/sport_pool.webp` | Swimming-pool water — cropped to the water only; the source's sea view is left out (generic) | https://www.flickr.com/photos/noramorgan/11900033975 (Open Images V6 image `5377c7f4cf087d12`) | Nora Morgan | CC BY 2.0 | Generic |
| `assets/photos/volunteer_water_caps.webp` | Bottled water (generic) | https://www.flickr.com/photos/smithser/7239957418 (Open Images V6 image `ee322603860d9c7a`) | Brian Smithson | CC BY 2.0 | Generic |
| `assets/photos/home_bedroom.webp` | Furnished bedroom (generic) — studio for a longer stay | https://www.flickr.com/photos/claudiof/3942882452/ (Open Images V6 image `040f7caee109ab4b`) | Cláudio Franco | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/home_building.webp` | Apartment building, upper floors (generic; signage cropped out) | https://www.flickr.com/photos/dpu-ucl/8103061911 (Open Images V6 image `4eb2d5eda933a95c`) | Development Planning Unit University College London | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/home_furnished.webp` | Furnished living room (generic) | https://www.flickr.com/photos/94455939@N07/9421545611 (Open Images V6 image `61ef9eef568ab880`) | Carl Mattone | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/home_living_bright.webp` | Bright living room (generic) | https://www.flickr.com/photos/teammakepeace/5243275759 (Open Images V6 image `2e3ff32cd2fe4db9`) | Caz and Craig Makepeace | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/home_villa.webp` | Stone villa façade with arches (generic; cropped to the façade) | https://www.flickr.com/photos/vandelaak/4668367815 (Open Images V6 image `23f033ee6e5e7da4`) | Arthur & Grace van de Laak | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/opp_cafe.webp` | Café interior (generic) | https://www.flickr.com/photos/kid_pro_quo/112180111 (Open Images V6 image `405ca7534c7be71e`) | Allan Ferguson | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/opp_construction.webp` | Tower cranes over a building site (generic) | https://www.flickr.com/photos/zven-ug/6015635990 (Open Images V6 image `1947e5e9c2c42985`) | zven-ug | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/opp_hotel.webp` | Low-rise hotel with a pool (generic) | https://flickr.com/97402086@N00/12162868025 (Open Images V6 image `1b2042d4fe53aa21`) | Nan Palmero | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/opp_retail.webp` | Two-storey commercial building (generic) | https://www.flickr.com/photos/regnatarajan/9810438335 (Open Images V6 image `2ea8ea28f7503202`) | Reg Natarajan | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/prod_dates_fresh.webp` | Fresh dates on the palm (generic) | https://www.flickr.com/photos/tenerife/262588370 (Open Images V6 image `996cbf52b5fa3b4f`) | secrettenerife.co.uk | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/prod_dates_gift.webp` | Dates (generic) | https://www.flickr.com/photos/4blogs/6282206735 (Open Images V6 image `297d7da9847ca660`) | Kathy McGraw | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/prod_perfume.webp` | Perfume bottles (generic) | https://www.flickr.com/photos/jplouis/5024354220/ (Open Images V6 image `740341a8283e07d4`) | Jean-Pierre Louis | CC BY 2.0 | Generic — Market and City Opportunities demo content |
| `assets/photos/prod_prayer_beads.webp` | Prayer beads (generic) | https://www.flickr.com/photos/elifayse/42473842 (Open Images V6 image `9e8080a638993c49`) | elif ayse | CC BY 2.0 | Generic — Market and City Opportunities demo content |

## Reuse basis

The Madinah photographs and logos were collected for this prototype from the pages listed above; their rights rest with
their owners. Before any public release, confirm the rights for every file, keep the rules above, and replace any file
whose terms do not allow reuse.
