/* Cache-safe asset names for the drag-and-drop package.

   Browsers that visited an early Rihab Makkah deployment were told to keep `/app.js` for a
   year without asking again (`immutable`). Because the file kept the same name, those
   browsers went on running the old app after every redeploy, while a fresh (incognito)
   window loaded the new one. The fix is to never reuse an asset URL for new content:

   · the bundle is published as `app.<content-hash>.js`, so every build with different
     code gets a new URL that no browser has cached;
   · `index.html` — always re-checked with the server (see dist/vercel.json) — points at
     the current bundle, and at `config.js?v=<content-hash>`;
   · `config.js` keeps its name, because it is edited on the server without a rebuild;
     it is re-checked on every load too.

   Browser storage (accounts, sessions, profiles, plans) is untouched: the site keeps the
   same address, so everything saved on the device stays available to the new version.

   fingerprint(dir) is idempotent: run by the build after writing the bundle, and again by
   the packager, so a package always ships matching names. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, renameSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const hashOf = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 10);
const BUNDLE = /^app(?:\.[0-9a-f]{10})?\.js$/;

export function fingerprint(dir) {
  const bundles = readdirSync(dir).filter((f) => BUNDLE.test(f));
  if (!bundles.length) throw new Error(`no app bundle in ${dir}`);
  /* the freshly written app.js wins; otherwise the one already fingerprinted */
  const current = bundles.includes("app.js") ? "app.js" : bundles[0];
  const code = readFileSync(join(dir, current));
  const version = hashOf(code);
  const app = `app.${version}.js`;
  if (current !== app) renameSync(join(dir, current), join(dir, app));
  for (const f of bundles) if (f !== current && f !== app && existsSync(join(dir, f))) rmSync(join(dir, f));

  const configVersion = existsSync(join(dir, "config.js")) ? hashOf(readFileSync(join(dir, "config.js"))) : version;
  const indexPath = join(dir, "index.html");
  let html = readFileSync(indexPath, "utf8");
  const before = html;
  html = html
    .replace(/<script src="\.\/app(?:\.[0-9a-f]{10})?\.js"><\/script>/, `<script src="./${app}"></script>`)
    .replace(/<script src="\.\/config\.js(?:\?v=[0-9a-f]{10})?"><\/script>/, `<script src="./config.js?v=${configVersion}"></script>`)
    .replace(/<meta name="rihab-makkah-build" content="[^"]*"\/>\n?/, "")
    .replace(/<meta charset="utf-8"\/>\n/, `<meta charset="utf-8"/>\n<meta name="rihab-makkah-build" content="${version}"/>\n`);
  if (!html.includes(`src="./${app}"`) || !html.includes(`config.js?v=${configVersion}`)) throw new Error("index.html: script tags not found");
  if (html !== before) writeFileSync(indexPath, html);
  return { app, version, configVersion, bytes: code.length };
}
