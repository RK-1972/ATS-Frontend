import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  STANDARD_REPORT_FIXED_OPERATORS,
  formatStandardReportOperatorLabel
} from "../src/components/reports/standardReportParameterUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(path.join(frontendRoot, relativePath), "utf8");
}

test("formatStandardReportOperatorLabel renders business-friendly labels", () => {
  assert.equal(formatStandardReportOperatorLabel("equals"), "Equals");
  assert.equal(formatStandardReportOperatorLabel("between"), "Between");
  assert.equal(formatStandardReportOperatorLabel("starts_with"), "Starts With");
});

test("Candidate Pipeline retains configured fixed operators", () => {
  assert.equal(STANDARD_REPORT_FIXED_OPERATORS.stage_name, "equals");
  assert.equal(STANDARD_REPORT_FIXED_OPERATORS.department, "equals");
  assert.equal(STANDARD_REPORT_FIXED_OPERATORS.assigned_recruiter_code, "equals");
  assert.equal(STANDARD_REPORT_FIXED_OPERATORS.requisition_code, "equals");
  assert.equal(STANDARD_REPORT_FIXED_OPERATORS.applied_on, "between");
});

test("Standard Report parameter panel hides generic operator selector", () => {
  const source = readSource("src/components/reports/StandardReportParameterPanel.jsx");

  assert.equal(source.includes('label="Operator"'), false);
  assert.equal(source.includes("<InputLabel"), false);
  assert.equal(source.includes("formatStandardReportOperatorLabel"), true);
});

test("Ad-hoc Report Builder still exposes operator selector", () => {
  const source = readSource("src/components/reports/ReportFilterBuilder.jsx");

  assert.equal(source.includes('label="Operator"'), true);
  assert.equal(source.includes("<Select"), true);
});

test("Shared recruiter lookup uses report-scoped endpoint", () => {
  const source = readSource("src/hooks/useReportFilterLookups.js");

  assert.equal(source.includes("reportsClient"), true);
  assert.equal(source.includes("listFilterRecruiters"), true);
  assert.equal(source.includes("recruitmentRepository"), false);
});

test("Hiring manager lookup uses report-scoped endpoint", () => {
  const source = readSource("src/hooks/useReportFilterLookups.js");

  assert.equal(source.includes("listFilterHiringManagers"), true);
  assert.equal(source.includes('API.get("/all-hiring-managers")'), false);
});

test("Department lookups remain on master data", () => {
  const source = readSource("src/hooks/useReportFilterLookups.js");

  assert.equal(source.includes("masterDataClient"), true);
  assert.equal(source.includes(".getAll()"), true);
  assert.equal(source.includes("MASTER_DEPARTMENTS"), true);
});
