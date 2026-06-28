import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";

function emptyDashboard() {
  return {
    requisitions: [],
    recruiterAssignments: [],
    pipeline: [],
    interviews: [],
    tasks: [],
    summary: {
      openRequisitions: 0,
      activeCandidates: 0,
      pendingTasks: 0,
      interviewsToday: 0
    },
    taskSummary: { pending: 0, escalated: 0, overdue: 0 },
    interviewSummary: { scheduled: 0, completed: 0, pendingFeedback: 0 }
  };
}

const recruitmentClient = {

  getMyDashboard() {
    return httpGet(`${ENDPOINTS.recruitment}/my-dashboard`, () => emptyDashboard());
  },

  getAll() {
    return this.getMyDashboard();
  },

  listRequisitions() {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions`,
      () => ({ success: true, data: [] })
    );
  },

  getAssignedRecruiters(reqId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${reqId}/assigned-recruiters`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  removeRecruiterAssignment(assignmentId) {
    return httpDelete(
      `${ENDPOINTS.recruitment}/recruiter-assignments/${assignmentId}`,
      () => ({ success: true, message: "Recruiter removed successfully." })
    );
  },

  createRequisitionFromForm(formData) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/legacy-form`,
      formData,
      () => ({
        success: true,
        message: "Requisition Created Successfully"
      })
    );
  },

  listFormRecruiters() {
    return httpGet(
      `${ENDPOINTS.recruitment}/form-options/recruiters`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  listFormClients() {
    return httpGet(
      `${ENDPOINTS.recruitment}/form-options/clients`,
      () => ({ success: true, data: [] })
    );
  },

  listFormProjects(clientId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/form-options/projects/${clientId}`,
      () => ({ success: true, data: [] })
    );
  },

  listFormHiringManagers(projectId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/form-options/hiring-managers/${projectId}`,
      () => ({ success: true, data: [] })
    );
  },

  assignRecruiterToRequisition(reqId, recruiterCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${reqId}/assign-recruiter`,
      { recruiter_code: recruiterCode },
      () => ({ success: true, toastMessage: "Recruiter assigned." })
    );
  },

  getRequisition(code) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${code}`,
      () => ({ success: true, data: null })
    );
  },

  createFromApprovedPosition(approvedPositionId, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions`,
      { approved_position_id: approvedPositionId, ...payload },
      () => ({
        success: true,
        requisitionId: "REQ-2026-1188",
        toastMessage: "Requisition created."
      })
    );
  },

  approveRequisition(code, comment = "") {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${code}/approve`,
      { comment },
      () => ({ success: true, toastMessage: "Requisition approved." })
    );
  },

  assignRecruiter(requisitionCode, recruiterCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/assign-recruiter`,
      { recruiter_code: recruiterCode },
      () => ({ success: true, toastMessage: "Recruiter assigned." })
    );
  },

  mapCandidate(payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/candidate-mappings`,
      payload,
      () => ({ success: true, toastMessage: "Candidate mapped." })
    );
  },

  updateCandidateStage(mapId, stageName, remarks = "") {
    return httpPut(
      `${ENDPOINTS.recruitment}/candidate-mappings/${mapId}/stage`,
      { stage_name: stageName, remarks },
      () => ({ success: true, toastMessage: "Stage updated." })
    );
  }

};

export default recruitmentClient;
