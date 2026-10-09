import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { loginAs } from "../../e2e/helpers/session.mjs";
import { demoPassword, userEmail } from "../../e2e/helpers/demo-config.mjs";

const BASE_URL = process.env.HELP_VIDEO_BASE_URL || "http://localhost:5173";
const VIEWPORT = { width: 1280, height: 720 };

export function getHelpVideoBaseUrl() {
  return BASE_URL;
}

export function getHelpVideoViewport() {
  return VIEWPORT;
}

export async function ensureAuthenticatedStorageState(authPath) {
  fs.mkdirSync(path.dirname(authPath), { recursive: true });

  if (fs.existsSync(authPath)) {
    return authPath;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: VIEWPORT
  });
  const page = await context.newPage();

  await loginAs(page, userEmail("admin"), demoPassword());
  await context.storageState({ path: authPath });
  await browser.close();

  return authPath;
}
