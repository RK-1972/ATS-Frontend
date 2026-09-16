import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";

function emptyDashboard() {
  return {
    requisitions: [],
    recruiterAssignments: [],
    pipeline: [],
    activePipeline: [],
    offerCandidates: [],
    interviews: [],
    tasks: [],
    filter: null,
    summary: {
      openRequisitions: 0,
      activeCandidates: 0,
      pendingTasks: 0,
      interviewsInRange: 0,
      pendingFeedbackInRange: 0,
      offersInRange: 0,
      pipelineStageCounts: {}
    },
    taskSummary: { pending: 0, escalated: 0, overdue: 0 },
    interviewSummary: { scheduled: 0, completed: 0, pendingFeedback: 0 }
  };
}

const recruitmentClient = {

  getMyDashboard({ fromDate, toDate } = {}) {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    const query = params.toString();
    const url = `${ENDPOINTS.recruitment}/my-dashboard${query ? `?${query}` : ""}`;
    return httpGet(url, () => emptyDashboard());
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

  listMyHmRequisitions() {
    return httpGet(
      `${ENDPOINTS.recruitment}/my-hm-requisitions`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  listAtsStageCatalog() {
    return httpGet(
      `${ENDPOINTS.recruitment}/ats-stage-catalog`,
      () => ({
        success: true,
        count: 7,
        data: [
          { stage_id: 1, stage_code: "APPLIED", display_name: "Applied", sort_order: 10, is_terminal: false, is_active: true },
          { stage_id: 2, stage_code: "SCREENING", display_name: "Screening", sort_order: 20, is_terminal: false, is_active: true },
          { stage_id: 3, stage_code: "L1_INTERVIEW", display_name: "L1 Interview", sort_order: 30, is_terminal: false, is_active: true },
          { stage_id: 4, stage_code: "L2_INTERVIEW", display_name: "L2 Interview", sort_order: 40, is_terminal: false, is_active: true },
          { stage_id: 5, stage_code: "CLIENT_INTERVIEW", display_name: "Client Interview", sort_order: 50, is_terminal: false, is_active: true },
          { stage_id: 6, stage_code: "OFFER", display_name: "Offer", sort_order: 60, is_terminal: false, is_active: true },
          { stage_id: 7, stage_code: "JOINED", display_name: "Joined", sort_order: 70, is_terminal: true, is_active: true }
        ]
      })
    );
  },

  listMyHmCandidates({ requisitionCode, reqId } = {}) {
    const params = new URLSearchParams();
    if (requisitionCode) {
      params.set("requisition_code", requisitionCode);
    }
    if (reqId !== undefined && reqId !== null && reqId !== "") {
      params.set("req_id", String(reqId));
    }
    const query = params.toString();
    const url = `${ENDPOINTS.recruitment}/my-hm-candidates${query ? `?${query}` : ""}`;
    return httpGet(url, () => ({ success: true, count: 0, data: [] }));
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

  updateRequisition(code, payload) {
    return httpPut(
      `${ENDPOINTS.recruitment}/requisitions/${code}`,
      payload,
      () => ({
        success: true,
        message: "Requisition updated.",
        data: { requisition_code: code, ...payload }
      })
    );
  },

  submitRequisition(code, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${code}/submit`,
      payload,
      () => ({
        success: true,
        message: `Requisition ${code} submitted.`,
        data: { requisition_code: code }
      })
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

  publishToCandidatePortal(requisitionCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/publish-to-candidate-portal`,
      {},
      () => ({
        success: true,
        message: "Requisition published to the Candidate Portal."
      })
    );
  },

  unpublishFromCandidatePortal(requisitionCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/unpublish-from-candidate-portal`,
      {},
      () => ({
        success: true,
        message: "Requisition unpublished from the Candidate Portal."
      })
    );
  },

  getRequisitionFulfillment(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/fulfillment`,
      () => ({
        success: true,
        data: {
          requisition_code: requisitionCode,
          fulfillment: {
            required_headcount: 1,
            reserved_headcount: 0,
            filled_headcount: 0,
            remaining_headcount: 1,
            closure_eligible: false,
            data_quality_exception: false,
            closure_status: "Open"
          }
        }
      })
    );
  },

  closeRequisitionAsFilled(requisitionCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/close-filled`,
      {},
      () => ({
        success: true,
        message: "Requisition closed as filled."
      })
    );
  },

  closeRequisitionAsCancelled(requisitionCode, cancellationReason) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/close-cancelled`,
      { cancellation_reason: cancellationReason },
      () => ({
        success: true,
        message: "Requisition closed as cancelled."
      })
    );
  },

  listHeadcountChanges(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/headcount-changes`,
      () => ({
        success: true,
        data: {
          requisition_code: requisitionCode,
          current_headcount: 1,
          pending_change: null,
          capacity_floor: 0,
          history: []
        }
      })
    );
  },

  requestHeadcountChange(requisitionCode, payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/headcount-changes`,
      payload,
      () => ({
        success: true,
        message: "Headcount change request submitted.",
        data: {
          change_id: "HCR-DEMO",
          requisition_code: requisitionCode,
          status: "Pending Approval"
        }
      })
    );
  },

  listBudgetChanges(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/budget-changes`,
      () => ({
        success: true,
        data: {
          requisition_code: requisitionCode,
          current_budget: 0,
          wfp_position_budget: null,
          pending_change: null,
          offer_budget_floor: 0,
          history: []
        }
      })
    );
  },

  requestBudgetChange(requisitionCode, payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${requisitionCode}/budget-changes`,
      payload,
      () => ({
        success: true,
        message: "Budget change request submitted.",
        data: {
          change_id: "BCR-DEMO",
          requisition_code: requisitionCode,
          status: "Pending Approval"
        }
      })
    );
  },

  mapCandidate(payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/candidate-mappings`,
      payload,
      () => ({ success: true, toastMessage: "Candidate mapped." })
    );
  },

  getResumeMatches(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${encodeURIComponent(requisitionCode)}/resume-matches`,
      () => ({
        success: true,
        data: {
          requisition_code: requisitionCode,
          required_skills: [],
          candidates: []
        }
      })
    );
  },

  updateCandidateStage(mapId, stageName, remarks = "") {
    return httpPut(
      `${ENDPOINTS.recruitment}/candidate-mappings/${mapId}/stage`,
      { stage_name: stageName, remarks },
      () => ({ success: true, toastMessage: "Stage updated." })
    );
  },

  getPipelineHistory(mapId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidate-mappings/${encodeURIComponent(mapId)}/pipeline-history`,
      () => ({ success: true, data: [] })
    );
  },

  getCandidateWorkspaceProfile(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/profile`,
      () => ({
        success: true,
        data: {
          master: null,
          mapping: null
        }
      })
    );
  },

  listCandidateEducation(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/education`,
      () => ({ success: true, data: [] })
    );
  },

  listCandidateExperience(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/experience`,
      () => ({ success: true, data: [] })
    );
  },

  getCandidateOwnership(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/ownership`,
      () => ({
        success: true,
        data: {
          candidate_id: candidateId,
          owner_employee_code: "",
          full_name: "",
          owner_display_name: "",
          is_owner: false,
          pending_request: false
        }
      })
    );
  },

  listTalentPoolCandidates() {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates?view=pool`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  listMyPipelineCandidates() {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates?view=pipeline`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  listPendingPortalApplications() {
    return httpGet(
      `${ENDPOINTS.recruitment}/pending-applications`,
      () => ({ success: true, count: 0, data: [] })
    );
  },

  claimPendingPortalApplication(mappingId) {
    return httpPost(
      `${ENDPOINTS.recruitment}/pending-applications/${encodeURIComponent(mappingId)}/claim`,
      {},
      () => ({
        success: true,
        message: "Application accepted into your pipeline.",
        data: { mapping_id: mappingId }
      })
    );
  }

};

export default recruitmentClient;
