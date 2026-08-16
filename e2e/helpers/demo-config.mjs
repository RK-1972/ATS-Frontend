import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  __dirname,
  "../../../ats-backend/demo/e2e-demo.manifest.json"
);

export const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

export const MARKER = manifest.marker;
export const POSITION_TITLE = manifest.scenario.positionTitle;
/** Valid md_designations name used on budget/requisition forms (IT Infrastructure) */
export const DESIGNATION_TITLE = "Senior Test Automation Engineer";
export const GRADE_CODE = "G5";
export const BUDGET_JUSTIFICATION = `${manifest.marker} ${manifest.uiRecordingHints.budgetJustification}`;
export const DEPARTMENT = manifest.scenario.department;
export const CANDIDATE_EMAIL = manifest.candidate.email;
export const CANDIDATE_NAME = manifest.candidate.fullName;
export const OFFER_CTC = String(manifest.scenario.offeredCtcInr);
export const RESUME_PATH = path.resolve(
  __dirname,
  "../../../ats-backend/demo/assets/demo-resume.pdf"
);

export function demoPassword() {
  const envVar = manifest.users?.passwordEnvVar || "E2E_DEMO_PASSWORD";
  return process.env[envVar] || manifest.users?.defaultPassword;
}

export function userEmail(key) {
  const account = manifest.users.accounts.find((item) => item.key === key);
  if (!account) {
    throw new Error(`Unknown demo user key: ${key}`);
  }
  return account.email;
}

export function offerApproverCredentials(sequenceNo) {
  const approver = manifest.offerApproval.approvers.find(
    (item) => item.sequenceNo === sequenceNo
  );
  if (!approver) {
    throw new Error(`Unknown offer approver sequence: ${sequenceNo}`);
  }

  const suffix = sequenceNo === 1 ? "1" : "2";
  const email =
    process.env[`DEMO_OFFER_APPROVER_${suffix}_EMAIL`] || approver.email;
  const password = demoPassword();

  return { email, password, employeeCode: approver.employeeCode };
}

export function futureInterviewDate(daysAhead = 7) {
  const date = new Date();
  date.setDate(date.getDate() + Number(daysAhead || 7));
  return date.toISOString().slice(0, 10);
}

export function futureInterviewTime() {
  return manifest.interview.scheduleTime || "10:30";
}
