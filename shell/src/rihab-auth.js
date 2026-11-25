/* Rihab accounts on this device — the same store, record shape and hashing the two
   city apps use, so one Rihab sign-in opens both Rihab Makkah and Rihab Madinah.
     rihab.accounts.v1  { users: { uid: { uid, email, salt, hash, firstName, lastName, … } } }
     rihab.session.v1   { uid, provider, local, idToken, refreshToken, expiresAt, email, … }
     rihab.lang         "ar" | "en"
   Per-city data (resident or visitor, profile, plan, communities, requests) stays
   under rihab.makkah.* and rihab.madinah.*, owned by each city app. */
export const RIHAB = {
  ACCOUNTS: "rihab.accounts.v1",
  SESSION: "rihab.session.v1",
  LANG: "rihab.lang",
  LAST_CITY: "rihab.lastCity",
};

export const store = {
  get(k) { try { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  del(k) { try { window.localStorage.removeItem(k); } catch { /* storage unavailable */ } },
};

export const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const normEmail = (e) => String(e || "").trim().toLowerCase();
export function passwordError(v) {
  if (!v) return "required";
  if (v.length < 8) return "short";
  if (!/[A-Za-z؀-ۿ]/.test(v) || !/\d/.test(v)) return "weak";
  return null;
}

class AuthError extends Error { constructor(code) { super(code); this.code = code; } }
const PBKDF2_ROUNDS = 120000;
const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
async function hashPassword(password, saltHex) {
  if (!(typeof crypto !== "undefined" && crypto.subtle)) throw new AuthError("secure_context");
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ROUNDS }, key, 256));
}
const sameHash = (a, b) => { if (!a || !b || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
const randomNonce = () => hex(crypto.getRandomValues(new Uint8Array(24)));

/* The Rihab demo accounts (password: demo). Ordinary accounts with no extra
   privileges, restored on every launch so the published sign-ins always work.
   Each city keeps its own persona for them (see the city apps' seeded profiles). */
export const SEEDED = [
  { uid: "local-demo-resident", email: "resident@rihab.app", firstName: "أمل", lastName: "الحربي", firstNameEn: "Amal", lastNameEn: "Al-Harbi",
    salt: "a3f19c6e7b204d58b1e6c9d02f4a7e31", hash: "12f6418e3bccd0a4f5277b7b9eac6ea6e494cdf8bcd9ffb9315d954dc5b98878", createdAt: "2026-10-05T00:00:00.000Z" },
  { uid: "local-demo-visitor", email: "visitor@rihab.app", firstName: "يوسف", lastName: "الأنصاري", firstNameEn: "Yousef", lastNameEn: "Al-Ansari",
    salt: "5c8e2b7d91f04a63e0b4d7a8c2f15e96", hash: "2f315022e7c542fac3d68c9f4c764548a2c37818d910708767c20af9b2fdc4ae", createdAt: "2026-10-05T00:00:00.000Z" },
];

let seeded = false;
function db() {
  const raw = store.get(RIHAB.ACCOUNTS);
  const d = raw && raw.users ? raw : { users: {} };
  if (!seeded) {
    for (const a of SEEDED) d.users[a.uid] = { ...(d.users[a.uid] || {}), ...a, providers: ["password"], emailVerified: true, reset: null };
    store.set(RIHAB.ACCOUNTS, d);
    seeded = true;
  }
  return d;
}
const save = (d) => store.set(RIHAB.ACCOUNTS, d);
const find = (pred) => Object.values(db().users).find(pred) || null;
const attempts = {};
const sessionFor = (u) => ({ uid: u.uid, provider: "password", local: true, idToken: "local", refreshToken: "local", expiresAt: Date.now() + 3600e3,
  email: u.email || null, phone: u.phone || null, emailVerified: !!u.emailVerified });

export const Accounts = {
  readSession() { db(); const s = store.get(RIHAB.SESSION); return s && s.uid && s.refreshToken && db().users[s.uid] ? s : null; },
  user(uid) { return db().users[uid] || null; },
  async signIn(email, password) {
    const em = normEmail(email);
    const a = attempts[em];
    if (a && a.until > Date.now()) throw new AuthError("TOO_MANY_ATTEMPTS_TRY_LATER");
    const u = find((x) => x.email === em && x.hash);
    const ok = u ? sameHash(await hashPassword(password, u.salt), u.hash) : false;
    if (!ok) {
      const n = (a && a.until <= Date.now() ? 0 : a?.n || 0) + 1;
      attempts[em] = { n, until: n >= 5 ? Date.now() + 5 * 60e3 : 0 };
      throw new AuthError("INVALID_LOGIN_CREDENTIALS");
    }
    delete attempts[em];
    const s = sessionFor(u); store.set(RIHAB.SESSION, s); return s;
  },
  async signUp({ email, password, firstName, lastName }) {
    const em = normEmail(email);
    if (!EMAIL_RX.test(em)) throw new AuthError("INVALID_EMAIL");
    if (passwordError(password)) throw new AuthError("WEAK_PASSWORD");
    if (find((u) => u.email === em)) throw new AuthError("EMAIL_EXISTS");
    const d = db(); const uid = `local-${randomNonce().slice(0, 20)}`; const salt = randomNonce().slice(0, 32);
    d.users[uid] = { uid, email: em, providers: ["password"], emailVerified: true, salt, hash: await hashPassword(password, salt),
      firstName, lastName, displayName: [firstName, lastName].filter(Boolean).join(" "), createdAt: new Date().toISOString() };
    save(d);
    const s = sessionFor(d.users[uid]); store.set(RIHAB.SESSION, s); return s;
  },
  /* the reset link reaches this device's inbox only when the account exists */
  async requestReset(email) {
    const u = find((x) => x.email === normEmail(email) && x.hash);
    if (!u) return null;
    const token = randomNonce(); const d = db();
    d.users[u.uid] = { ...d.users[u.uid], reset: { token, exp: Date.now() + 30 * 60e3 } }; save(d);
    return token;
  },
  async resetPassword(token, password) {
    const u = find((x) => x.reset && x.reset.token === token);
    if (!u) throw new AuthError("INVALID_OOB_CODE");
    if (u.reset.exp < Date.now()) throw new AuthError("EXPIRED_OOB_CODE");
    if (passwordError(password)) throw new AuthError("WEAK_PASSWORD");
    const d = db(); const salt = randomNonce().slice(0, 32);
    d.users[u.uid] = { ...d.users[u.uid], salt, hash: await hashPassword(password, salt), reset: null }; save(d);
  },
  signOut() { store.del(RIHAB.SESSION); },
};
