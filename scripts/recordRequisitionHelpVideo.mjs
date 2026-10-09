/**

 * Read-only producer for public/help/requisitions/req-create-basics.mp4

 * Prereq: frontend :5173, backend :5000, demo users seeded.

 * Does not save drafts, submit, or create requisitions.

 */

import fs from "fs";

import path from "path";

import { fileURLToPath } from "url";

import { produceAllVideos, writeTimelineQaReport } from "./lib/helpVideoSyncProducer.mjs";

import {

  verifyMp4Playable,

  probeDurationSeconds,

  runFfmpeg

} from "./lib/helpVideoProducer.mjs";



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_DIR = path.resolve(__dirname, "../public/help/requisitions");

const TMP_ROOT = path.resolve(__dirname, "../.tmp/req-help-video");

const AUTH_PATH = path.join(TMP_ROOT, "auth-storage.json");

const QA_REPORT = path.resolve(PUBLIC_DIR, "TIMELINE-QA-REPORT.md");



/** Instant scroll keeps Playwright webm length closer to the narration timeline. */

async function scrollPage(page, pixels = 380) {

  await page.evaluate((y) => {

    window.scrollBy({ top: y, behavior: "auto" });

  }, pixels);

  await page.waitForTimeout(220);

}



async function scrollToText(page, text) {

  const locator = page.getByText(text, { exact: false }).first();

  await locator.scrollIntoViewIfNeeded();

  await page.waitForTimeout(220);

}



async function scrollFormTop(page) {

  await page.evaluate(() => {

    window.scrollTo({ top: 0, behavior: "auto" });

  });

  await page

    .getByText("Talent Demand", { exact: false })

    .first()

    .waitFor({ state: "visible", timeout: 30000 });

  await page.waitForTimeout(400);

}



/**

 * Raw screen capture can run longer than the narration timeline; trim so the

 * file ends shortly after the last segment dwell (no silent frozen tail).

 */

function trimMp4ToTimelineEnd(mp4Path, timeline, endDwellSec = 1.15) {

  const lastEnd = timeline.at(-1)?.timelineEndSec ?? 0;

  const trimTo = lastEnd + endDwellSec;

  const { durationSeconds } = probeDurationSeconds(mp4Path);



  if (!trimTo || durationSeconds <= trimTo + 0.12) {

    return durationSeconds;

  }



  const tmpPath = `${mp4Path}.trim.tmp.mp4`;

  runFfmpeg([

    "-y",

    "-i",

    mp4Path,

    "-t",

    trimTo.toFixed(3),

    "-c:v",

    "libx264",

    "-pix_fmt",

    "yuv420p",

    "-c:a",

    "aac",

    "-b:a",

    "128k",

    "-movflags",

    "+faststart",

    tmpPath

  ]);

  fs.renameSync(tmpPath, mp4Path);

  verifyMp4Playable(mp4Path);

  return probeDurationSeconds(mp4Path).durationSeconds;

}



