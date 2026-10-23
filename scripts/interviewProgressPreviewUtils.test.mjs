import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildInterviewProgressPreviewStages } from "../src/utils/interviewProgressPreviewUtils.js";

describe("buildInterviewProgressPreviewStages stageGroups", () => {
  it("renders current decision separately from historical sessions", () => {
    const stages = buildInterviewProgressPreviewStages({
      stageGroups: [
        {
          stageKey: "L1",
          stageLabel: "L1",
          currentDecision: {
            outcome: "Rejected",
            interviewId: "INT-2",
            sessionLabel: "L1 Session 2"
          },
          sessions: [
            {
              interviewId: "INT-1",
              sessionLabel: "L1 Session 1",
              roundType: "L1 Technical",
              interviewStatus: "Completed",
              feedbackSubmitted: true,
              sessionOutcome: "Selected",
              interviewerName: "Alice"
            },
            {
              interviewId: "INT-2",
              sessionLabel: "L1 Session 2",
              roundType: "L1 Technical",
              interviewStatus: "Completed",
              feedbackSubmitted: true,
              sessionOutcome: "Rejected",
              interviewerName: "Bob"
            }
          ]
        }
      ]
    });

    assert.ok(stages.some((stage) => stage.isStageDecision && stage.finalOutcome === "Rejected"));
    assert.ok(stages.some((stage) => stage.title === "L1 Session 1"));
  });

  it("exposes per-session feedback view links", () => {
    const stages = buildInterviewProgressPreviewStages({
      stageGroups: [
        {
          stageKey: "L1",
          stageLabel: "L1",
          currentDecision: null,
          sessions: [
            {
              interviewId: "INT-1",
              scheduleId: 55,
              sessionLabel: "L1 Session 1",
              roundType: "L1 Technical",
              interviewStatus: "Completed",
              feedbackSubmitted: true,
              sessionOutcome: "Selected",
              interviewerName: "Alice"
            }
          ]
        }
      ]
    });

    const sessionStage = stages.find((stage) => stage.scheduleId === 55);

    assert.equal(sessionStage?.feedbackViewPath, "/view-feedback/55");
  });
});
