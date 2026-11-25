"""Wire a city app into Rihab: the Rihab sign-in at ../, one shared account, a profile
per city, the Rihab demo accounts, and a way to switch city. Idempotent-checked: each
replacement must match exactly once."""
import re, sys

CITY = sys.argv[1]            # makkah | madinah
PATH = sys.argv[2]
OTHER = "madinah" if CITY == "makkah" else "makkah"
OTHER_AR = "رحاب المدينة" if CITY == "makkah" else "رحاب مكة"
OTHER_EN = "Rihab Madinah" if CITY == "makkah" else "Rihab Makkah"

s = open(PATH, encoding="utf-8").read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit(f"[{CITY}] expected {count}× got {n}: {a[:90]!r}")
    s = s.replace(a, b)

# 1 · lucide icon for the switch
rep('} from "lucide-react";', '  ArrowLeftRight,\n} from "lucide-react";')

# 2 · helpers next to the storage keys
key_line = f'const profileKey = (uid) => `rihab.{CITY}.profile.v1.${{uid}}`;'
rep(key_line, key_line + f'''
/* Rihab: the sign-in and the city picker live at the Rihab entry (../). A city app
   never shows its own landing or sign-in screens; it sends the visitor to Rihab. */
const RIHAB_CITY = "{CITY}";
const RIHAB_OTHER = "{OTHER}";
const rihabHref = (path = "") => {{ try {{ return new URL(`../${{path}}`, window.location.href).href; }} catch {{ return `../${{path}}`; }} }};
const goRihab = (path = "") => {{ try {{ window.location.replace(rihabHref(path)); }} catch {{ /* no window */ }} }};
/* one account, a profile per city: a new city starts from what the account already knows */
function rihabPrefill(uid, prof) {{
  const acc = ((store.get("rihab.accounts.v1") || {{}}).users || {{}})[uid] || {{}};
  const other = store.get(`rihab.${{RIHAB_OTHER}}.profile.v1.${{uid}}`) || {{}};
  const en = (store.get("rihab.lang") || "ar") === "en";
  const base = {{
    firstName: other.firstName || (en && acc.firstNameEn) || acc.firstName || "",
    lastName: other.lastName || (en && acc.lastNameEn) || acc.lastName || "",
    ...(other.age != null ? {{ age: other.age }} : {{}}),
    ...(other.nationality ? {{ nationality: other.nationality }} : {{}}),
  }};
  const own = Object.fromEntries(Object.entries(prof || {{}}).filter(([, v]) => v != null && v !== ""));
  return {{ ...base, ...own }};
}}''')

# 3 · entry: no session → Rihab; every sign-in screen redirects to Rihab
rep('const [entry, setEntry] = useState(() => (readSession() ? "restoring" : "landing"));',
    'const [entry, setEntry] = useState(() => (readSession() ? "restoring" : "rihab"));\n'
    '  useEffect(() => { if (["rihab", "landing", "language", "login", "createAccount", "signupEmail", "phone", "forgot"].includes(entry)) goRihab(); }, [entry]);')

# 4 · the Rihab language choice leads; a city profile never overrides it on launch
rep('if (profileComplete(prof)) { applyAccount(prof, true);', 'if (profileComplete(prof)) { applyAccount(prof, false);')
rep('applyAccount(cached, true);', 'applyAccount(cached, false);')

# 5 · profile setup for a city the account hasn't entered yet: prefilled from the account
rep('else { setSetup({ initial: prof || {}, busy: false, error: null }); setEntry("profileSetup"); }',
    'else { setSetup({ initial: rihabPrefill(ses.uid, prof), busy: false, error: null }); setEntry("profileSetup"); }')
s, n = re.subn(r'setSetup\(\{ busy: false, error: null, initial: \{ \.\.\.\(prof \|\| \{\}\), firstName: \(prof && prof\.firstName\) \|\| res\.names\?\.firstName \|\| "", lastName: \(prof && prof\.lastName\) \|\| res\.names\?\.lastName \|\| "" \} \}\);',
               'setSetup({ busy: false, error: null, initial: rihabPrefill(session.uid, { ...(prof || {}), firstName: (prof && prof.firstName) || res.names?.firstName || "", lastName: (prof && prof.lastName) || res.names?.lastName || "" }) });', s)
