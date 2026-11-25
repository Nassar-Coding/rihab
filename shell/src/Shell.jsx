/* Rihab (رحاب) — the umbrella entry: one Rihab sign-in, then a city picker that opens
   Rihab Makkah (/makkah/) or Rihab Madinah (/madinah/), each in its own identity.

   Accounts live on this device, in the same store the two city apps read
   (rihab.accounts.v1 / rihab.session.v1 / rihab.lang), so one sign-in covers both
   cities. Passwords are kept only as salted PBKDF2 hashes, exactly as in the apps. */
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { RIHAB as K, MODE, store, Accounts, passwordError, normEmail, EMAIL_RX } from "./rihab-auth.js";
const BI = MODE === "bi";

/* ── identity ─────────────────────────────────────────────────────────────
   «الرحاب» are the open precincts of the two Holy Mosques. The palette takes the
   night courtyard (Layl ink), the gold thread of the Kiswa embroidery (Zari gold)
   and the marble of the precincts (Marble ivory). Each city keeps its own colours,
   shown only on its own card. */
const C = {
  ink: "#0D1A1B", ink2: "#132426", ink3: "#1A2F31", line: "rgba(200,164,93,.26)", line2: "rgba(244,239,228,.12)",
  gold: "#C8A45D", goldHi: "#E3CA92", goldLo: "#9C7C3C", marble: "#F4EFE4", mist: "#A7B2AF", mist2: "#7F8C89", err: "#E8A193",
};
const CITY = {
  makkah: { href: "./makkah/", photo: "./media/makkah.webp", bg: "#17463A", deep: "#0F3229", accent: "#D7B56D", soft: "#EFE6D5",
    ar: "مكة المكرمة", en: "Makkah", appAr: "رحاب مكة", appEn: "Rihab Makkah", alt: ["الكعبة المشرفة وساحات المسجد الحرام عند الغروب", "The Kaaba and the courtyards of the Grand Mosque at dusk"] },
  madinah: { href: "./madinah/", photo: "./media/madinah.webp", bg: "#172A46", deep: "#101E33", accent: "#F3D79E", soft: "#F5F5F2",
    ar: "المدينة المنورة", en: "Madinah", appAr: "رحاب المدينة", appEn: "Rihab Madinah", alt: ["المسجد النبوي والقبة الخضراء", "The Prophet's Mosque and the Green Dome"] },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=Marcellus&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box}
html,body{margin:0;background:${C.ink};color:${C.marble};-webkit-font-smoothing:antialiased}
body{min-height:100vh}
.rh{min-height:100vh;position:relative;overflow:hidden;font-family:'IBM Plex Sans Arabic','IBM Plex Sans',system-ui,sans-serif}
.rh[lang=en]{font-family:'IBM Plex Sans','IBM Plex Sans Arabic',system-ui,sans-serif}
.rh::before{content:"";position:fixed;inset:0;pointer-events:none;
  background:radial-gradient(120% 70% at 50% -10%, rgba(200,164,93,.16), transparent 60%),
             radial-gradient(90% 60% at 50% 115%, rgba(23,70,58,.35), transparent 70%)}
.pattern{position:fixed;inset:0;pointer-events:none;opacity:.07}
.wrap{position:relative;max-width:460px;margin:0 auto;padding:18px 22px 28px;min-height:100vh;display:flex;flex-direction:column}
.wide .wrap{max-width:980px}
.top{display:flex;align-items:center;justify-content:space-between;min-height:40px}
.pill{appearance:none;border:1px solid ${C.line};background:rgba(19,36,38,.6);color:${C.marble};border-radius:999px;
  padding:7px 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.02em}
