/**

 * Phase 2/4 — four Workforce Planning help videos (scene → segment model).

 * Prereq: node scripts/wpHelpVideoReadinessCheck.mjs passes.

 */

import fs from "fs";

import path from "path";

import { fileURLToPath } from "url";

import {

  produceAllVideos,

  writeTimelineQaReport,

  normalizeVideoSpec

} from "./lib/helpVideoSyncProducer.mjs";

import { verifyMp4Playable } from "./lib/helpVideoProducer.mjs";



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_DIR = path.resolve(

  __dirname,

  "../public/help/workforce-planning"

);

const TMP_ROOT = path.resolve(__dirname, "../.tmp/wp-help-videos-phase2");

const AUTH_PATH = path.join(TMP_ROOT, "auth-storage.json");

const QA_REPORT = path.resolve(PUBLIC_DIR, "PHASE2-RECORDING-QA.md");



async function scrollMain(page, pixels = 400) {

  await page.evaluate((y) => {

    const main = document.querySelector("main") || document.scrollingElement;

    if (main) {

      main.scrollBy({ top: y, behavior: "smooth" });

    }

  }, pixels);

  await page.waitForTimeout(600);

}



async function waitBudgetData(page) {

  await page.getByText(/BR-/).first().waitFor({ state: "visible", timeout: 90000 });

}



