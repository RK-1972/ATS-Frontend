/**
 * ConductInterviewOrchestrator (Workflow Orchestrator)
 *
 * Receives completed conversation context from Copilot.
 * Navigates to the existing Interviewer Workspace (/interviewer) with
 * minimum location.state.filters so the page can show the selected interview.
 *
 * Does not authorize, load interviews for business decisions, or duplicate
 * Interview Workspace behaviour — ATS owns those.
 */

import { toLocationState } from "@/copilot/core/navigationPayload";

export type ConductInterviewConversationContext = {
  interview?: {
    id: string | number;
    scheduleId?: string | number;
    candidateName?: string;
    jobTitle?: string;
    roundType?: string;
    label?: string;
  } | null;
};

export type ConductInterviewLaunchResult =
  | { ok: true }
  | { ok: false; message: string };

const NO_INTERVIEW_MESSAGE =
  "You have no scheduled interviews available.";

/**
 * Launch existing /interviewer with schedule_id filter.
 * InterviewerHome applies filters via useNavigationFilters (same pattern as
 * InterviewSchedulePage search filters).
 */
export function launchConductInterviewFromConversation(
  navigate: (path: string, options?: { state?: unknown }) => void,
  context: ConductInterviewConversationContext
): ConductInterviewLaunchResult {
  const interview = context.interview;
  const scheduleId = interview?.scheduleId ?? interview?.id;

  if (scheduleId == null || scheduleId === "") {
    return {
      ok: false,
      message: NO_INTERVIEW_MESSAGE
    };
  }

  const numericId = Number(scheduleId);
  const filterValue = Number.isNaN(numericId) ? scheduleId : numericId;

  navigate("/interviewer", {
    state: toLocationState({
      path: "/interviewer",
      filters: { schedule_id: filterValue }
    })
  });

  return { ok: true };
}
