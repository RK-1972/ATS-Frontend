import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { applyInterviewerViewFilter } from "../src/components/copilot/interviewerCopilotFilters.js";
import { getBusinessCalendarDateKey } from "../src/utils/optalynxBusinessTimezone.js";

/**
 * Same scenarios as ats-backend/scripts/copilotInterviewerFilterParity.test.js
 * (backend compares copilotInterviewFilters to scripts/lib/copilotInterviewerViewFilterContract.js).
 */
describe("copilot interviewer view filter parity (frontend contract scenarios)", () => {
  const midnightIstRow = {
    interview_date: "2026-10-23T18:45:00.000Z",
    interview_time: "00:15",
    interview_status: "Scheduled",
    feedback_submitted: false
  };

  const referenceOnIstOct24 = new Date("2026-10-23T20:00:00.000Z");
  const referenceBeforeIstMidnight = new Date("2026-10-23T18:29:00.000Z");

  it("includes IST midnight row on today view after IST calendar rolls", () => {
    const rows = [midnightIstRow];
    const today = applyInterviewerViewFilter(rows, "today", referenceOnIstOct24);

    assert.equal(today.length, 1);
    assert.equal(today[0].interview_date, midnightIstRow.interview_date);
  });

  it("excludes IST midnight row from today view before IST calendar rolls", () => {
    const rows = [midnightIstRow];
    const today = applyInterviewerViewFilter(rows, "today", referenceBeforeIstMidnight);

    assert.equal(today.length, 0);
  });

  it("upcoming view uses IST today boundary", () => {
    const rows = [
      midnightIstRow,
      {
        interview_date: "2026-10-20",
        interview_status: "Scheduled",
        feedback_submitted: false
      }
    ];

    const upcoming = applyInterviewerViewFilter(rows, "upcoming", referenceOnIstOct24);

    assert.equal(upcoming.length, 1);
    assert.equal(upcoming[0].interview_date, midnightIstRow.interview_date);
    assert.equal(getBusinessCalendarDateKey(referenceOnIstOct24), "2026-10-24");
  });
});
