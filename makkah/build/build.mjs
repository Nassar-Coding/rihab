import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fingerprint } from "./fingerprint.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

/* a clean dist each build: the static files from public/, then the bundle */
if (!checkOnly) rmSync(resolve(root, "dist"), { recursive: true, force: true });
mkdirSync(resolve(root, "dist"), { recursive: true });
if (!checkOnly) cpSync(resolve(root, "public"), resolve(root, "dist"), { recursive: true });

const result = await build({
  entryPoints: [resolve(root, "src/main.jsx")],
  bundle: true,
  minify: !checkOnly,
  format: "iife",
  target: ["es2019"],
  jsx: "automatic",
  loader: { ".js": "jsx", ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: resolve(root, "dist/app.js"),
  write: !checkOnly,
  logLevel: "info",
  metafile: true,
});

if (!checkOnly) {
  /* publish the bundle under a content-hash name and point index.html at it (see fingerprint.mjs) */
  const { app, version, bytes } = fingerprint(resolve(root, "dist"));
  writeFileSync(
    resolve(root, "dist/BUILD_INFO.txt"),
    `Rihab Makkah bundle\nbuilt: ${new Date().toISOString()}\nversion: ${version}\nbundle: ${app}\nbundle bytes: ${bytes}\n`
  );
  console.log(`dist/${app} — ${(bytes / 1024).toFixed(1)} KB`);
} else {
  console.log("syntax + import check passed");
}
