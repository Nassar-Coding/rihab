/* Cache check: one permanent URL always serves the latest deployment after a refresh.
   1. Package: index.html points at the bundle by its content hash (and at
      config.js?v=<hash>); dist holds exactly one bundle; vercel.json re-checks the page,
      config.js and any unhashed app.js on every load, and caches only hashed bundles.
   2. Consecutive builds: a changed bundle gets a new name, index.html follows, the old
      bundle is removed, an unchanged build keeps its name.
   3. Real browser against a server that applies each deployment's own vercel.json headers
      (with ETag / 304), at one URL, in one browser profile:
      · reproduces the old fault: with the legacy headers (`app.js` immutable for a year) a
        returning browser keeps running the previous app after a redeploy;
      · after the fix, each redeploy is picked up by a normal refresh — also in a browser
        still holding the legacy year-long copy of app.js;
      · the signed-in session and saved data survive every switch;
      · an unchanged deployment is not downloaded again.
   Usage: node scripts/cache-check.mjs */
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";
import { chromiumPath, REPO } from "./lib/browser.mjs";
import { fingerprint } from "../build/fingerprint.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) { pass++; console.log(`✓ ${name}`); } else { fail++; console.log(`✗ ${name}${detail ? " — " + detail : ""}`); } };
const hashOf = (b) => createHash("sha256").update(b).digest("hex").slice(0, 10);
const DIST = join(REPO, "dist");
const work = mkdtempSync(join(tmpdir(), "eyemakkah-cache-"));

/* ── 1. the package ── */
const html = readFileSync(join(DIST, "index.html"), "utf8");
const bundles = readdirSync(DIST).filter((f) => /^app(\.[0-9a-f]{10})?\.js$/.test(f));
const ref = (html.match(/<script src="\.\/(app\.[0-9a-f]{10}\.js)"><\/script>/) || [])[1];
ok("dist holds exactly one app bundle, named by content hash", bundles.length === 1 && /^app\.[0-9a-f]{10}\.js$/.test(bundles[0]), bundles.join(", "));
ok("index.html loads that bundle", ref === bundles[0], `${ref} vs ${bundles[0]}`);
ok("the bundle's name is its content hash", ref && ref === `app.${hashOf(readFileSync(join(DIST, ref)))}.js`);
ok("index.html loads config.js with its content hash", html.includes(`config.js?v=${hashOf(readFileSync(join(DIST, "config.js")))}`));
const vj = JSON.parse(readFileSync(join(DIST, "vercel.json"), "utf8"));
const cacheFor = (path) => {
  let v = null;
  for (const r of vj.headers) if (toRegex(r.source).test(path)) for (const h of r.headers) if (h.key.toLowerCase() === "cache-control") v = h.value;
  return v;
};
for (const p of ["/", "/index", "/index.html", "/config.js", "/app.js"]) ok(`vercel.json: ${p} is re-checked on every load`, /no-cache/.test(cacheFor(p) || ""), cacheFor(p));
ok("vercel.json: the hashed bundle may be cached long-term", /immutable/.test(cacheFor(`/${ref}`) || ""), cacheFor(`/${ref}`));

/* ── 2. consecutive builds ── */
const b1 = join(work, "build1");
cpSync(DIST, b1, { recursive: true });
const first = fingerprint(b1);
const again = fingerprint(b1);
ok("an unchanged build keeps its bundle name", first.app === again.app && first.app === ref);
writeFileSync(join(b1, "app.js"), readFileSync(join(b1, first.app), "utf8") + "\n/* next build */\n");   // what the next build writes
const second = fingerprint(b1);
const left = readdirSync(b1).filter((f) => /^app(\.[0-9a-f]{10})?\.js$/.test(f));
ok("a changed build gets a new bundle name", second.app !== first.app, `${first.app} → ${second.app}`);
ok("index.html follows the new bundle", readFileSync(join(b1, "index.html"), "utf8").includes(`src="./${second.app}"`));
ok("the previous bundle is removed from the package", left.length === 1 && left[0] === second.app, left.join(", "));

/* ── 3. real browser, one URL, consecutive deployments ── */
/* deployments: each app is the real bundle plus a line naming its build */
const realApp = readFileSync(join(DIST, ref), "utf8");
const deploy = (name, legacy) => {
  const d = join(work, name);
  cpSync(DIST, d, { recursive: true });
  for (const f of readdirSync(d)) if (/^app\..*\.js$/.test(f)) rmSync(join(d, f));
  writeFileSync(join(d, "app.js"), realApp + `\n;window.__EM_BUILD=${JSON.stringify(name)};\n`);
  if (legacy) {
    /* the early package: fixed ./app.js, cached for a year, never re-checked */
    writeFileSync(join(d, "index.html"), readFileSync(join(d, "index.html"), "utf8")
      .replace(/<script src="\.\/app\.[0-9a-f]{10}\.js"><\/script>/, '<script src="./app.js"></script>')
      .replace(/config\.js\?v=[0-9a-f]{10}/, "config.js"));
    writeFileSync(join(d, "vercel.json"), JSON.stringify({ headers: [{ source: "/app.js", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }] }));
  } else fingerprint(d);
  return d;
};

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".txt": "text/plain", ".md": "text/plain" };
let current = null;
const served = [];
const server = createServer((req, res) => {
  let path = decodeURIComponent((req.url || "/").split("?")[0]);
  const conf = JSON.parse(readFileSync(join(current, "vercel.json"), "utf8"));
  let file = path === "/" || path === "/index" ? "index.html" : "." + path;
  const f = resolve(current, file);
  if (!f.startsWith(resolve(current)) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); res.end(); served.push([path, 404]); return; }
  const body = readFileSync(f), etag = `"${hashOf(body)}"`;
  const headers = { "Content-Type": MIME[extname(f)] || "application/octet-stream", ETag: etag };
  /* Vercel's default for static files, then the deployment's own rules */
  headers["Cache-Control"] = "public, max-age=0, must-revalidate";
  for (const r of conf.headers || []) if (toRegex(r.source).test(path)) for (const h of r.headers) if (h.key.toLowerCase() === "cache-control") headers["Cache-Control"] = h.value;
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); res.end(); served.push([path, 304]); return; }
  res.writeHead(200, headers); res.end(body); served.push([path, 200]);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL0 = `http://127.0.0.1:${server.address().port}/`;