.pill:hover{border-color:${C.gold}}
.pill:focus-visible,.btn:focus-visible,.link:focus-visible,.field input:focus-visible,.city:focus-visible{outline:2px solid ${C.goldHi};outline-offset:2px}
.mark{display:flex;flex-direction:column;align-items:center;text-align:center;margin:10px 0 6px}
.arch{position:relative;width:170px;height:192px;display:grid;place-items:center}
.arch svg{position:absolute;inset:0}
.word-ar{font-family:'Aref Ruqaa',serif;font-weight:700;color:${C.marble};font-size:68px;line-height:1;margin-top:30px;
  text-shadow:0 2px 24px rgba(200,164,93,.18)}
.kicker{margin-top:10px;font-size:12.5px;font-weight:600;letter-spacing:.08em;color:${C.mist};padding:4px 12px;border:1px solid ${C.line};border-radius:999px}
.rh[lang=en] .kicker{font-family:'Marcellus',serif;font-weight:400;letter-spacing:.24em;text-transform:uppercase;font-size:11px}
.word-en{font-family:'Marcellus',serif;letter-spacing:.56em;margin-inline-start:.56em;color:${C.gold};font-size:15px;margin-top:6px}
.sm{margin:0;flex-direction:row;gap:10px;align-items:baseline}
.sm .word-ar{font-size:34px;margin:0;color:${C.goldHi};text-shadow:none}
.sm .word-en{font-size:10.5px;letter-spacing:.42em;margin:0}
.rule{display:flex;align-items:center;gap:12px;color:${C.gold};margin:4px auto 0;width:160px}
.rule::before,.rule::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,${C.gold})}
.rule::after{background:linear-gradient(90deg,${C.gold},transparent)}
.card{background:linear-gradient(180deg,rgba(26,47,49,.82),rgba(19,36,38,.9));border:1px solid ${C.line};border-radius:22px;
  padding:20px 20px 18px;margin-top:16px;box-shadow:0 24px 60px -30px rgba(0,0,0,.7);backdrop-filter:blur(6px)}
.h1{font-size:21px;font-weight:700;margin:0 0 4px}
.rh[lang=en] .h1{font-family:'Marcellus',serif;font-weight:400;font-size:24px;letter-spacing:.01em}
.sub{color:${C.mist};font-size:14px;line-height:1.7;margin:0 0 16px}
.field{display:block;margin-bottom:13px}
.field span{display:block;font-size:12.5px;font-weight:600;color:${C.mist};margin-bottom:6px;letter-spacing:.02em}
.field .box{position:relative}
.field input{width:100%;font:inherit;font-size:15px;color:${C.marble};background:rgba(13,26,27,.65);border:1px solid ${C.line2};
  border-radius:13px;padding:13px 14px;outline:none;transition:border-color .15s}
