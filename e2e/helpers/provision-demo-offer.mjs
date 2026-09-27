import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "../../../ats-backend");

export function provisionDemoOfferApproval() {
  execSync("node scripts/provisionDemoOfferApprovalE2e.js", {
    cwd: backendRoot,
    stdio: "inherit",
    env: process.env
  });
}
