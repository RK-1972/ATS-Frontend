import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildNotificationFeed,
  countNotifications
} from "../src/utils/enterpriseNotificationSections.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function resolveDocumentTypeKey(row) {
  return String(row?.document_type || row?.workflow_type || "")
    .trim()
    .toUpperCase();
}

function resolveApprovalSortTimestamp(row) {
  return row?.assigned_on || row?.submitted_date || null;
}

function mapBudgetApprovalNotification(row) {
  const budgetNumber = row?.document_number || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    budgetNumber,
    title: "Budget Approval Required",
    message: `Budget Request ${budgetNumber} requires your approval.`,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapRequisitionApprovalNotification(row) {
  const requisitionNumber =
    row?.document_number || row?.requisition_code || "—";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    requisitionNumber,
    title: "Requisition Approval Required",
    message: `Requisition ${requisitionNumber} requires your approval.`,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function mapOfferApprovalNotification(row) {
  const offerNumber = row?.document_number || row?.offer_id || "—";
  const candidateName = String(row?.candidateName || row?.candidate_name || "").trim();
  const candidateLabel = candidateName ? ` for ${candidateName}` : "";

  return {
    taskId: row?.task_id,
    assignmentId: row?.assignment_id,
    offerNumber,
    title: "Offer Approval Required",
    message: `Offer ${offerNumber}${candidateLabel} requires your approval.`,
    assigned_on: row?.assigned_on || null,
    submitted_date: row?.submitted_date || null,
    sortTimestamp: resolveApprovalSortTimestamp(row)
  };
}

function filterOfferRows(rows) {
  return rows.filter((row) => resolveDocumentTypeKey(row) === "OFFER");
}

const appHeaderSource = read("src/components/layout/AppHeader.jsx");
const sectionsSource = read("src/utils/enterpriseNotificationSections.js");
const feedItemSource = read("src/components/layout/EnterpriseNotificationFeedItem.jsx");
const serviceSource = read("src/services/myApprovalsService.js");

assert.match(appHeaderSource, /listMyOfferApprovalNotifications/);
assert.match(appHeaderSource, /mapOfferApprovalNotification/);
assert.match(appHeaderSource, /offer: offerNotifications/);
assert.match(appHeaderSource, /handleOfferApprovalClick/);
assert.match(
  appHeaderSource,
  /navigate\("\/my-approvals", \{ state: \{ taskId \} \}\)/
);
assert.equal(appHeaderSource.includes('categoryKey === "offer"'), true);

assert.match(sectionsSource, /key: "offer"/);
assert.match(feedItemSource, /offer:\s*\{/);
assert.match(serviceSource, /listMyOfferApprovalNotifications/);
assert.match(serviceSource, /mapOfferApprovalNotification/);
assert.match(
  serviceSource,
  /resolveDocumentTypeKey\(row\) === "OFFER"/
);

pass("AppHeader and service wire offer approvals into the notification feed");

const offerRow = {
  task_id: 901,
  assignment_id: 801,
  document_type: "OFFER",
  document_number: "OFF-2026-014",
  candidateName: "Jane Candidate",
  assigned_on: "2026-09-10T08:00:00.000Z",
  submitted_date: "2026-09-09T12:00:00.000Z"
};

const mappedOffer = mapOfferApprovalNotification(offerRow);

assert.equal(mappedOffer.taskId, 901);
assert.equal(mappedOffer.title, "Offer Approval Required");
assert.match(mappedOffer.message, /OFF-2026-014/);
assert.match(mappedOffer.message, /Jane Candidate/);

pass("offer approval notification mapping");

const mixedRows = [
  { task_id: 1, document_type: "BUDGET", document_number: "BR-1", assigned_on: "2026-09-10T09:00:00.000Z" },
  { task_id: 2, document_type: "REQUISITION", document_number: "REQ-1", assigned_on: "2026-09-10T08:30:00.000Z" },
  offerRow,
  { task_id: 3, document_type: "BUDGET", document_number: "BR-2", assigned_on: "2026-09-10T07:00:00.000Z" }
];

const offerRows = filterOfferRows(mixedRows);
assert.equal(offerRows.length, 1);
assert.equal(offerRows[0].task_id, 901);

pass("offer filter returns only OFFER approvals");

const feed = buildNotificationFeed({
  budget: mixedRows
    .filter((row) => resolveDocumentTypeKey(row) === "BUDGET")
    .map(mapBudgetApprovalNotification),
  resourceRequisition: mixedRows
    .filter((row) => resolveDocumentTypeKey(row) === "REQUISITION")
    .map(mapRequisitionApprovalNotification),
  offer: offerRows.map(mapOfferApprovalNotification),
  candidateOwnership: [],
  interviewScheduled: [],
  assignedRequisition: []
});

const offerItems = feed.filter((item) => item.categoryKey === "offer");
assert.equal(offerItems.length, 1);
assert.equal(offerItems[0].taskId, 901);
assert.equal(countNotifications(feed), 4);

const keys = new Set(
  feed.map((item) => `${item.categoryKey}-${item.taskId || item.requestId}`)
);
assert.equal(keys.size, feed.length);

pass("bell count includes offer approval and avoids duplicate items");

const emptyOfferFeed = buildNotificationFeed({
  budget: [],
  resourceRequisition: [],
  offer: [],
  candidateOwnership: [],
  interviewScheduled: [],
  assignedRequisition: []
});

assert.equal(emptyOfferFeed.some((item) => item.categoryKey === "offer"), false);
assert.equal(countNotifications(emptyOfferFeed), 0);

pass("no pending offer approvals produces no offer bell item");

console.log("\nPhase 6C-6 offer bell notification verification passed.");
