/**
 * Verifies scene→segment navigation plan and live goto counts (dry navigation loop).
 */
import { chromium } from "playwright";
import {
  normalizeVideoSpec,
  stepsToScenes
} from "./lib/helpVideoSyncProducer.mjs";
import { ensureAuthenticatedStorageState, getHelpVideoBaseUrl, getHelpVideoViewport } from "./lib/helpVideoSession.mjs";
import { VIDEO_SPECS } from "./recordWpHelpVideosPhase2.mjs";

function assertPlan(spec) {
  const scenes = normalizeVideoSpec(spec);
  const expectedGotos = scenes.length;
  const perScene = scenes.map((scene, index) => ({
    scene: index + 1,
    path: scene.path,
    segmentCount: scene.segments.length,
    expectedGotosForScene: 1
  }));

  return { id: spec.id, expectedGotos, perScene, scenes };
}

async function dryRunNavigation(spec, authPath) {
  const scenes = normalizeVideoSpec(spec);
  const baseURL = getHelpVideoBaseUrl();
  const viewport = getHelpVideoViewport();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    viewport,
    storageState: authPath
  });
  const page = await context.newPage();

  let gotoCount = 0;
  let reloadCount = 0;
  const gotos = [];

  const originalGoto = page.goto.bind(page);
  page.goto = async (...args) => {
    gotoCount += 1;
    gotos.push(args[0]);
    return originalGoto(...args);
  };

  const originalReload = page.reload?.bind(page);
  if (originalReload) {
    page.reload = async (...args) => {
      reloadCount += 1;
      return originalReload(...args);
    };
  }

  for (const scene of scenes) {
    await page.goto(scene.path, { waitUntil: "domcontentloaded" });
    for (const segment of scene.segments) {
      if (typeof segment.interact === "function") {
        try {
          await segment.interact(page);
        } catch {
          // interact may need full data; navigation count still valid
        }
      }
    }
  }

  await browser.close();

  return { gotoCount, reloadCount, gotos };
}

async function main() {
  const authPath = await ensureAuthenticatedStorageState(
    ".tmp/wp-help-videos-phase2/auth-storage.json"
  );

  const plans = VIDEO_SPECS.map(assertPlan);
  const live = [];

  for (const spec of VIDEO_SPECS) {
    const nav = await dryRunNavigation(spec, authPath);
    const plan = plans.find((p) => p.id === spec.id);
    live.push({
      id: spec.id,
      expectedGotos: plan.expectedGotos,
      actualGotos: nav.gotoCount,
      reloadCount: nav.reloadCount,
      pass: plan.expectedGotos === nav.gotoCount && nav.reloadCount === 0,
      gotos: nav.gotos
    });
  }

  const legacySteps = VIDEO_SPECS[1].scenes.flatMap((scene) =>
    scene.segments.map((seg) => ({
      path: scene.path,
      screenLabel: scene.screenLabel,
      screenName: seg.screenName,
      narration: seg.narration,
      dwellMs: seg.dwellMs,
      interact: seg.interact
    }))
  );
  const regrouped = stepsToScenes(legacySteps);
  const regroupPass =
    regrouped.length === 2 &&
    regrouped[0].segments.length === 4 &&
    regrouped[1].segments.length === 3;

  const report = {
    plans,
    liveNavigation: live,
    stepsToScenesRegression: regroupPass,
    allPass: live.every((row) => row.pass) && regroupPass
  };

  console.info(JSON.stringify(report, null, 2));

  if (!report.allPass) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
