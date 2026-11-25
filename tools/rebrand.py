"""Rename a city app to its Rihab name in every text file of its folder.
  makkah:  EyeMakkah            → Rihab Makkah (English) · رحاب مكة (Arabic)
  madinah: Ruh Al Madinah       → Rihab Madinah · روح المدينة → رحاب المدينة
Code identifiers, internal tags, file names and demo emails follow. "EyeMakkah" is
Latin in both languages today, so each occurrence takes the language of the text
around it: Arabic text gets رحاب مكة, English text Rihab Makkah."""
import os, re, sys

CITY = sys.argv[1]
ROOT = sys.argv[2]
AR = re.compile(r"[؀-ۿ]")
TEXT = {".jsx", ".js", ".mjs", ".json", ".html", ".md", ".txt", ".py"}

def files():
    for d, dirs, fs in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in ("node_modules", "dist", ".git")]
        for f in fs:
            if os.path.splitext(f)[1] in TEXT:
                yield os.path.join(d, f)

def contextual(s, word, ar, en, md):
    """replace `word` by `ar` inside Arabic text and by `en` inside English text"""
    out, i = [], 0
    for m in re.finditer(re.escape(word), s):
        a, b = m.start(), m.end()
        if md:
            # docs: the nearest letters on either side decide
            left = re.findall(r"[A-Za-z؀-ۿ]", s[max(0, a - 14):a])
            right = re.findall(r"[A-Za-z؀-ۿ]", s[b:b + 14])
            near = (left[-1:] + right[:1])
            arabic = bool(near) and all(AR.match(c) for c in near)
        else:
            # code: the enclosing string or JSX text decides
            lo = max(s.rfind(c, 0, a) for c in ('"', "`", ">", "<", "\n"))
            his = [x for x in (s.find(c, b) for c in ('"', "`", "<", ">", "\n")) if x >= 0]
            hi = min(his) if his else len(s)
            arabic = bool(AR.search(s[lo + 1:hi]))
        out.append(s[i:a]); out.append(ar if arabic else en); i = b
    out.append(s[i:])
    return "".join(out)

if CITY == "makkah":
    EXACT = [
        ('Eye<span style={{ fontWeight: 700, color: T.brassSoft }}>Makkah</span>', 'Rihab{" "}<span style={{ fontWeight: 700, color: T.brassSoft }}>Makkah</span>'),
        ("EyeMakkahApp", "RihabMakkahApp"), ("EYEMAKKAH_CONFIG", "RIHAB_MAKKAH_CONFIG"), ("EYEMAKKAH_NOW", "RIHAB_MAKKAH_NOW"),
        ("eyemakkah-build", "rihab-makkah-build"), ("eyemakkah_app_agent_bank_", "rihab_makkah_app_agent_bank_"),
        ("EyeMakkah_Vercel_DragDrop", "Rihab_Vercel_DragDrop"),
        ("resident@eyemakkah.app", "resident@rihab.app"), ("visitor@eyemakkah.app", "visitor@rihab.app"),
        ("resident@eyemakkah.demo", "resident@rihab.app"), ("visitor@eyemakkah.demo", "visitor@rihab.app"),
        ("EyeMakkah-app", "RihabMakkah-app"),
    ]
    LOWER = ("eyemakkah", "rihab")
    BRAND = ("EyeMakkah", "رحاب مكة", "Rihab Makkah")
else:
    EXACT = [
        ('"عروض سارية على أمثلة من روح المدينة — لا تُنسب لأماكن حقيقية": "Live offers on Ruh Al Madinah\'s sample listings — never attributed to real places"',
         '"عروض سارية في رحاب المدينة": "Live offers across Rihab Madinah"'),
        ("عروض سارية على أمثلة من روح المدينة — لا تُنسب لأماكن حقيقية", "عروض سارية في رحاب المدينة"),
        ('"صورة عامة من مكتبة النموذج": "Generic photo from the prototype library"', '"صورة عامة من مكتبة الصور": "Generic photo from the photo library"'),
        ('>روح<span aria-hidden="true" style={{ position: "absolute", left: ".2em", top: ".98em" }}>', '>رحاب<span aria-hidden="true" style={{ position: "absolute", left: "1.02em", top: ".98em" }}>'),
        ("RuhAlMadinahApp", "RihabMadinahApp"), ("RUHALMADINAH_CONFIG", "RIHAB_MADINAH_CONFIG"), ("RUHALMADINAH_NOW", "RIHAB_MADINAH_NOW"),
        ("ruhalmadinah-build", "rihab-madinah-build"), ("ruhalmadinah_app_agent_bank_", "rihab_madinah_app_agent_bank_"),
        ("RuhAlMadinah_Vercel_DragDrop", "Rihab_Vercel_DragDrop"),
        ("resident@ruhalmadinah.demo", "resident@rihab.app"), ("visitor@ruhalmadinah.demo", "visitor@rihab.app"),
        ("RuhAlMadinah-app", "RihabMadinah-app"), ("Ruh Al Madinah", "Rihab Madinah"), ("Ruh Al-Madinah", "Rihab Madinah"),
        ("روح المدينة", "رحاب المدينة"), ("RuhAlMadinah", "RihabMadinah"),
    ]
    LOWER = ("ruhalmadinah", "rihab")
    BRAND = None

changed = 0
for p in files():
    try: s = open(p, encoding="utf-8").read()
    except UnicodeDecodeError: continue
    t = s
    for a, b in EXACT: t = t.replace(a, b)
    t = t.replace(*LOWER)
    if BRAND: t = contextual(t, BRAND[0], BRAND[1], BRAND[2], p.endswith(".md"))
    if t != s:
        open(p, "w", encoding="utf-8").write(t); changed += 1

# file names carrying the old names
for d, dirs, fs in os.walk(ROOT):
    dirs[:] = [x for x in dirs if x not in ("node_modules", "dist", ".git")]
    for f in fs:
        g = f.replace("eyemakkah", "rihab_makkah" if False else "rihab").replace("ruhalmadinah", "rihab")
        g = g.replace("rihab_app_agent_bank_", f"rihab_{CITY}_app_agent_bank_") if "agent_bank" in g and f"rihab_{CITY}_" not in g else g
        if g != f: os.rename(os.path.join(d, f), os.path.join(d, g))
print(f"[{CITY}] {changed} files changed")