if n != 1: raise SystemExit(f"[{CITY}] afterSignIn prefill: {n}")

# 6 · Home: a switch-city button beside the notifications bell
bell = '<button className="press tap" onClick={() => go({ s: "notifications" })} aria-label="الإشعارات"'
rep(bell, '''<button data-rihab-switch className="press tap" onClick={() => goRihab()} aria-label={tx("بدّل المدينة — رحاب", "Switch city — Rihab")} title={tx("بدّل المدينة", "Switch city")}
              style={{ width: 36, height: 36, borderRadius: R.pill, background: T.paper, border: `1px solid ${T.line}`, display: "grid", placeItems: "center" }}>
              <ArrowLeftRight size={16} color={T.ink} />
            </button>
            ''' + bell)

# 7 · Profile: a "Switch city" card above the account
rep('      <AccountSection />\n', f'''      <div data-rihab-cities style={{{{ margin: "14px 16px 0", borderRadius: R.box, border: `1px solid ${{T.line}}`, background: T.paper, overflow: "hidden" }}}}>
        <div style={{{{ padding: "12px 14px 4px", fontSize: 12, fontWeight: 800, color: T.muted, letterSpacing: ".02em" }}}}>{{tx("رحاب — منصة واحدة لمكة والمدينة", "Rihab — one platform for Makkah and Madinah")}}</div>
        <a data-rihab-other href={{rihabHref(`${{RIHAB_OTHER}}/`)}} className="press row"
          style={{{{ gap: 10, padding: "12px 14px", borderBottom: `1px solid ${{T.lineSoft}}`, textDecoration: "none", color: "inherit", fontSize: 13.5, fontWeight: 700 }}}}>
          <ArrowLeftRight size={{16}} color={{T.green}} />{{tx("انتقل إلى {OTHER_AR}", "Go to {OTHER_EN}")}}
        </a>
        <a data-rihab-picker href={{rihabHref()}} className="press row"
          style={{{{ gap: 10, padding: "12px 14px", textDecoration: "none", color: "inherit", fontSize: 13.5, fontWeight: 700 }}}}>
          <MapPin size={{16}} color={{T.green}} />{{tx("اختيار المدينة في رحاب", "Choose a city in Rihab")}}
        </a>
      </div>

      <AccountSection />
''')

# 8 · the Rihab demo accounts: resident@rihab.app and visitor@rihab.app (password: demo)
s, n = re.subn(r'\n  \{ account: \{ uid: "local-review-account".*?\n    profile: [^\n]*\n', "\n", s, flags=re.S)
if n != 1: raise SystemExit(f"[{CITY}] review account: {n}")
s, n = re.subn(r'email: "resident@[a-z.]+", (aliases: \[[^\]]*\], )?', 'email: "resident@rihab.app", ', s)
if n != 1: raise SystemExit(f"[{CITY}] resident email: {n}")
s, n = re.subn(r'email: "visitor@[a-z.]+", (aliases: \[[^\]]*\], )?', 'email: "visitor@rihab.app", ', s)
if n != 1: raise SystemExit(f"[{CITY}] visitor email: {n}")
s = s.replace("const REVIEW_ACCOUNT = SEEDED_ACCOUNTS[0].account;\n", "")

# 9 · restoring a Rihab session: ready the on-device accounts first (seeds the demo profiles)
rep("      const stored = auth.session;\n", "      const stored = auth.session;\n      /* Rihab: the session comes from the Rihab sign-in, so the on-device accounts (and the\n         demo accounts' city profiles) are made ready before the profile is read */\n      if (Auth.mode === \"local\") LocalAuth.db();\n")

open(PATH, "w", encoding="utf-8").write(s)
print(f"[{CITY}] integrated")
