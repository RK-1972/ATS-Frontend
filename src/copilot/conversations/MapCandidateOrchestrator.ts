/**
 * MapCandidateOrchestrator (Workflow Orchestrator)
 *
 * Receives confirmed conversation context from Copilot.
 * Invokes the existing ATS map-candidate path used by CandidateAssignmentDialog
 * (candidateRepository.mapCandidateToRequisition →
 *  POST /api/v1/recruitment/candidate-mappings).
 *
 * Does not validate, authorize, or apply business rules — ATS owns those.
 */

import candidateRepository from "@/repositories/candidateRepository";

export type MapCandidateConversationContext = {
  candidate?: {
    id: string | number;
    candidateCode?: string;
    candidateName?: string;
    label?: string;
  } | null;
  requisition?: {
    id: string | number;
    reqCode?: string;
    jobTitle?: string;
    label?: string;
  } | null;
};

export type MapCandidateLaunchResult =
  | {
      ok: true;
      toastMessage: string;
      candidateLabel: string;
      requisitionLabel: string;
      requisitionCode: string;
    }
  | { ok: false; message: string };

export async function executeMapCandidateFromConversation(
  context: MapCandidateConversationContext
): Promise<MapCandidateLaunchResult> {
  const candidate = context.candidate;
  const requisition = context.requisition;

  const candidateId = candidate?.id;
  const reqId = requisition?.id;

  const candidateLabel =
    candidate?.candidateName ||
    candidate?.label ||
    candidate?.candidateCode ||
    "the selected candidate";

  const requisitionLabel =
    requisition?.jobTitle ||
    requisition?.label ||
    requisition?.reqCode ||
    "the selected requisition";

  const requisitionCode = String(requisition?.reqCode || "").trim();

  if (candidateId == null || candidateId === "") {
    return {
      ok: false,
      message: "Select a candidate before completing the mapping."
    };
  }

  if (reqId == null || reqId === "") {
    return {
      ok: false,
      message: "Select a requisition before completing the mapping."
    };
  }

  try {
    const response = await candidateRepository.mapCandidateToRequisition({
      candidate_id: candidateId,
      req_id: reqId
    });

    return {
      ok: true,
      toastMessage:
        response?.toastMessage ||
        response?.message ||
        "Candidate mapped successfully.",
      candidateLabel,
      requisitionLabel,
      requisitionCode
    };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const atsMessage =
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      "Mapping Failed";

    return {
      ok: false,
      message: String(atsMessage)
    };
  }
}
