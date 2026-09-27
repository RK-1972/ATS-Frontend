import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { demoPassword, userEmail } from "./demo-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const identityPath = path.resolve(__dirname, "../artifacts/wave1-identities.json");

export function employeePassword() {
  return (
    process.env.WAVE1_EMPLOYEE_PASSWORD ||
    process.env.E2E_DEMO_PASSWORD ||
    demoPassword()
  );
}

export function wave1Users() {
  const recruiterEmail = userEmail("recruiter");
  const interviewerEmail = userEmail("interviewer");

  let dbIdentities = {};
  if (fs.existsSync(identityPath)) {
    dbIdentities = JSON.parse(fs.readFileSync(identityPath, "utf8"));
  }

  return {
    recruiter: { email: recruiterEmail, password: employeePassword() },
    interviewer: { email: interviewerEmail, password: employeePassword() },
    hiringManager: dbIdentities.hiringManager
      ? {
          email: dbIdentities.hiringManager.email_id,
          password: employeePassword()
        }
      : null,
    taLead: dbIdentities.taLead
      ? {
          email: dbIdentities.taLead.email_id,
          password: employeePassword()
        }
      : null
  };
}
