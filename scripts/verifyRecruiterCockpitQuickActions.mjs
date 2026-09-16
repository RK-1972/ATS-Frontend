import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

const panelSource = read("src/components/recruiter-home/CockpitQuickActionsPanel.jsx");
const pageSource = read("src/pages/recruiter-home/RecruiterHomePage.jsx");

assert.equal(panelSource.includes('onQuickAction?.("schedule")') || panelSource.includes("onQuickAction?.(action.key)"), true);
assert.equal(panelSource.includes("toggle: true"), false);
assert.equal(panelSource.includes('route: "/requisitions"'), false);

assert.equal(pageSource.includes('navigate("/interview-schedule")'), true);
assert.equal(pageSource.includes('navigate("/recruiter/my-requisitions")'), true);
assert.equal(pageSource.includes("formatLegacyInterviewDisplayDate"), true);
assert.equal(pageSource.includes("interviewsTodayOnly"), false);

console.log("Recruiter Cockpit quick action wiring verification passed.");
