import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const myApprovalsPath = path.join(__dirname, "../src/pages/approvals/MyApprovalsPage.jsx");
const requisitionPagePath = path.join(__dirname, "../src/pages/RequisitionPage.jsx");

describe("approver Open document navigation", () => {
  it("opens the requisition inspector drawer instead of Talent Demand create form", () => {
    const source = fs.readFileSync(myApprovalsPath, "utf8");

    assert.match(source, /RequisitionInspectorDrawer/);
    assert.match(source, /setRequisitionDocumentInspectorCode/);
    assert.match(source, /resolveRequisitionDocumentCode\(row\)/);
    assert.doesNotMatch(
      source,
      /handleOpenInTalentDemand[\s\S]*navigate\("\/requisitions"/
    );
  });

  it("does not route approvers through requestor-only Talent Demand authorization", () => {
    const approvalsSource = fs.readFileSync(myApprovalsPath, "utf8");
    assert.doesNotMatch(
      approvalsSource,
      /Open document[\s\S]{0,400}navigate\("\/requisitions"/
    );
  });
});

describe("interviewer requisition creation remains blocked on Talent Demand page", () => {
  it("still gates create flows on canRaiseRequisition", () => {
    const source = fs.readFileSync(requisitionPagePath, "utf8");
    assert.match(source, /AuthorizationService\.canRaiseRequisition/);
    assert.match(source, /not authorized to raise requisitions/i);
  });
});
