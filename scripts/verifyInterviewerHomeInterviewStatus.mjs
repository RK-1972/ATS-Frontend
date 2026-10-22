import assert from "node:assert/strict";

import { resolveInterviewerInterviewDisplayStatus } from "../src/pages/interviewerHomeInterviewStatus.js";

function pass(label) {
  console.log(`PASS: ${label}`);
}

assert.equal(
  resolveInterviewerInterviewDisplayStatus({
    feedback_submitted: false,
    interview_status: "Cancelled"
  }),
  "Cancelled"
);
pass("cancelled without feedback shows Cancelled");

assert.equal(
  resolveInterviewerInterviewDisplayStatus({
    feedback_submitted: true,
    interview_status: "Scheduled"
  }),
  "Completed"
);
pass("feedback submitted shows Completed");

assert.equal(
  resolveInterviewerInterviewDisplayStatus({
    feedback_submitted: false,
    interview_status: "Scheduled"
  }),
  "Scheduled"
);
pass("scheduled without feedback shows Scheduled");

console.log("All interviewer home status checks passed.");
