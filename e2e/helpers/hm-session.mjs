import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sessionPath = path.resolve(__dirname, "../artifacts/wave1-hm-session.json");

export function loadHmBrowserSession() {
  if (!fs.existsSync(sessionPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(sessionPath, "utf8"));
}

export async function applyEmployeeSession(page, session) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ payload }) => {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      localStorage.setItem(
        "work_assignments",
        JSON.stringify(payload.work_assignments || [])
      );
      localStorage.setItem(
        "work_assignment_status",
        payload.work_assignment_status || ""
      );
      localStorage.setItem(
        "workspace",
        JSON.stringify(payload.workspace || {})
      );
    },
    { payload: session }
  );
}
