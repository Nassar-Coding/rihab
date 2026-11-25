# Rihab accounts

Rihab has two separate sets of accounts, both kept on the device (in the browser's storage for
the site's address). There is no server and no external sign-in service.

## The Rihab app

- **One account for both cities.** A person signs in, creates an account or resets a password
  once, at the Rihab entry (`/`). Rihab Makkah (`/makkah/`) and Rihab Madinah (`/madinah/`)
  open signed in with the same account. Without a session, a city sends the visitor back to
  the Rihab sign-in. Signing out in either city signs out of both.
- **A profile per city.** The first visit to a city asks for that city's profile. The person
  chooses there, once and for good, whether they are a resident or a visitor of that city. The
  name, age and nationality are prefilled from the account (or from the other city's profile).
  Each city keeps its own profile, My Plan, communities and My requests for the account.
- **Passwords** are stored only as salted PBKDF2-SHA-256 hashes (120,000 rounds). A new
  password needs at least 8 characters, with letters and digits.
- **Password reset** is at the Rihab entry. The reset message is delivered on the device (the
  demo has no email service) and expires after 30 minutes.
- **Language** is shared: the language chosen at Rihab is the one each city opens in.

| Storage key | What it holds |
|---|---|
| `rihab.accounts.v1` | The accounts (email, names, password hash and salt) |
| `rihab.session.v1` | The signed-in session |
| `rihab.lang` | The language, `"ar"` or `"en"` |
| `rihab.lastCity` | The city opened last, marked on the city picker |
| `rihab.makkah.{profile,plan,community,requests}.v1.<uid>` | Rihab Makkah's data for an account |
| `rihab.madinah.{profile,plan,requests}.v1.<uid>` | Rihab Madinah's data for an account |

**Demo accounts.** Two ordinary accounts with no extra privileges, restored on every launch,
also after the browser's data is cleared. Their password is the shared demo password given
with the delivery.

| Account | Rihab Makkah | Rihab Madinah |
|---|---|---|
| `resident@rihab.app` | Resident of Al-Awali, with a prepared history | Resident of Al-Awali, with a prepared history |
| `visitor@rihab.app` | Visiting family, 3–5 days | Visiting family, 3–5 days |

## Rihab Business Intelligence

Business accounts are separate from the app's accounts. An app account cannot sign in to the
dashboards, and a business account cannot sign in to the app. The BI sign-in has no account
creation or password reset.

| Storage key | What it holds |
|---|---|
| `rihab.bi.accounts.v1` | The business accounts |
| `rihab.bi.session.v1` | The signed-in session (until sign-out) |
| `rihab.bi.lastCity` | The city opened last |
| `rihab.lang` | The language, shared with the Rihab entry when both are on one address |

**Demo account.** `bi@rihab.app`, with the shared demo password.

## Notes

- The two sites are deployed separately, so on two addresses they keep separate storage.
- The city apps still contain the optional Firebase Authentication code from their earlier
  standalone versions. The Rihab entry does not use it: Rihab accounts are on the device only.