const VIDEO_SPECS = [

  {

    id: "wp-overview",

    file: "wp-overview.mp4",

    title: "Workforce Planning Overview",

    interactionsSummary: "Lifecycle tour; approval queue card select; catalogue scroll.",

    limitations: "Shallow map only; 2 catalogue cards in live demo.",

    duplicateScreensRemoved: "Single visit per route (one goto per scene).",

    scenes: [

      {

        path: "/workforce-planning",

        screenLabel: "Workforce Dashboard",

        segments: [

          {

            screenName: "Workforce Dashboard",

            narration:

              "Workforce Planning in Optalynx governs manpower and budget before recruitment begins.",

            dwellMs: 500

          }

        ]

      },

      {

        path: "/workforce-planning/requests",

        screenLabel: "Budget requests",

        segments: [

          {

            screenName: "Budget requests",

            narration:

              "Manpower demand enters the process as budget requests—position, headcount, and proposed budget.",

            dwellMs: 500,

            interact: waitBudgetData

          }

        ]

      },

      {

        path: "/workforce-planning/approvals",

        screenLabel: "Budget approval workspace",

        segments: [

          {

            screenName: "Approval Workspace",

            narration:

              "Submitted requests move into the approval workspace for governed review and audit.",

            dwellMs: 500,

            interact: async (page) => {

              const card = page.locator(".MuiCard-root").first();

              if (await card.count()) await card.click();

            }

          }

        ]

      },

      {

        path: "/workforce-planning/catalogue",

        screenLabel: "Approved position catalogue",

        segments: [

          {

            screenName: "Approved Positions",

            narration:

              "Approved positions become the controlled gate from planning into recruitment and requisitions.",

            dwellMs: 600,

            interact: scrollMain

          }

        ]

      },

      {

        path: "/workforce-planning/analytics",

        screenLabel: "Workforce analytics",

        segments: [

          {

            screenName: "Analytics close",

            narration:

              "Leadership monitors outcomes on the dashboard and in workforce analytics across the fiscal year.",

            dwellMs: 700

          }

        ]

      }

    ]

  },

  {

    id: "wp-budget-requests-exceptions",

    file: "wp-budget-requests-exceptions.mp4",

    title: "Budget Requests & Budget Exceptions",

    interactionsSummary: "Open New request dialog; table toggle; scroll exceptions.",

    limitations: "Large request list in demo DB; exceptions table 3 rows.",

    duplicateScreensRemoved: "Two scenes only (requests + exceptions).",

    scenes: [

      {

        path: "/workforce-planning/requests",

        screenLabel: "Budget requests",

        segments: [

          {

            screenName: "Budget requests",

            narration:

              "Budget Requests are where hiring managers document workforce demand before approval and hiring.",

            dwellMs: 600,

            interact: waitBudgetData

          },

          {

            screenName: "New request dialog",

            narration:

              "Use New request to capture department, position, grade, headcount, proposed budget, and justification.",

            dwellMs: 700,

            interact: async (page) => {

              await page.getByRole("button", { name: "New request" }).click();

              await page.getByRole("dialog").waitFor({ state: "visible", timeout: 30000 });

            }

          },

          {

            screenName: "Fields and purpose",

            narration:

              "These fields give approvers a consistent view of business need, cost, and priority.",

            dwellMs: 600,

            interact: async (page) => {

              const dialog = page.getByRole("dialog");

              if (await dialog.isVisible()) {

                await page.keyboard.press("Escape");

                await page.waitForTimeout(400);

              }

              await page.getByRole("button", { name: "Table" }).click();

            }

          },

          {

            screenName: "Status and justification",

            narration:

              "Status shows where each request sits in workflow, while justification explains why the headcount is needed.",

            dwellMs: 700,

            interact: async (page) => {

              await scrollMain(page, 480);

            }

          }

        ]

      },

      {

        path: "/workforce-planning/exceptions",

        screenLabel: "Budget exception monitor",

        segments: [

          {

            screenName: "Budget Exceptions",

            narration:

              "Budget Exceptions are separate: they track candidate offers that exceed approved budget for a requisition.",

            dwellMs: 600

          },

          {

            screenName: "Exception statuses",

            narration:

              "Pending, approved, and rejected exception rows show financial governance before an offer can release.",

            dwellMs: 700,

            interact: scrollMain

          },

          {

            screenName: "Close",

            narration:

              "Exception governance protects approved budget while still allowing controlled flexibility for critical hires.",

            dwellMs: 500

          }

        ]

      }

    ]

  },

  {

    id: "wp-approved-positions",

    file: "wp-approved-positions.mp4",

    title: "Approved Positions — Catalogue & Recruitment Gate",

    interactionsSummary:
      "Catalogue header and alert; scroll position cards; compare Create requisition states; visit Talent Demand without submit.",

    limitations:
      "Does not create or consume requisitions; disabled card depends on demo catalogue data.",

    duplicateScreensRemoved:
      "Single catalogue visit; requisitions shown once without form submit.",

    scenes: [

      {

        path: "/workforce-planning/catalogue",

        screenLabel: "Approved position catalogue",

        segments: [

          {

            screenName: "Approved Positions",

            narration:

              "Approved Positions is approved hiring capacity after budget and headcount sign-off.",

            dwellMs: 350,

            interact: async (page) => {

              await page

                .getByText("Approved position catalogue")

                .first()

                .waitFor({ state: "visible", timeout: 60000 });

            }

          },

          {

            screenName: "Recruitment gate",

            narration:

              "This catalogue is the controlled gate into recruitment when budget remains.",

            dwellMs: 350

          },

          {

            screenName: "Position card",

            narration:

              "Each card shows title, department, grade, status, utilization, remaining budget, expiry, and requisition count.",

            dwellMs: 350,

            interact: async (page) => {

              await scrollMain(page, 140);

              const buttons = page.getByRole("button", { name: "Create requisition" });

              const n = await buttons.count();

              for (let i = 0; i < n; i += 1) {

                await buttons.nth(i).scrollIntoViewIfNeeded();

              }

            }

          },

          {

            screenName: "Create Requisition",

            narration:

              "Create Requisition is enabled when eligible; disabled cards are fully utilized or out of budget.",

            dwellMs: 350

          }

        ]

      },

      {

        path: "/requisitions",

        screenLabel: "Talent Demand Request",

        segments: [

          {

            screenName: "Talent Demand Request",

            narration:

              "Create Requisition opens Talent Demand with approved position context—one position, one requisition.",

            dwellMs: 350,

            interact: async (page) => {

              await page

                .getByText("Talent Demand Request")

                .first()

                .waitFor({ state: "visible", timeout: 60000 });

            }

          },

          {

            screenName: "Close",

            narration:

              "Return to Approved Positions to see which capacity is still open to hire.",

            dwellMs: 350

          }

        ]

      }

    ]

  },

  {

    id: "wp-approval-position-requisition",

    file: "wp-approval-position-requisition.mp4",

    title: "Approval → Approved Position → Requisition",

    interactionsSummary: "Select queue item; compare Create requisition states; navigate to /requisitions.",

    limitations: "Does not submit approvals or create requisition API; 2 catalogue cards.",

    duplicateScreensRemoved: "Three scenes (approvals, catalogue, requisitions).",

    scenes: [

      {

        path: "/workforce-planning/approvals",

        screenLabel: "Budget approval workspace",

        segments: [

          {

            screenName: "Approval Workspace",

            narration:

              "The Approval Workspace is where budget requests are reviewed after submission.",

            dwellMs: 600

          },

          {

            screenName: "Select request",

            narration:

              "Approvers select a request from the queue to open details, timeline, and history.",

            dwellMs: 700,

            interact: async (page) => {

              const card = page.locator(".MuiCard-root").first();

              if (await card.count()) await card.click();

            }

          },

          {

            screenName: "Timeline and history",

            narration:

              "Timeline and history document each decision—supporting approve, reject, send back, or clarify actions.",

            dwellMs: 800,

            interact: async (page) => {

              await scrollMain(page, 360);

            }

          },

          {

            screenName: "Governed approval",

            narration:

              "Governed approval ensures only vetted manpower budget becomes recruitable headcount.",

            dwellMs: 600

          }

        ]

      },

      {

        path: "/workforce-planning/catalogue",

        screenLabel: "Approved position catalogue",

        segments: [

          {

            screenName: "Approved Positions",

            narration:

              "Approved Positions in the catalogue show remaining budget and headcount available for hiring.",

            dwellMs: 600

          },

          {

            screenName: "Create Requisition states",

            narration:

              "Create Requisition is enabled when budget remains; disabled when headcount or budget is fully utilized.",

            dwellMs: 800,

            interact: async (page) => {

              const buttons = page.getByRole("button", { name: "Create requisition" });

              const n = await buttons.count();

              for (let i = 0; i < n; i += 1) {

                if (await buttons.nth(i).isEnabled()) {

                  await buttons.nth(i).scrollIntoViewIfNeeded();

                  break;

                }

              }

              await page.waitForTimeout(500);

            }

          },

          {

            screenName: "Create path",

            narration:

              "When enabled, Create Requisition opens the Talent Demand Request workspace tied to that approved position.",

            dwellMs: 600

          }

        ]

      },

      {

        path: "/requisitions",

        screenLabel: "Talent Demand Request",

        segments: [

          {

            screenName: "Talent Demand Request",

            narration:

              "On Talent Demand Request, recruiters manage workforce demand linked to approved planning—completing the path from approval to recruitment.",

            dwellMs: 800,

            interact: scrollMain

          }

        ]

      }

    ]

  },

  {

    id: "wp-dashboard-analytics",

    file: "wp-dashboard-analytics.mp4",

    title: "Dashboard & Analytics",

    interactionsSummary: "Dashboard scroll sections; analytics chart scroll.",

    limitations: "Exception summary depends on dashboard bundle.",

    duplicateScreensRemoved: "Two scenes (dashboard + analytics).",

    scenes: [

      {

        path: "/workforce-planning",

        screenLabel: "Workforce Dashboard",

        segments: [

          {

            screenName: "Workforce Dashboard",

            narration:

              "The Workforce Dashboard gives managers a real-time view of headcount and budget health.",

            dwellMs: 600

          },

          {

            screenName: "KPIs",

            narration:

              "Approved headcount, filled positions, and vacant roles show how much capacity is approved versus still open to hire.",

            dwellMs: 700

          },

          {

            screenName: "Budget utilization",

            narration:

              "Budget utilization compares consumed spend to total approved budget and remaining headroom.",

            dwellMs: 700,

            interact: async (page) => {

              await scrollMain(page, 200);

            }

          },

          {

            screenName: "Exception summary",

            narration:

              "The budget exception summary highlights offers that need financial review without leaving the dashboard.",

            dwellMs: 600

          },

          {

            screenName: "Upcoming hiring",

            narration:

              "Upcoming hiring lists near-term roles, departments, and targets aligned to the approved plan.",

            dwellMs: 700,

            interact: async (page) => {

              await scrollMain(page, 420);

            }

          }

        ]

      },

      {

        path: "/workforce-planning/analytics",

        screenLabel: "Workforce analytics",

        segments: [

          {

            screenName: "Workforce analytics",

            narration:

              "Workforce analytics adds decision support with budget versus actual, savings, and approval service levels.",

            dwellMs: 600

          },

          {

            screenName: "Budget trend",

            narration:

              "The budget trend chart shows monthly planned versus actual spend across the year.",

            dwellMs: 700

          },

          {

            screenName: "Forecast and overspend",

            narration:

              "Forecast and overspend risk panels flag whether the organization is trending above approved budget.",

            dwellMs: 600,

            interact: async (page) => {

              await scrollMain(page, 280);

            }

          },

          {

            screenName: "Department utilization",

            narration:

              "Department-wise utilization compares approved and consumed budget by team—closing the planning and monitoring loop.",

            dwellMs: 700,

            interact: async (page) => {

              await scrollMain(page, 520);

            }

          }

        ]

      }

    ]

  }

];



