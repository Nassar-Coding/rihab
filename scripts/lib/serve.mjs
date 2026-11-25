/* a static server for a built site (directory URLs serve their index.html) */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, join } from "node:path";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".webp": "image/webp",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".txt": "text/plain" };
export async function serve(root, port = 0) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    let f = resolve(root, "." + p);
    if (!f.startsWith(resolve(root))) { res.writeHead(403); res.end(); return; }
    try { if ((await stat(f)).isDirectory()) f = join(f, "index.html"); const b = await readFile(f); res.writeHead(200, { "Content-Type": MIME[extname(f)] || "application/octet-stream" }); res.end(b); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) };
}
