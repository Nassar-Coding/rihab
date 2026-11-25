import { createRequire } from "node:module";
import { existsSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
/* the machine's pre-installed Chromium when present, Playwright's own otherwise */
export const launch = (o = {}) => chromium.launch({ ...(existsSync("/opt/pw-browsers/chromium") ? { executablePath: "/opt/pw-browsers/chromium" } : {}), ...o });
