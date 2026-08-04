/**
 * ScheduleInterviewOrchestrator (Workflow Orchestrator for Schedule Interview)
 *
 * Receives completed conversation context from the Conversation Engine.
 * Resolves active requisition via existing ATS profile load.
 * Launches the ONE existing Schedule Interview page.
 *
 * Does not ask conversation questions (engine owns that).
 */

import { loadExistingCandidateMappingOptions } from "./loadExistingCandidateMappingOptions";

export type ScheduleConversationContext = {
  candidate?: {
    id: string | number;
    candidateCode?: string;
    candidateName?: string;
    mapId?: string | number | null;
    reqId?: string | number | null;
    requisitionCode?: string | null;
  } | null;
  interviewer?: {
    id: string | number;
    name?: string;
  } | null;
  interviewLevel?: string | null;
  interviewDate?: string | null;
  interviewTime?: string | null;
};

export type ScheduleLaunchResult =
  | { ok: true }
  | { ok: false; message: string };

const MAP_REQUIRED_MESSAGE =
  "Map the candidate to a requisition before scheduling an interview.";

/**
 * Launch existing /interview-schedule with an optional initialization context.
 *
 * The page initializes itself from location.state (entry-point agnostic).
 * Supported keys: req_id, map_id, interviewer_id, round_type,
 * interview_date, interview_time (+ legacy details triple when used).
 *
 * Orchestrator only prepares context — it does not mutate ATS form logic.
 */
export async function launchScheduleInterviewFromConversation(
  navigate: (path: string, options?: { state?: unknown }) => void,
  context: ScheduleConversationContext
): Promise<ScheduleLaunchResult> {
  const candidate = context.candidate;

  if (!candidate?.id) {
    return {
      ok: false,
      message: "Select a candidate before scheduling an interview."
    };
  }

  let mapId = candidate.mapId ?? null;
  let reqId = candidate.reqId ?? null;

  if (!mapId || !reqId) {
    try {
      const options = await loadExistingCandidateMappingOptions(candidate.id);
      if (options.length === 1) {
        mapId = options[0].mapId;
        reqId = options[0].reqId;
      } else if (options.length === 0) {
        return { ok: false, message: MAP_REQUIRED_MESSAGE };
      } else {
        // Multiple mappings would require ATS multi-mapping UI/API.
        return {
          ok: false,
          message: MAP_REQUIRED_MESSAGE
        };
      }
    } catch (_error) {
      return {
        ok: false,
        message: MAP_REQUIRED_MESSAGE
      };
    }
  }

  if (!mapId || !reqId) {
    return { ok: false, message: MAP_REQUIRED_MESSAGE };
  }

  let interviewerId = "";
  if (context.interviewer?.id != null && context.interviewer.id !== "") {
    const parsed = Number(context.interviewer.id);
    if (!Number.isNaN(parsed)) {
      interviewerId = parsed;
    }
  }

  navigate("/interview-schedule", {
    state: {
      // Candidate + requisition (existing workspace contract)
      req_id: Number(reqId),
      map_id: Number(mapId),
      // Optional form initialization (page applies only when present)
      interviewer_id: interviewerId,
      round_type: context.interviewLevel || "",
      interview_date: context.interviewDate || "",
      interview_time: context.interviewTime || ""
    }
  });

  return { ok: true };
}
