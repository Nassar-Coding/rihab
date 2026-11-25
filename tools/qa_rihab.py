"""Point a city's QA scripts at the Rihab build: the city is served at /<city>/ inside the
Rihab app (.out/app), and the city's own landing, language and sign-in screens are replaced
by the Rihab entry (scripts/lib/rihab-entry.mjs). Idempotent.
Usage: python3 tools/qa_rihab.py <makkah|madinah>"""
import re, sys, pathlib
city = sys.argv[1]
D = pathlib.Path(__file__).resolve().parent.parent / city / "scripts"
LANDING = re.compile(r"await page\.getByText\(/\^(?:\(ابدأ\|Enter (?:Rihab Madinah|رحاب مكة)\)|ابدأ)\$/\)\.first\(\)\.click\(\);(?: await (?:page\.waitForTimeout|W)\((?:page, )?\d*\);)?[ \t]*\n?")
SUBS = [
    (r"const (root|ROOT) = `\$\{REPO\}/dist`;( *)// this repository's own build", r"const \1 = RIHAB_APP;\2// the Rihab build (node build/build.mjs app)"),
    (r'const (root|ROOT) = "/home/user/Rihab Makkah/dist";', r"const \1 = RIHAB_APP;                          // the Rihab build (node build/build.mjs app)"),
    (r'const (root|ROOT) = process\.env\.ROOT \|\| resolve\("dist"\);', r"const \1 = process.env.ROOT || RIHAB_APP;"),
    (r'const root = process\.env\.ROOT \|\| resolve\(dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.", "dist"\);', "const root = process.env.ROOT || RIHAB_APP;"),
    (r'resolve\((root|ROOT), req\.url === "/" \? "index\.html" : "\." \+ req\.url\.split\("\?"\)\[0\]\)', r"rihabFile(\1, req.url)"),
    (r'resolve\(root, p === "/" \? "index\.html" : "\." \+ p\)', "rihabFile(root, p)"),
    (r'(["`])http://127\.0\.0\.1:(\d+|\$\{PORT\})/\1', r"\1http://127.0.0.1:\2/%s/\1" % city),
    (r"await page\.locator\('\[data-lang=\"(ar|en)\"\]'\)\.click\(\);", r'await rihabLang(page, "\1");'),
    (r'await page\.locator\(`\[data-lang="\$\{([^}]+)\}"\]`\)\.click\(\);', r"await rihabLang(page, \1);"),
    (r"await page\.locator\('\[data-auth-screen=\"login\"\]'\)\.waitFor\(\);(?: await W\((?:page, )?\d*\);)?[ \t]*\n?", ""),
    (r'await page\.locator\("\[data-auth-email\]"\)\.fill\(([^;]+?)\);\s*await page\.locator\("\[data-auth-password\]"\)\.fill\(([^;]+?)\);\s*await page\.locator\("\[data-auth-submit\]"\)\.click\(\);',
     r"await rihabSignIn(page, \1, \2);"),
    (r"@rihab\.demo", "@rihab.app"),
]
NAMES = ["RIHAB_APP", "rihabFile", "rihabLang", "rihabSignIn"]
for f in sorted(D.glob("*.mjs")):
    s = o = f.read_text()
    s = LANDING.sub("", s)
    for a, b in SUBS: s = re.sub(a, b, s)
    used = [n for n in NAMES if re.search(r"\b%s\b" % n, s)]
    if used and "./lib/rihab-entry.mjs" not in s:
        m = re.search(r"^import .*;$", s, re.M)
        imp = 'import { %s } from "./lib/rihab-entry.mjs";\n' % ", ".join(used)
        s = s[:m.start()] + imp + s[m.start():] if m else imp + s
    if s != o: f.write_text(s); print("updated", f.name)
