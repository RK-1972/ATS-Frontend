import assert from "node:assert/strict";

import {
  filterInterviewSchedules,
  scheduleMatchesSearch
} from "../src/pages/interviewScheduleSearch.js";

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail) {
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
  process.exitCode = 1;
}

const rishabhRow = {
  schedule_id: 210,
  candidate_code: "21072615",
  candidate_name: "Rishabh Sehgal",
  req_code: "REQ-FULFILL-1790423941214",
  job_title: "Engineer",
  interviewer_name: "Nishchith Hegde",
  round_type: "L1 Interview",
  interview_date: "09-10-2026",
  interview_time: "23:05:00",
  interview_status: "Completed"
};

const shankarRow = {
  schedule_id: 99,
  candidate_code: "CAND-SH",
  candidate_name: "shankar adiga",
  req_code: "REQ-SHANKAR",
  job_title: "Engineer",
  interviewer_name: "Panel User",
  round_type: "L1 Technical",
  interview_date: "02-01-2026",
  interview_time: "11:00",
  interview_status: "Scheduled"
};

try {
  assert.equal(scheduleMatchesSearch(rishabhRow, "Rishabh Sehgal"), true);
  pass("Full query matches Rishabh Sehgal row");

  assert.equal(scheduleMatchesSearch(shankarRow, "Rishabh Sehgal"), false);
  pass("Full query does not match shankar adiga row");

  const filtered = filterInterviewSchedules([shankarRow, rishabhRow], "Rishabh Sehgal");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].schedule_id, 210);
  pass("Filter keeps only Rishabh Sehgal");

  assert.equal(filterInterviewSchedules([shankarRow, rishabhRow], "Nobody").length, 0);
  pass("No-match query returns zero rows");

  assert.equal(filterInterviewSchedules([shankarRow, rishabhRow], "").length, 2);
  pass("Clear search restores all rows");
} catch (error) {
  fail("Interview schedule search helpers", error.message);
}

if (process.exitCode) {
  console.log("\nInterview schedule page search verification completed with failures.");
} else {
  console.log("\nAll interview schedule page search checks passed.");
}