.field input::placeholder{color:${C.mist2}}
.field input:focus{border-color:${C.gold}}
.field .eye{position:absolute;inset-inline-end:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:${C.mist};font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;padding:6px}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.btn{appearance:none;width:100%;border:0;border-radius:14px;padding:14px 16px;font:inherit;font-size:15.5px;font-weight:700;cursor:pointer;
  background:linear-gradient(180deg,${C.goldHi},${C.gold} 55%,${C.goldLo});color:#1B1608;letter-spacing:.01em;box-shadow:0 10px 26px -14px rgba(200,164,93,.8)}
.btn[disabled]{opacity:.6;cursor:default}
.btn.ghost{background:transparent;color:${C.marble};border:1px solid ${C.line};box-shadow:none;font-weight:600}
.btn.ghost:hover{border-color:${C.gold}}
.link{background:none;border:0;padding:4px 0;color:${C.goldHi};font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
.between{display:flex;justify-content:space-between;align-items:center;margin:-2px 0 14px}
.or{display:flex;align-items:center;gap:12px;color:${C.mist2};font-size:12.5px;margin:16px 0}
.or::before,.or::after{content:"";flex:1;height:1px;background:${C.line2}}
.err{color:${C.err};font-size:13px;line-height:1.6;margin:-4px 0 12px}
.ok{color:${C.goldHi};font-size:13.5px;line-height:1.7;margin:0 0 14px}
.foot{margin-top:auto;padding-top:22px;text-align:center;color:${C.mist2};font-size:12px;letter-spacing:.04em}
.foot b{color:${C.gold};font-weight:500;margin:0 8px}
.hello{margin:26px 0 4px}
.hello .k{color:${C.gold};font-size:13px;font-weight:600;letter-spacing:.06em}
.rh[lang=en] .hello .k{font-family:'Marcellus',serif;letter-spacing:.2em;text-transform:uppercase;font-size:12px}
.hello h1{font-size:28px;font-weight:700;margin:6px 0 4px;line-height:1.35}
.rh[lang=en] .hello h1{font-family:'Marcellus',serif;font-weight:400;font-size:31px}
.hello p{color:${C.mist};margin:0;font-size:14.5px;line-height:1.7}
.cities{display:grid;gap:16px;margin-top:22px}
.wide .cities{grid-template-columns:1fr 1fr;gap:22px}
.city{position:relative;display:block;text-decoration:none;color:inherit;border-radius:200px 200px 24px 24px;overflow:hidden;
  min-height:300px;border:1px solid rgba(255,255,255,.08);box-shadow:0 28px 60px -34px rgba(0,0,0,.9);isolation:isolate;
  transition:transform .25s ease, box-shadow .25s ease}
.wide .city{min-height:440px}
.city:hover{transform:translateY(-3px)}
.city img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:transform .6s ease}
.city:hover img{transform:scale(1.04)}
.city .veil{position:absolute;inset:0;z-index:-1}
.city .in{position:absolute;inset:auto 0 0 0;padding:22px 20px 20px}
.city .tag{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.04em;padding:5px 11px;border-radius:999px;margin-bottom:10px}
.rh[lang=en] .city .tag{font-family:'Marcellus',serif;font-weight:400;letter-spacing:.14em;text-transform:uppercase;font-size:11px}
.city h2{margin:0;font-size:30px;font-weight:700;line-height:1.2;color:#fff}
.rh[lang=en] .city h2{font-family:'Marcellus',serif;font-weight:400;font-size:34px}
.city .alt{font-size:14px;opacity:.85;margin-top:2px}
.city .go{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:13px;border-top:1px solid rgba(255,255,255,.16);font-size:14px;font-weight:600}
.city .go i{font-style:normal;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:18px}
.last{position:absolute;top:16px;inset-inline-start:50%;transform:translateX(-50%);font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;
  background:rgba(13,26,27,.72);color:${C.goldHi};border:1px solid ${C.line};white-space:nowrap}
.rh[dir=rtl] .last{transform:translateX(50%)}
.who{display:flex;align-items:center;gap:10px}
.av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:${C.ink3};border:1px solid ${C.line};color:${C.goldHi};font-weight:700;font-size:14px}
.menu{position:absolute;top:58px;inset-inline-end:22px;background:${C.ink2};border:1px solid ${C.line};border-radius:16px;padding:8px;min-width:200px;z-index:5;box-shadow:0 20px 50px -20px #000}
.menu button{display:block;width:100%;text-align:start;background:none;border:0;color:${C.marble};font:inherit;font-size:14px;padding:11px 12px;border-radius:10px;cursor:pointer}
.menu button:hover{background:${C.ink3}}
.menu .meta{padding:8px 12px 10px;color:${C.mist};font-size:12.5px;border-bottom:1px solid ${C.line2};margin-bottom:6px;word-break:break-all}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion: reduce){.city,.city img{transition:none}.city:hover,.city:hover img{transform:none}}
`;

const T_BI = {
  ar: { kicker: "ذكاء الأعمال", signInSub: "لوحات ذكاء الأعمال لرحاب مكة ورحاب المدينة. حسابات الأعمال تصدرها إدارة المنصة.", hiK: "رحاب — ذكاء الأعمال",
    pick: "اختر المدينة لعرض لوحاتها بهويتها الخاصة.", open: "افتح اللوحات", title: "رحاب — ذكاء الأعمال" },
  en: { kicker: "Business Intelligence", signInSub: "Business intelligence for Rihab Makkah and Rihab Madinah. Business accounts are issued by the platform team.", hiK: "Rihab Business Intelligence",
    pick: "Choose a city to open its dashboards, in its own identity.", open: "Open dashboards", title: "Rihab — Business Intelligence" },
};
const T = {
  ar: { lang: "English", signIn: "تسجيل الدخول", signInSub: "حساب واحد لرحاب مكة ورحاب المدينة.", email: "البريد الإلكتروني", password: "كلمة المرور",
    show: "إظهار", hide: "إخفاء", forgot: "نسيت كلمة المرور؟", enter: "دخول", or: "أو", create: "إنشاء حساب رحاب", haveAcc: "لديك حساب؟", backIn: "سجّل الدخول",
    createTitle: "حساب رحاب جديد", createSub: "حساب واحد لمكة المكرمة والمدينة المنورة.", first: "الاسم الأول", last: "اسم العائلة", pwHint: "٨ أحرف على الأقل، تجمع حروفًا وأرقامًا.",
    createBtn: "إنشاء الحساب", resetTitle: "استعادة كلمة المرور", resetSub: "أدخل بريدك، وسنرسل رابط إعادة التعيين إلى صندوق الرسائل على هذا الجهاز.",
    send: "أرسل الرابط", sent: "إن كان البريد مسجّلًا، فقد وصلك رابط إعادة التعيين.", openMsg: "افتح الرسالة", newPw: "كلمة المرور الجديدة", savePw: "احفظ كلمة المرور",
    pwSaved: "حُفظت كلمة المرور الجديدة. سجّل الدخول بها.", back: "رجوع",
    hiK: "أهلًا بك في رحاب", hi: (n) => (n ? `مرحبًا ${n}` : "مرحبًا بك"), pick: "اختر مدينتك، وستفتح تجربتها الخاصة.", open: "ادخل", lastVisit: "آخر زيارة",
    signOut: "تسجيل الخروج", menu: "القائمة", cities: "مكة المكرمة · المدينة المنورة",
    e: { required: "أكمل الحقول المطلوبة.", INVALID_EMAIL: "تحقق من البريد الإلكتروني.", INVALID_LOGIN_CREDENTIALS: "البريد أو كلمة المرور غير صحيحة.",
      TOO_MANY_ATTEMPTS_TRY_LATER: "محاولات كثيرة. حاول بعد خمس دقائق.", EMAIL_EXISTS: "يوجد حساب بهذا البريد. سجّل الدخول.", short: "كلمة المرور أقصر من ٨ أحرف.",
      weak: "اجمع حروفًا وأرقامًا في كلمة المرور.", INVALID_OOB_CODE: "الرابط غير صالح. اطلب رابطًا جديدًا.", EXPIRED_OOB_CODE: "انتهت صلاحية الرابط. اطلب رابطًا جديدًا.",
      secure_context: "افتح رحاب عبر رابط آمن (https) لتسجيل الدخول.", generic: "تعذّر إكمال الطلب. حاول مرة أخرى." } },
  en: { lang: "العربية", signIn: "Sign in", signInSub: "One account for Rihab Makkah and Rihab Madinah.", email: "Email", password: "Password",
    show: "Show", hide: "Hide", forgot: "Forgot password?", enter: "Sign in", or: "or", create: "Create a Rihab account", haveAcc: "Have an account?", backIn: "Sign in",
    createTitle: "New Rihab account", createSub: "One account for Makkah and Madinah.", first: "First name", last: "Last name", pwHint: "At least 8 characters, with letters and numbers.",
    createBtn: "Create account", resetTitle: "Reset your password", resetSub: "Enter your email and we'll send a reset link to the inbox on this device.",
    send: "Send the link", sent: "If the email is registered, the reset link is in your inbox.", openMsg: "Open the message", newPw: "New password", savePw: "Save password",
    pwSaved: "Your new password is saved. Sign in with it.", back: "Back",
    hiK: "Welcome to Rihab", hi: (n) => (n ? `Hello, ${n}` : "Welcome"), pick: "Choose your city to open its own experience.", open: "Enter", lastVisit: "Last visited",
    signOut: "Sign out", menu: "Menu", cities: "Makkah · Madinah",
    e: { required: "Complete the required fields.", INVALID_EMAIL: "Check the email address.", INVALID_LOGIN_CREDENTIALS: "The email or password is incorrect.",
      TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Try again in five minutes.", EMAIL_EXISTS: "An account with this email exists. Sign in instead.", short: "The password is shorter than 8 characters.",
      weak: "Use both letters and numbers in the password.", INVALID_OOB_CODE: "This link isn't valid. Request a new one.", EXPIRED_OOB_CODE: "This link has expired. Request a new one.",
      secure_context: "Open Rihab over a secure link (https) to sign in.", generic: "That didn't work. Please try again." } },
};

/* an eight-point star lattice, the courtyard floor pattern, drawn very faintly */
const Pattern = () => (
  <svg className="pattern" aria-hidden="true" width="100%" height="100%">
    <defs>
      <pattern id="rh-star" width="64" height="64" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={C.gold} strokeWidth="1">
          <rect x="20" y="20" width="24" height="24" />
          <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)" />
          <path d="M0 32h20M44 32h20M32 0v20M32 44v20" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#rh-star)" />
  </svg>
);

/* the wordmark: رحاب under a gold pointed arch — the arcade around the precincts */
function Wordmark({ small, kicker }) {
  if (small) return (
    <div className="mark sm" role="img" aria-label="رحاب — Rihab">
      <span className="word-ar" aria-hidden="true">رحاب</span><span className="word-en" aria-hidden="true">RIHAB</span>
    </div>
  );
  return (
    <div className={`mark${small ? " sm" : ""}`} role="img" aria-label="رحاب — Rihab">
      <div className="arch">
        <svg viewBox="0 0 200 226" aria-hidden="true">
          <path d="M14 224V112C14 58 52 20 100 6c48 14 86 52 86 106v112" fill="none" stroke={C.gold} strokeWidth={small ? 4 : 1.6} />
          {!small && <path d="M28 224V116c0-46 32-80 72-94 40 14 72 48 72 94v108" fill="none" stroke={C.gold} strokeOpacity=".35" strokeWidth="1" />}
          {!small && <path d="M100 0l4 6-4 6-4-6z" fill={C.gold} />}
        </svg>
        <div className="word-ar" aria-hidden="true">رحاب</div>
      </div>
      {!small && <div className="word-en" aria-hidden="true">RIHAB</div>}
      {!small && kicker && <div className="kicker">{kicker}</div>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, auto, show, onToggle, t, dir }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="box">
        <input type={type === "password" && show ? "text" : type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={auto} dir={dir}
          style={type === "password" ? { paddingInlineEnd: 64 } : null} />
        {type === "password" && <button type="button" className="eye" onClick={onToggle}>{show ? t.hide : t.show}</button>}
      </div>
    </label>
  );
}

function App() {
  const [lang, setLang] = useState(() => store.get(K.LANG) || "ar");
  const t = BI ? { ...T[lang], ...T_BI[lang], hi: () => (lang === "ar" ? "مرحبًا بك" : "Welcome") } : T[lang];
  const [session, setSession] = useState(() => Accounts.readSession());
  const [view, setView] = useState("signin");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [f, setF] = useState({ email: "", password: "", first: "", last: "", pw2: "" });
  const [show, setShow] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [opened, setOpened] = useState(false);
  const [menu, setMenu] = useState(false);
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.innerWidth >= 900);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { store.set(K.LANG, lang); document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = BI ? t.title : lang === "ar" ? "رحاب" : "Rihab"; }, [lang]);
  useEffect(() => { const r = () => setWide(window.innerWidth >= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  useEffect(() => { setErr(""); setNote(""); setShow(false); }, [view]);

  const fail = (e) => setErr(t.e[e?.code] || t.e[e?.message] || t.e.generic);
  const run = (fn) => async (ev) => { ev.preventDefault(); setErr(""); setBusy(true); try { await fn(); } catch (e) { fail(e); } finally { setBusy(false); } };

  const signIn = run(async () => {
    if (!f.email || !f.password) throw { code: "required" };
    const s = await Accounts.signIn(f.email, f.password);
    setSession(s); setF((x) => ({ ...x, password: "" }));
  });
  const signUp = run(async () => {
    if (!f.first.trim() || !f.email || !f.password) throw { code: "required" };
    if (!EMAIL_RX.test(normEmail(f.email))) throw { code: "INVALID_EMAIL" };
    const pe = passwordError(f.password); if (pe) throw { code: pe };
    const s = await Accounts.signUp({ email: f.email, password: f.password, firstName: f.first.trim(), lastName: f.last.trim() });
    setSession(s); setF((x) => ({ ...x, password: "" }));
  });
  const sendReset = run(async () => {
    if (!EMAIL_RX.test(normEmail(f.email))) throw { code: "INVALID_EMAIL" };
    setResetToken(await Accounts.requestReset(f.email)); setNote(t.sent);
  });
  const saveReset = run(async () => {
    const pe = passwordError(f.pw2); if (pe) throw { code: pe };
    await Accounts.resetPassword(resetToken, f.pw2);
    setResetToken(null); setOpened(false); setF((x) => ({ ...x, pw2: "", password: "" })); setView("signin"); setTimeout(() => setNote(t.pwSaved), 0);
  });
  const signOut = () => { Accounts.signOut(); setSession(null); setMenu(false); setView("signin"); };

  const user = useMemo(() => (session ? Accounts.user(session.uid) : null), [session]);
  const name = user ? (lang === "ar" ? user.firstName : user.firstNameEn || user.firstName) : "";
  const lastCity = store.get(K.LAST_CITY);

  return (
    <div className={`rh${wide && session ? " wide" : ""}`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <style>{CSS}</style>
      <Pattern />
      <div className="wrap">
        <div className="top">
          {session ? <Wordmark small /> : <span />}
          <div className="who">
            <button className="pill" data-rihab-lang onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>{t.lang}</button>
            {session && <button className="av" aria-label={t.menu} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>{((lang === "en" && user?.firstNameEn) || user?.firstName || "؟").slice(0, 1)}</button>}
          </div>
        </div>
        {menu && session && (
          <div className="menu" role="menu">
            <div className="meta">{session.email}</div>
            <button role="menuitem" onClick={signOut}>{t.signOut}</button>
          </div>
        )}

        {!session && <>
          <Wordmark kicker={BI ? t.kicker : null} />
          <div className="rule" aria-hidden="true">✦</div>

          {view === "signin" && (
            <form className="card" onSubmit={signIn} noValidate data-rihab-signin>
              <h1 className="h1">{t.signIn}</h1>
              <p className="sub">{t.signInSub}</p>
              {note && <p className="ok" role="status">{note}</p>}
              <Field label={t.email} type="email" value={f.email} onChange={set("email")} auto="username" t={t} dir="ltr" />
              <Field label={t.password} type="password" value={f.password} onChange={set("password")} auto="current-password" show={show} onToggle={() => setShow((s) => !s)} t={t} dir="ltr" />
              {!BI && <div className="between"><span /><button type="button" className="link" onClick={() => setView("reset")}>{t.forgot}</button></div>}
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn" disabled={busy} data-rihab-submit>{t.enter}</button>
              {!BI && <>
              <div className="or">{t.or}</div>
              <button type="button" className="btn ghost" data-rihab-create onClick={() => setView("signup")}>{t.create}</button>
              </>}
            </form>
          )}

          {view === "signup" && (
            <form className="card" onSubmit={signUp} noValidate data-rihab-signup>
              <h1 className="h1">{t.createTitle}</h1>
              <p className="sub">{t.createSub}</p>
              <div className="row2">
                <Field label={t.first} value={f.first} onChange={set("first")} auto="given-name" t={t} />
                <Field label={t.last} value={f.last} onChange={set("last")} auto="family-name" t={t} />
              </div>
              <Field label={t.email} type="email" value={f.email} onChange={set("email")} auto="email" t={t} dir="ltr" />
              <Field label={t.password} type="password" value={f.password} onChange={set("password")} auto="new-password" show={show} onToggle={() => setShow((s) => !s)} t={t} dir="ltr" />
              <p className="sub" style={{ marginTop: -6, fontSize: 12.5 }}>{t.pwHint}</p>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn" disabled={busy}>{t.createBtn}</button>
              <div className="between" style={{ justifyContent: "center", margin: "14px 0 0", gap: 8 }}>
                <span style={{ color: C.mist, fontSize: 13.5 }}>{t.haveAcc}</span><button type="button" className="link" onClick={() => setView("signin")}>{t.backIn}</button>
              </div>
            </form>
          )}

          {view === "reset" && (
            <form className="card" onSubmit={opened ? saveReset : sendReset} noValidate>
              <h1 className="h1">{t.resetTitle}</h1>
              <p className="sub">{t.resetSub}</p>
              {!opened && <Field label={t.email} type="email" value={f.email} onChange={set("email")} auto="username" t={t} dir="ltr" />}
              {note && !opened && <p className="ok" role="status">{note}</p>}
              {resetToken && !opened && <button type="button" className="btn ghost" style={{ marginBottom: 12 }} onClick={() => setOpened(true)}>{t.openMsg}</button>}
              {opened && <Field label={t.newPw} type="password" value={f.pw2} onChange={set("pw2")} auto="new-password" show={show} onToggle={() => setShow((s) => !s)} t={t} dir="ltr" />}
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn" disabled={busy}>{opened ? t.savePw : t.send}</button>
              <div style={{ textAlign: "center", marginTop: 12 }}><button type="button" className="link" onClick={() => { setResetToken(null); setOpened(false); setView("signin"); }}>{t.back}</button></div>
            </form>
          )}
        </>}

        {session && (
          <main>
            <div className="hello">
              <div className="k">{t.hiK}</div>
              <h1>{t.hi(name)}</h1>
              <p>{t.pick}</p>
            </div>
            <div className="cities">
              {["makkah", "madinah"].map((k) => {
                const c = CITY[k];
                return (
                  <a key={k} className="city" href={c.href} data-city={k} onClick={() => store.set(K.LAST_CITY, k)}
                    aria-label={`${lang === "ar" ? c.appAr : c.appEn} — ${lang === "ar" ? c.ar : c.en}`}>
                    <img src={c.photo} alt={c.alt[lang === "ar" ? 0 : 1]} />
                    <div className="veil" style={{ background: `linear-gradient(180deg, transparent 22%, ${c.bg}d9 62%, ${c.deep} 100%)` }} />
                    {lastCity === k && <span className="last">{t.lastVisit}</span>}
                    <div className="in">
                      <span className="tag" style={{ background: `${c.accent}26`, color: c.accent, border: `1px solid ${c.accent}55` }}>{lang === "ar" ? c.appAr : c.appEn}</span>
                      <h2>{lang === "ar" ? c.ar : c.en}</h2>
                      <div className="alt" lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? c.en : c.ar}</div>
                      <div className="go"><span>{t.open}</span><i style={{ background: c.accent, color: c.deep }} aria-hidden="true">{lang === "ar" ? "←" : "→"}</i></div>
                    </div>
                  </a>
                );
              })}
            </div>
          </main>
        )}

        <div className="foot"><span>{t.cities.split(" · ")[0]}</span><b>✦</b><span>{t.cities.split(" · ")[1]}</span></div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
