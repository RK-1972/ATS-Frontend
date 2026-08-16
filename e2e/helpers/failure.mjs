import fs from "fs";
import path from "path";

export class DemoRunFailure extends Error {
  constructor(stepNo, stepName, details) {
    super(`FAILED STEP #${stepNo} — ${stepName}: ${details.message}`);
    this.stepNo = stepNo;
    this.stepName = stepName;
    this.details = details;
    this.name = "DemoRunFailure";
  }
}

export async function captureFailure(page, testInfo, stepNo, stepName, details) {
  const artifactDir = path.join(
    testInfo.outputDir,
    `step-${String(stepNo).padStart(2, "0")}-${stepName.replace(/\s+/g, "-").toLowerCase()}`
  );
  fs.mkdirSync(artifactDir, { recursive: true });

  const screenshotPath = path.join(artifactDir, "failure.png");
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

  const meta = {
    stepNo,
    stepName,
    url: page.url(),
    ...details,
    screenshotPath
  };

  fs.writeFileSync(
    path.join(artifactDir, "failure.json"),
    JSON.stringify(meta, null, 2),
    "utf8"
  );

  throw new DemoRunFailure(stepNo, stepName, {
    ...details,
    screenshotPath
  });
}
