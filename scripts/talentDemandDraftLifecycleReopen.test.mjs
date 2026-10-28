import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const requisitionsSidebarPath = path.join(
  __dirname,
  "../src/components/requisitions/RequisitionsSidebar.jsx"
);
const adminNavPath = path.join(__dirname, "../src/components/layout/AdminNavRail.jsx");
const recruiterNavPath = path.join(
  __dirname,
  "../src/components/layout/RecruiterNavRail.jsx"
);
const wpSidebarPath = path.join(
  __dirname,
  "../src/components/workforce-planning/WorkforcePlanningSidebar.jsx"
);
const myDraftsPagePath = path.join(__dirname, "../src/pages/talent-demand/MyDraftsPage.jsx");
const requisitionPagePath = path.join(__dirname, "../src/pages/RequisitionPage.jsx");
const experienceValidationPath = path.join(
  __dirname,
  "../src/utils/experienceRangeValidation.js"
);

describe("Draft Requisitions navigation placement", () => {
  it("lists Draft Requisitions under the Requisitions sidebar section", () => {
    const source = fs.readFileSync(requisitionsSidebarPath, "utf8");
    assert.match(source, /Draft Requisitions/);
    assert.match(source, /DRAFT_REQUISITIONS_PATH/);
    assert.match(source, /REQUISITION_QUEUE_SECTIONS\.map/);
  });

  it("does not expose Draft Requisitions as a primary Admin nav icon", () => {
    const source = fs.readFileSync(adminNavPath, "utf8");
    assert.doesNotMatch(source, /label:\s*"Draft Requisitions"/);
    assert.match(source, /requisitions\/my-drafts/);
  });

  it("does not expose Draft Requisitions as a primary Recruiter nav icon", () => {
    const source = fs.readFileSync(recruiterNavPath, "utf8");
    assert.doesNotMatch(source, /Draft Requisitions/);
  });

  it("does not expose Draft Requisitions in Workforce Planning sidebar", () => {
    const source = fs.readFileSync(wpSidebarPath, "utf8");
    assert.doesNotMatch(source, /Draft Requisitions/);
  });
});

describe("MyDraftsPage lifecycle UI", () => {
  it("does not render New Talent Demand on the draft list page", () => {
    const source = fs.readFileSync(myDraftsPagePath, "utf8");
    assert.doesNotMatch(source, /New Talent Demand/);
    assert.match(source, /RequisitionsSidebar/);
  });
});

describe("RequisitionPage draft resume and submit safeguards", () => {
  it("hydrates dependent dropdown data before applying draft form state", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /await loadRequisitionFormProjects\(draft\.client_id\)/);
    assert.match(source, /await loadRequisitionFormHiringManagers\(draft\.project_id\)/);
    assert.match(source, /setFormData\(\s*mapDraftToFormData/);
    assert.match(source, /draftHydratedRef/);
  });

  it("requires confirmation before submitting a draft", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /submitConfirmOpen/);
    assert.match(source, /EnterpriseConfirmationDialog/);
    assert.match(source, /performSubmitDraft/);
  });

  it("locks openings count to the approved position on the form", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /openingsCountReadOnly/);
    assert.match(source, /approved_headcount/);
  });
});

describe("experience input sanitization", () => {
  it("rejects malformed negative syntax such as trailing minus signs", async () => {
    const { sanitizeExperienceInput, collectExperienceRangeErrors } = await import(
      `file://${experienceValidationPath.replace(/\\/g, "/")}`
    );
    assert.equal(sanitizeExperienceInput("6-"), null);
    assert.equal(sanitizeExperienceInput("-2"), null);
    assert.equal(sanitizeExperienceInput("2.5"), "2.5");
    assert.equal(sanitizeExperienceInput(""), "");
    assert.equal(sanitizeExperienceInput(null), "");

    const malformed = collectExperienceRangeErrors("6-", "");
    assert.ok(malformed.some((message) => /experience_min must be a valid number/.test(message)));
  });

  it("does not coerce blank optional experience fields to zero on validation", async () => {
    const { collectExperienceRangeErrors } = await import(
      `file://${experienceValidationPath.replace(/\\/g, "/")}`
    );
    assert.deepEqual(collectExperienceRangeErrors("", ""), []);
    assert.deepEqual(collectExperienceRangeErrors(null, undefined), []);
  });
});
