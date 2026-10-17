import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  filterItemsBySearch,
  normalizeWorkforceSearchQuery
} from "../src/utils/workforcePlanningListFilter.js";

const OFFER_PENDING_APPROVAL_SEARCH_FIELDS = [
  "offerId",
  "candidateName",
  "candidate_name",
  "requisitionCode",
  "requisition_code",
  "currentApprovalStep",
  "currentApproverRole",
  "positionTitle",
  "position_title",
  "businessUnit",
  "business_unit",
  "department"
];

const sampleQueue = [
  {
    offerId: "OFF-2026-014",
    candidateName: "Jane Candidate",
    requisitionCode: "REQ-2026-1303",
    currentApprovalStep: "L2 Finance"
  },
  {
    offerId: "OFF-2026-015",
    candidateName: "John Smith",
    requisitionCode: "REQ-2026-1400",
    currentApprovalStep: "HM Review"
  }
];

function filterPendingApprovalQueueBySearch(queue, searchQuery) {
  return filterItemsBySearch(
    queue,
    OFFER_PENDING_APPROVAL_SEARCH_FIELDS,
    searchQuery
  );
}

describe("filterPendingApprovalQueueBySearch", () => {
  it("returns full queue when search is empty", () => {
    assert.equal(filterPendingApprovalQueueBySearch(sampleQueue, "").length, 2);
  });

  it("filters by offer id, candidate name, and requisition", () => {
    assert.equal(
      filterPendingApprovalQueueBySearch(sampleQueue, "1303").length,
      1
    );
    assert.equal(
      filterPendingApprovalQueueBySearch(sampleQueue, "jane")[0].offerId,
      "OFF-2026-014"
    );
    assert.equal(
      filterPendingApprovalQueueBySearch(sampleQueue, "finance").length,
      1
    );
  });

  it("normalizes search query", () => {
    assert.equal(normalizeWorkforceSearchQuery("  OFF "), "off");
  });
});