const VIDEO_SPECS = [

  {

    id: "req-create-basics",

    file: "req-create-basics.mp4",

    title: "Creating a requisition",

    interactionsSummary:

      "Scroll the Talent Demand form top-to-bottom; highlight Actions without clicking.",

    limitations:

      "Read-only; does not save, submit, or create. Dropdown values depend on demo data.",

    duplicateScreensRemoved:

      "One visit to /requisitions; no Approved Position catalogue navigation.",

    scenes: [

      {

        path: "/requisitions",

        screenLabel: "Talent Demand Request",

        segments: [
          {
            screenName: "Talent Demand form",
            narration:
              "Use the Talent Demand form on Requisitions to document a complete hiring request for approval.",
            dwellMs: 300,
            interact: async (page) => {
              await page
                .getByText("Talent Demand Request")
                .first()
                .waitFor({ state: "visible", timeout: 60000 });
              await scrollFormTop(page);
            }
          },
          {
            screenName: "Role and skills",
            narration:
              "General Information and Position Details cover title, openings, experience range, job description, and primary or secondary skills.",
            dwellMs: 260,
            interact: async (page) => {
              await scrollToText(page, "General Information");
              await scrollToText(page, "Position Details");
              await page
                .getByPlaceholder("Job Description")
                .first()
                .scrollIntoViewIfNeeded();
              await scrollToText(page, "Skills");
            }
          },
          {
            screenName: "Hiring information",
            narration:
              "Hiring Information sets hiring manager, work location, employment type, priority, and target date.",
            dwellMs: 260,
            interact: async (page) => {
              await scrollToText(page, "Hiring Information");
            }
          },
          {
            screenName: "Approval and actions",
            narration:
              "In Approval, select an Approved Position and route. Save Draft keeps work in progress; Create Requisition enters Requisition Approval when fields are complete.",
            dwellMs: 280,
            interact: async (page) => {
              await scrollToText(page, "Approval");
              await scrollToText(page, "Actions");
              const create = page.getByRole("button", { name: /Create Requisition/i });
              if (await create.count()) {
                await create.first().scrollIntoViewIfNeeded();
              }
            }
          },
          {
            screenName: "Form overview",
            narration: "Review every section on this form before you submit for approvers.",
            dwellMs: 850,
            interact: async (page) => {
              await scrollFormTop(page);
            }
          }
        ]

      }

    ]

  }

];



function appendRequisitionQaNotes(reportPath, notes) {

  if (!fs.existsSync(reportPath)) return;

  fs.appendFileSync(reportPath, `\n${notes}\n`, "utf8");

}



async function main() {

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });



  const results = await produceAllVideos(VIDEO_SPECS, {

    publicDir: PUBLIC_DIR,

    tmpRoot: TMP_ROOT,

    authPath: AUTH_PATH,

    refreshAuth: process.env.HELP_VIDEO_REFRESH_AUTH === "1"

  });



  for (const row of results) {

    const outMp4 = path.join(PUBLIC_DIR, row.file);

    const preTrimVideo = row.videoSeconds;

    const preTrimDuration = row.durationSeconds;

    const timelineEnd = row.timeline.at(-1)?.timelineEndSec ?? 0;



    const trimmedDuration = trimMp4ToTimelineEnd(outMp4, row.timeline);

    row.durationSeconds = trimmedDuration;

    row.sizeBytes = fs.statSync(outMp4).size;

    row.trimApplied = trimmedDuration < preTrimDuration - 0.1;

    row.preTrimDurationSeconds = preTrimDuration;

    row.preTrimVideoSeconds = preTrimVideo;

    row.timelineEndSec = timelineEnd;



    verifyMp4Playable(outMp4);

  }



  writeTimelineQaReport(results, QA_REPORT);



  appendRequisitionQaNotes(

    QA_REPORT,

    [

      "## Revision notes (req-create-basics)",

      "",

      "- **Redundancy removed:** Narration no longer explains Approved Position catalogue, budget/headcount planning, or the recruitment gate (covered by `wp-approved-positions`).",

      "- **Blank tail (v1):** Playwright webm (~`videoSeconds`) exceeded the narration timeline (`timelineEndSec`) by ~16s; mux kept full video and padded audio, yielding a silent frozen tail after ~47s.",

      "- **Fix:** Lighter instant scrolls + post-trim to `timelineEndSec + 1.15s` in `recordRequisitionHelpVideo.mjs` (requisition producer only).",

      ""

    ].join("\n")

  );



  console.info(

    JSON.stringify(

      {

        qaReport: QA_REPORT,

        videos: results.map((r) => ({

          file: r.file,

          durationSeconds: r.durationSeconds,

          preTrimDurationSeconds: r.preTrimDurationSeconds,

          timelineEndSec: r.timelineEndSec,

          trimApplied: r.trimApplied,

          gotoCount: r.navigationLog?.gotoCount

        }))

      },

      null,

      2

    )

  );

}



export { VIDEO_SPECS };



const isDirectRun =

  process.argv[1] &&

  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);



if (isDirectRun) {

  main().catch((error) => {

    console.error(error);

    process.exit(1);

  });

}


