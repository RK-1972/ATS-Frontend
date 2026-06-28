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