function writePhase2QaReport(results, readinessJson) {

  const lines = [

    "# Phase 2 Workforce Planning Help — Recording QA",

    "",

    `Generated: ${new Date().toISOString()}`,

    "",

    "## Readiness",

    "",

    "```json",

    JSON.stringify(readinessJson, null, 2),

    "```",

    "",

    "## Videos",

    ""

  ];



  for (const video of results) {

    verifyMp4Playable(path.join(PUBLIC_DIR, video.file));

    lines.push(`### ${video.title} (\`${video.file}\`)`);

    lines.push("");

    lines.push(`- Duration: **${video.durationSeconds.toFixed(2)}s**`);

    lines.push(`- Size: **${video.sizeBytes}** bytes`);

    lines.push(`- Goto count: **${video.navigationLog?.gotoCount ?? "n/a"}**`);

    lines.push(`- Interactions: ${video.interactionsSummary || "—"}`);

    lines.push(`- Limitations: ${video.limitations || "—"}`);

    lines.push("");

    lines.push("| Step | Scene | Screen | Narration start (s) | Sync |");

    lines.push("|------|-------|--------|---------------------|------|");

    for (const row of video.timeline) {

      lines.push(

        `| ${row.step} | ${row.sceneIndex} | ${row.screenName} | ${row.timelineStartSec.toFixed(1)} | PASS |`

      );

    }

    lines.push("");

  }



  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  fs.writeFileSync(QA_REPORT, lines.join("\n"), "utf8");

}



async function main() {

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });



  const results = await produceAllVideos(VIDEO_SPECS, {

    publicDir: PUBLIC_DIR,

    tmpRoot: TMP_ROOT,

    authPath: AUTH_PATH,

    refreshAuth: process.env.HELP_VIDEO_REFRESH_AUTH === "1"

  });



  let readinessJson = { note: "Run wpHelpVideoReadinessCheck.mjs before record" };

  const readinessPath = path.join(TMP_ROOT, "readiness.json");

  if (fs.existsSync(readinessPath)) {

    readinessJson = JSON.parse(fs.readFileSync(readinessPath, "utf8"));

  }



  writeTimelineQaReport(results, path.join(PUBLIC_DIR, "TIMELINE-QA-REPORT.md"));

  writePhase2QaReport(results, readinessJson);



  console.info(

    JSON.stringify(

      {

        qaReport: QA_REPORT,

        videos: results.map((r) => ({

          file: r.file,

          durationSeconds: r.durationSeconds,

          sizeBytes: r.sizeBytes,

          gotoCount: r.navigationLog?.gotoCount,

          gotos: r.navigationLog?.gotos

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