/* a real on-disk browser profile, as a stakeholder's browser has (an in-memory profile is
   too small to cache the bundle); request interception would switch the HTTP cache off,
   so web fonts are kept away by name resolution instead */
const errors = [];
const exe = chromiumPath();
async function profile() {
  const ctx = await chromium.launchPersistentContext(mkdtempSync(join(work, "profile-")), {
    viewport: { width: 390, height: 844 }, ...(exe ? { executablePath: exe } : {}),
    args: ["--no-sandbox", "--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9"],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  return { ctx, page };
}
const build = (page) => page.evaluate(() => window.__EM_BUILD || null);
const signedIn = (page) => page.locator("[data-home-greeting]").waitFor({ timeout: 10000 }).then(() => true, () => false);
async function signIn(page) {
  await page.getByText(/^(ابدأ|Enter EyeMakkah)$/).first().click();
  await page.locator('[data-lang="ar"]').click();
  await page.locator("[data-auth-email]").fill("resident@eyemakkah.demo");
  await page.locator("[data-auth-password]").fill("demo");
  await page.locator("[data-auth-submit]").click();
  return signedIn(page);
}
const visit = async (page) => { await page.goto(URL0, { waitUntil: "load" }); await page.waitForTimeout(500); };
const refresh = async (page) => { await page.reload({ waitUntil: "load" }); await page.waitForTimeout(500); };

const legacyA = deploy("legacy-A", true), legacyB = deploy("legacy-B", true);
const fixedC = deploy("fixed-C", false), fixedD = deploy("fixed-D", false);

/* the old fault, reproduced */
{
  const { ctx, page } = await profile();
  current = legacyA; await visit(page);
  ok("legacy: first visit runs the deployed app", (await build(page)) === "legacy-A");
  current = legacyB; await refresh(page);
  ok("legacy: after a redeploy the browser keeps running the old app (the reported fault)", (await build(page)) === "legacy-A", await build(page));
  await ctx.close();
}

/* the fix, in a browser that still holds the legacy year-long app.js */
{
  const { ctx, page } = await profile();
  current = legacyA; await visit(page);
  ok("returning browser: signed in on the old deployment", await signIn(page));
  const before = await page.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));

  current = fixedC; await refresh(page);
  ok("fixed: a normal refresh loads the new deployment despite the legacy cached app.js", (await build(page)) === "fixed-C", await build(page));
  ok("fixed: still signed in, no login needed", await signedIn(page));
  const after = await page.evaluate(() => JSON.parse(JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]))));
  const keep = JSON.parse(before).filter(([k]) => after.find(([k2]) => k2 === k));
  ok("fixed: every stored account, session, profile and plan key is still there", keep.length === JSON.parse(before).length, `${keep.length}/${JSON.parse(before).length}`);

  current = fixedD; await refresh(page);
  ok("fixed: the next deployment is picked up by a refresh too", (await build(page)) === "fixed-D", await build(page));
  ok("fixed: still signed in after the second deployment", await signedIn(page));

  /* a returning visit with no new deployment: the page is re-checked, the bundle is not re-downloaded */
  served.length = 0;
  const tab = await ctx.newPage();
  await tab.goto(URL0, { waitUntil: "load" }); await tab.waitForTimeout(500);
  const dBundle = readdirSync(fixedD).find((f) => /^app\.[0-9a-f]{10}\.js$/.test(f));
  ok("unchanged deployment: same build in a new tab", (await build(tab)) === "fixed-D");
  ok("unchanged deployment: the page itself is re-checked with the server", served.some(([p]) => p === "/"), JSON.stringify(served));
  ok("unchanged deployment: the app bundle comes from the browser cache", !served.some(([p, s]) => p === `/${dBundle}` && s === 200), JSON.stringify(served));
  await ctx.close();
}

server.close();
rmSync(work, { recursive: true, force: true });
ok("no runtime errors", errors.length === 0, errors.slice(0, 3).join(" | "));
console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);

/* Vercel `source` patterns used in this project: "/", literal paths, "/(.*)" and
   escaped regex groups such as "/app\\.([0-9a-f]+)\\.js" */
function toRegex(source) {
  if (source === "/(.*)") return /^\/.*$/;
  if (/[\\(]/.test(source)) return new RegExp("^" + source + "$");          // already a regex
  return new RegExp("^" + source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$");  // a literal path
}
