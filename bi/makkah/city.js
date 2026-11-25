/* Rihab BI — the city: Makkah. Read by every script before the model is built.
   Names, identity, the simulation's city-specific behaviour and "Ask the data" aliases. */
window.RIHAB_BI_CITY = {
  id: "makkah",
  other: "madinah",
  terms: {
    city: { ar: "مكة", en: "Makkah" },
    cityFull: { ar: "مكة المكرمة", en: "Makkah" },
    cityPoss: { ar: "مكة", en: "Makkah's" },
    app: { ar: "رحاب مكة", en: "Rihab Makkah" },
    other: { ar: "المدينة المنورة", en: "Madinah" },
    otherApp: { ar: "رحاب المدينة", en: "Rihab Madinah" },
    all: { ar: "كل مكة", en: "All of Makkah" },
    allLower: { ar: "كل مكة", en: "all of Makkah" },
    cityWide: { ar: "على مستوى مكة", en: "City-wide" },
    opps: { ar: "فرص مكة", en: "Makkah Opportunities" },
    live: { ar: "عِش في مكة", en: "Live in Makkah" },
    invest: { ar: "استثمر في مكة", en: "Invest in Makkah" },
    mosque: { ar: "المسجد الحرام", en: "the Grand Mosque" },
    Mosque: { ar: "المسجد الحرام", en: "The Grand Mosque" },
    centre: { ar: "المنطقة المحيطة بالحرم", en: "The area around the Haram" },
    heart: { ar: "المنطقة المحيطة بالمسجد الحرام", en: "The area around the Grand Mosque" },
    exampleArea: { ar: "العزيزية", en: "Al-Aziziyah" },
  },
  mosqueAt: { x: 0.5, y: 0.52 },
  centralZone: "haram-area",
  wordmark: (size, light, latin) => '<div class="wordmark mk' + (light ? " light" : "") + '" style="--wm:' + size + 'px" data-wordmark><div class="wm-mk" dir="ltr" lang="en">Rihab <b>Makkah</b></div><div class="wm-rule" aria-hidden="true"></div>' + (latin ? '<div class="wm-mk-ar" dir="rtl" lang="ar">رحاب مكة</div>' : "") + "</div>",
  model: {
    /* pilgrims fill Makkah for Ramadan's last ten nights and through the Hajj days */
    visitorSeason: { ramadan: 1.85, last10: 2.6, eidFitr: 1.35, preHajj: 1.6, hajjDays: 1.9, postHajj: 1.2 },
    residentHajj: 1.18,
    temp: [1.3, 1.3, 1.12, 0.95, 0.8, 0.6, 0.55, 0.55, 0.75, 0.95, 1.12, 1.3],
    zoneAffV: { "haram-area": 2.6, ajyad: 1.8, misfalah: 1.4, aziziyah: 1.35, jarwal: 1.2, shisha: 1.1, tanim: 1.25, kakiyah: 0.85, zahir: 0.9, cw: 1 },
    zoneAffR: { "haram-area": 0.45, ajyad: 0.6, cw: 0.85 },
    landmark: { haram: 2.6, hira: 1.6, "kiswa-complex": 1.5, "jabal-nour": 1.4 },
    hosted: "x-family-host",
    seasonalProduct: null,
    chipPref: [
      { awali: 1.5, naseem: 1.4, shawqiyah: 1.35, aziziyah: 1.3, rusayfah: 1.2, zahir: 1.1, kakiyah: 1.0, hijrah: 1.0, shisha: 1.0, tanim: 0.9, bathaquraish: 0.9, jarwal: 0.8, misfalah: 0.7, ajyad: 0.5, "haram-area": 0.4 },
      { "haram-area": 1.8, ajyad: 1.6, misfalah: 1.3, aziziyah: 1.3, jarwal: 1.1, shisha: 1.0, kakiyah: 0.8, zahir: 0.7, awali: 0.6, naseem: 0.5, rusayfah: 0.5, shawqiyah: 0.5, hijrah: 0.4, bathaquraish: 0.5, tanim: 0.6 },
    ],
    centers: [
      { id: "vc-haram", nb: "haram-area", desks: 16, base: 460, name: { ar: "مركز الزوار — حول الحرم", en: "Visitor Center — Around the Haram" } },
      { id: "vc-ajyad", nb: "ajyad", desks: 7, base: 190, name: { ar: "نقطة الزوار — أجياد", en: "Visitor point — Ajyad" } },
      { id: "vc-aziziyah", nb: "aziziyah", desks: 6, base: 160, name: { ar: "نقطة الزوار — العزيزية", en: "Visitor point — Al-Aziziyah" } },
      { id: "vc-misfalah", nb: "misfalah", desks: 4, base: 115, name: { ar: "نقطة الزوار — المسفلة", en: "Visitor point — Al-Misfalah" } },
      { id: "vc-tanim", nb: "tanim", desks: 3, base: 80, name: { ar: "نقطة الزوار — التنعيم", en: "Visitor point — Al-Tan'eem" } },
      { id: "vc-rusayfah", nb: "rusayfah", desks: 2, base: 55, name: { ar: "نقطة الزوار — محطة القطار بالرصيفة", en: "Visitor point — Al-Rusayfah rail station" } },
    ],
    vcZiyarah: { ar: "المشاعر والمعالم ومواعيدها", en: "Holy sites, landmarks and times" },
  },
  areaAliases: {
    "haram-area": ["حول الحرم", "الحرم", "المسجد الحرام", "المنطقة المركزية", "المركزية", "haram", "around the haram", "central area"], ajyad: ["أجياد", "اجياد", "ajyad"],
    misfalah: ["المسفلة", "مسفلة", "misfalah"], aziziyah: ["العزيزية", "aziziyah", "aziziya"], awali: ["العوالي", "awali"], shisha: ["الششة", "ششة", "shishah", "shisha"],
    shawqiyah: ["الشوقية", "shawqiyah", "shawqiya"], naseem: ["النسيم", "naseem"], bathaquraish: ["بطحاء قريش", "batha quraish", "bat-ha quraish"], hijrah: ["الهجرة", "hijrah", "hijra"],
    zahir: ["الزاهر", "zahir"], kakiyah: ["الكعكية", "kakiyah"], jarwal: ["جرول", "jarwal"], rusayfah: ["الرصيفة", "rusayfah", "rusaifah"], tanim: ["التنعيم", "tanim", "tan'eem", "taneem"],
  },
  /* Rihab Makkah's palette: Makkah green for residents, brass gold for visitors, clay, and
     distinct supporting hues; ramps run in green and gold, growth diverges clay ↔ green */
  palette: {
    S: ["#2F6B55", "#B07A1F", "#A65F45", "#2B7A93", "#9C3D54", "#6B5CA5", "#6F8A2A", "#8C4A7A"],
    SEQ: ["#E7F0EC", "#C8DDD3", "#A0C4B3", "#74A68F", "#4F8A71", "#2F6B55", "#21503F", "#16382C"],
    SEQ_B: ["#F7EEDC", "#EEDBB4", "#E2C487", "#D2AA5B", "#C08F36", "#B07A1F", "#8C5F16", "#66450F"],
    DIV: ["#8A3B26", "#A65F45", "#D7A796", "#EEEAE2", "#A3C4B5", "#4F8A71", "#21503F"],
    brand: "#17463A",
  },
};
