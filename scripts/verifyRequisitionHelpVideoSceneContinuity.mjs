/**
 * Scene continuity for requisition help video (dry navigation only).
 */
import { chromium } from "playwright";
import { normalizeVideoSpec } from "./lib/helpVideoSyncProducer.mjs";
import {
  ensureAuthenticatedStorageState,
  getHelpVideoBaseUrl,
  getHelpVideoViewport
} from "./lib/helpVideoSession.mjs";
import { VIDEO_SPECS } from "./recordRequisitionHelpVideo.mjs";

async function dryRunNavigation(spec, authPath) {
  const scenes = normalizeVideoSpec(spec);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: getHelpVideoBaseUrl(),
    viewport: getHelpVideoViewport(),
    storageState: authPath
  });
  const page = await context.newPage();

  let gotoCount = 0;
  const gotos = [];

  const originalGoto = page.goto.bind(page);
  page.goto = async (...args) => {
    gotoCount += 1;
    gotos.push(args[0]);
    return originalGoto(...args);
  };

  for (const scene of scenes) {
    await page.goto(scene.path, { waitUntil: "domcontentloaded" });
    for (const segment of scene.segments) {
      if (typeof segment.interact === "function") {
        try {
          await segment.interact(page);
        } catch {
          // scroll targets may vary; goto count still valid
        }
      }
    }
  }

  await browser.close();

  return { gotoCount, gotos };
}

async function main() {
  const authPath = await ensureAuthenticatedStorageState(
    ".tmp/req-help-video/auth-storage.json"
  );

  const spec = VIDEO_SPECS[0];
  const scenes = normalizeVideoSpec(spec);
  const expectedGotos = scenes.length;
  const nav = await dryRunNavigation(spec, authPath);
  const pass = nav.gotoCount === expectedGotos;

  console.info(
    JSON.stringify(
      {
        id: spec.id,
        expectedGotos,
        actualGotos: nav.gotoCount,
        gotos: nav.gotos,
        pass
      },
      null,
      2
    )
  );

  if (!pass) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
