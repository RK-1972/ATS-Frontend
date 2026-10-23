import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost } from "../httpClient";

function emptyInterviewBundle() {
  return {
    interviews: [],
    panelAssignments: [],
    summary: { scheduled: 0, completed: 0, pendingFeedback: 0 }
  };
}

const interviewClient = {
  getAll() {
    return httpGet(ENDPOINTS.interviews, () => emptyInterviewBundle());
  },

  getInterview(id) {
    return httpGet(`${ENDPOINTS.interviews}/${id}`, () => ({ success: true, data: null }));
  },

  getSchedulePrecheck(mapId, roundType) {
    const params = new URLSearchParams({
      map_id: String(mapId),
      round_type: String(roundType)
    });

    return httpGet(
      `${ENDPOINTS.interviews}/schedule-precheck?${params.toString()}`,
      () => ({
        success: true,
        data: {
          guardCode: "ALLOW",
          requiresRepeatConfirmation: false,
          requiresRepeatReason: false,
          requiresRepeatOverride: false
        }
      })
    );
  },

  getInterviewProgress(mapId) {
    return httpGet(
      `${ENDPOINTS.interviews}/progress/${encodeURIComponent(mapId)}`,
      () => ({
        success: true,
        data: {
          mapId,
          candidateCode: null,
          candidateName: null,
          requisitionCode: null,
          currentStage: null,
          rounds: [],
          stageGroups: [],
          feedbackSummaries: []
        }
      })
    );
  },

  getFeedbackSummaries(mapId) {
    return httpGet(
      `${ENDPOINTS.interviews}/feedback-summaries/${encodeURIComponent(mapId)}`,
      () => ({
        success: true,
        count: 0,
        data: []
      })
    );
  },

  getPermittedFeedbackHistory(mapId, anchorScheduleId = null) {
    const params = new URLSearchParams();

    if (anchorScheduleId) {
      params.set("anchor_schedule_id", String(anchorScheduleId));
    }

    const query = params.toString();

    return httpGet(
      `${ENDPOINTS.interviews}/permitted-feedback/${encodeURIComponent(mapId)}${query ? `?${query}` : ""}`,
      () => ({
        success: true,
        count: 0,
        data: []
      })
    );
  },

  getRecruiterScheduledFeedbackHistory() {
    return httpGet(`${ENDPOINTS.interviews}/recruiter-scheduled-feedback`, () => ({
      success: true,
      count: 0,
      data: []
    }));
  },

  scheduleInterview(payload) {
    return httpPost(
      `${ENDPOINTS.interviews}/schedule`,
      payload,
      () => ({ success: true, toastMessage: "Interview scheduled." })
    );
  },

  acceptAssignment(interviewId) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/accept`,
      {},
      () => ({ success: true, toastMessage: "Assignment accepted." })
    );
  },

  rescheduleInterview(interviewId, payload) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/reschedule`,
      payload,
      () => ({ success: true, toastMessage: "Interview rescheduled." })
    );
  },

  cancelInterview(interviewId, payload) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/cancel`,
      payload,
      () => ({ success: true, toastMessage: "Interview cancelled." })
    );
  },

  completeInterview(interviewId, comment = "") {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/complete`,
      { comment },
      () => ({ success: true, toastMessage: "Interview completed." })
    );
  },

  submitFeedback(interviewId, payload) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/feedback`,
      payload,
      () => ({ success: true, toastMessage: "Feedback submitted." })
    );
  },

  assignPanel(interviewId, panelMembers) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/panel`,
      { panel_members: panelMembers },
      () => ({ success: true, toastMessage: "Panel assigned." })
    );
  },

  reassignPanel(interviewId, payload) {
    return httpPost(
      `${ENDPOINTS.interviews}/${interviewId}/reassign-panel`,
      payload,
      () => ({ success: true, toastMessage: "Panel reassigned." })
    );
  }
};

export default interviewClient;
