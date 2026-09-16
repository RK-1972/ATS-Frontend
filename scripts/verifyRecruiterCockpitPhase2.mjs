import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

const viewModel = read("src/pages/recruiter-home/recruiterHomeViewModel.js");
const dateFilter = read("src/pages/recruiter-home/recruiterHomeDateFilter.js");
const inspector = read("src/components/recruiter-home/CockpitInspectorPanel.jsx");
const sidebar = read("src/components/recruiter-home/CockpitRequisitionSidebar.jsx");
const table = read("src/components/recruiter-home/CockpitRequisitionsTable.jsx");
const page = read("src/pages/recruiter-home/RecruiterHomePage.jsx");
const helpers = read("src/components/recruiter-home/recruiterHomeUiHelpers.js");

assert.equal(viewModel.includes("summary.interviewsToday"), true);
assert.equal(viewModel.includes("summary.interviewsInRange"), false);
assert.equal(viewModel.includes("resolveHiringManagerDisplay"), true);
assert.equal(viewModel.includes("resolveRequisitionSidebarNote"), true);
assert.equal(viewModel.includes("openPositions"), true);

assert.equal(dateFilter.includes("localCalendarDate"), true);
assert.equal(dateFilter.includes("toISOString().slice(0, 10)"), false);

assert.equal(inspector.includes("recruiterRequisitionPath"), true);
assert.equal(inspector.includes('"/requisitions"'), false);
assert.equal(inspector.includes("openPositions"), true);

assert.equal(sidebar.includes('"/candidates"'), false);
assert.equal(sidebar.includes("recruiterRequisitionPath"), true);
assert.equal(sidebar.includes("MdShare"), false);
assert.equal(sidebar.includes("MdMoreHoriz"), false);
assert.equal(sidebar.includes("briefingNote"), false);

assert.equal(table.includes("openPositions"), true);
assert.equal(table.includes("funnelCurrent"), false);

assert.equal(page.includes('navigate("/recruiter/my-requisitions")'), true);
assert.equal(page.includes("resolveActionNavigation"), true);
assert.equal(page.includes("setSelectedReqId(null)"), false);

assert.equal(helpers.includes("resolveActionNavigation"), true);
assert.equal(helpers.includes("formatLegacyInterviewDisplayDate"), true);

console.log("Recruiter Cockpit phase 2 wiring verification passed.");
