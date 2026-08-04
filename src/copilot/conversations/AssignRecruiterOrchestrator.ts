/**
 * AssignRecruiterOrchestrator (Workflow Orchestrator)
 *
 * Receives confirmed conversation context from Copilot.
 * Invokes the existing ATS Assign Recruiter path used by RecruiterAssignmentPanel.
 *
 * Does not validate, authorize, or apply business rules — ATS owns those.
 */

import useEnterpriseStore from "@/store/enterpriseStore";

export type AssignRecruiterConversationContext = {
  requisition?: {
    id: string | number;
    reqCode?: string;
    jobTitle?: string;
    label?: string;
  } | null;
  recruiter?: {
    employeeCode: string;
    fullName?: string;
    label?: string;
  } | null;
};

export type AssignRecruiterLaunchResult =
  | {
      ok: true;
      toastMessage: string;
      requisitionLabel: string;
      recruiterLabel: string;
    }
  | { ok: false; message: string };

/**
 * Execute assignment via existing enterpriseStore.assignRecruiterOnRequisition
 * (same path as RecruiterAssignmentPanel → recruitmentRepository →
 * POST /api/v1/recruitment/requisitions/:code/assign-recruiter).
 */
export async function executeAssignRecruiterFromConversation(
  context: AssignRecruiterConversationContext
): Promise<AssignRecruiterLaunchResult> {
  const requisition = context.requisition;
  const recruiter = context.recruiter;

  const reqId = requisition?.id;
  const recruiterCode = recruiter?.employeeCode;

  const requisitionLabel =
    requisition?.jobTitle ||
    requisition?.label ||
    requisition?.reqCode ||
    "the selected requisition";

  const recruiterLabel =
    recruiter?.fullName || recruiter?.label || recruiterCode || "the selected recruiter";

  if (reqId == null || reqId === "") {
    return {
      ok: false,
      message: "Select a requisition before assigning a recruiter."
    };
  }

  if (!recruiterCode) {
    return {
      ok: false,
      message: "Select a recruiter before completing the assignment."
    };
  }

  try {
    await useEnterpriseStore
      .getState()
      .assignRecruiterOnRequisition(reqId, recruiterCode);

    return {
      ok: true,
      toastMessage: "Recruiter assigned successfully.",
      requisitionLabel,
      recruiterLabel
    };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    const atsMessage =
      axiosError?.response?.data?.message ||
      axiosError?.message ||
      "Assignment Failed";

    return {
      ok: false,
      message: String(atsMessage)
    };
  }
}
