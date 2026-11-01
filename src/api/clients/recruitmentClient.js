import API from "../axios.jsx";
import { ENDPOINTS } from "../endpoints";
import { httpGet, httpPost, httpPut, httpDelete } from "../httpClient";

function parseContentDispositionFilename(headerValue, fallbackFilename) {
  const value = String(headerValue || "");
  const quoted = /filename="([^"]+)"/i.exec(value);
  if (quoted?.[1]) {
    return quoted[1];
  }
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return fallbackFilename;
    }
  }
  return fallbackFilename;
}

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

  getOfferRaiseEligibleMappings() {
    return httpGet(
      `${ENDPOINTS.recruitment}/offer-raise-eligible-mappings`,
      () => ({ success: true, count: 0, data: [] })
    );
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

  getAiReviewAvailability() {
    return httpGet(`${ENDPOINTS.recruitment}/ai-review/availability`, () => ({
      success: true,
      data: {
        ai_module_enabled: false,
        feature_enabled: false,
        available: false
      }
    }));
  },

  generateAiCandidateReview(candidateId, requisitionCode) {
    return httpPost(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/requisitions/${encodeURIComponent(requisitionCode)}/ai-review`,
      {},
      () => ({
        success: false,
        message: "AI review is unavailable."
      })
    );
  },

  listTalentIntelligenceWorkspaceRequisitions() {
    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/workspace/requisitions`,
      () => ({
        success: true,
        data: []
      })
    );
  },

  getTalentIntelligenceAvailability(query = {}) {
    const params = new URLSearchParams();
    if (query.requisition_code) {
      params.set("requisition_code", String(query.requisition_code));
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";

    return httpGet(`${ENDPOINTS.recruitment}/talent-intelligence/availability${suffix}`, () => ({
      success: true,
      data: {
        ai_module_enabled: false,
        feature_enabled: false,
        available: false,
        resume_indexing_enabled: false,
        external_discovery_enabled: false,
        configured_connector_count: 0,
        connectors: [],
        semantic_search_enabled: false,
        ai_assist_enabled: false
      }
    }));
  },

  getOtiConnectors(query = {}) {
    const params = new URLSearchParams();
    if (query.requisition_code) {
      params.set("requisition_code", String(query.requisition_code));
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";

    return httpGet(`${ENDPOINTS.recruitment}/talent-intelligence/connectors${suffix}`, () => ({
      success: true,
      data: { connectors: [] }
    }));
  },

  prepareOtiExternalLeadIntakeReview(leadId, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/prepare-intake-review`,
      payload,
      () => ({
        success: false,
        message: "Live API required to prepare OTI external candidate intake review."
      })
    );
  },

  completeOtiExternalLeadRegistration(leadId, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/complete-registration`,
      payload,
      () => ({
        success: false,
        message: "Live API required to complete OTI external lead registration."
      })
    );
  },

  postOtiExternalLeadAction(leadId, payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/actions`,
      payload,
      () => ({
        success: true,
        data: { auto_registration: false, import_status: payload?.action_type }
      })
    );
  },

  async fetchOtiExternalLeadResumeDocument(leadId, query = {}) {
    const fallbackFilename = `external-lead-${leadId}-resume.pdf`;
    const params = new URLSearchParams();
    if (query.run_id) {
      params.set("run_id", String(query.run_id));
    }
    if (query.requisition_code) {
      params.set("requisition_code", String(query.requisition_code));
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const url = `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/resume-document${suffix}`;

    const response = await API.get(url, { responseType: "blob" });
    const contentType =
      response.headers["content-type"] || response.headers["Content-Type"] || "application/pdf";

    if (String(contentType).includes("application/json")) {
      const text = await response.data.text();
      let message = "Unable to load resume document.";
      try {
        message = JSON.parse(text)?.message || message;
      } catch {
        // keep default message
      }
      throw new Error(message);
    }

    const filename = parseContentDispositionFilename(
      response.headers["content-disposition"] || response.headers["Content-Disposition"],
      fallbackFilename
    );
    const blob =
      response.data instanceof Blob && response.data.type
        ? response.data
        : new Blob([response.data], { type: contentType.split(";")[0].trim() });

    return { blob, filename, contentType: blob.type || contentType };
  },

  getOtiExternalResumeRetrievalStatus(leadId, query = {}) {
    const params = new URLSearchParams();
    if (query.run_id) {
      params.set("run_id", String(query.run_id));
    }
    if (query.requisition_code) {
      params.set("requisition_code", String(query.requisition_code));
    }
    const suffix = params.toString() ? `?${params.toString()}` : "";

    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/resume-retrieval/status${suffix}`,
      () => ({
        success: true,
        data: {
          resume_retrieval_status: "not_requested",
          resume_retrieval_permitted: false
        }
      })
    );
  },

  executeOtiExternalResumeRetrieval(leadId, payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/external-leads/${encodeURIComponent(leadId)}/resume-retrieval`,
      payload,
      () => ({
        success: true,
        data: { status: "completed", auto_registration: false }
      })
    );
  },

  indexCandidateResumeForOti(candidateId) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/candidates/${encodeURIComponent(candidateId)}/resume-index`,
      {},
      () => ({
        success: true,
        data: { extraction_status: "indexed" }
      })
    );
  },

  getCandidateResumeIndexStatus(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/candidates/${encodeURIComponent(candidateId)}/resume-index/status`,
      () => ({
        success: true,
        data: { extraction_status: "not_indexed" }
      })
    );
  },

  retryCandidateResumeIndex(candidateId) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/candidates/${encodeURIComponent(candidateId)}/resume-index/retry`,
      {},
      () => ({
        success: true,
        data: { extraction_status: "pending" }
      })
    );
  },

  startTalentIntelligenceWorkspaceRun(requisitionCode, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/workspace/requisitions/${encodeURIComponent(requisitionCode)}/runs`,
      payload,
      () => ({
        success: true,
        data: {
          run_id: "oti-run-mock",
          status: "completed",
          results_count: 0
        }
      })
    );
  },

  listTalentIntelligenceWorkspaceRuns(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/workspace/requisitions/${encodeURIComponent(requisitionCode)}/runs`,
      () => ({
        success: true,
        data: { runs: [] }
      })
    );
  },

  startTalentIntelligenceRun(requisitionCode, payload = {}) {
    return httpPost(
      `${ENDPOINTS.recruitment}/requisitions/${encodeURIComponent(requisitionCode)}/talent-intelligence/runs`,
      payload,
      () => ({
        success: true,
        data: {
          run_id: "oti-run-mock",
          status: "completed",
          results_count: 0
        }
      })
    );
  },

  getTalentIntelligenceRun(runId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/runs/${encodeURIComponent(runId)}`,
      () => ({
        success: true,
        data: { run_id: runId, status: "completed", results_count: 0 }
      })
    );
  },

  getTalentIntelligenceRunResults(runId, query = {}) {
    const params = new URLSearchParams();
    if (query.page) {
      params.set("page", String(query.page));
    }
    if (query.page_size) {
      params.set("page_size", String(query.page_size));
    }
    if (query.external_page) {
      params.set("external_page", String(query.external_page));
    }
    if (query.external_page_size) {
      params.set("external_page_size", String(query.external_page_size));
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";

    return httpGet(
      `${ENDPOINTS.recruitment}/talent-intelligence/runs/${encodeURIComponent(runId)}/results${suffix}`,
      () => ({
        success: true,
        data: {
          run: { run_id: runId, status: "completed" },
          results: [],
          external_leads: [],
          pagination: {
            internal: { page: 1, page_size: 25, total: 0, total_pages: 1 },
            external: { page: 1, page_size: 10, total: 0, total_pages: 1 }
          }
        }
      })
    );
  },

  listTalentIntelligenceRuns(requisitionCode) {
    return httpGet(
      `${ENDPOINTS.recruitment}/requisitions/${encodeURIComponent(requisitionCode)}/talent-intelligence/runs`,
      () => ({
        success: true,
        data: { runs: [] }
      })
    );
  },

  postTalentIntelligenceAction(resultId, payload) {
    return httpPost(
      `${ENDPOINTS.recruitment}/talent-intelligence/results/${encodeURIComponent(resultId)}/actions`,
      payload,
      () => ({
        success: true,
        data: { intent_only: payload?.action_type === "request_map" }
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

  listCandidateSkillMap(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/skill-map`,
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
  },

  getCandidateOfferHoldStatus(candidateId) {
    return httpGet(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/offer-hold`,
      () => ({ success: true, data: { on_hold: false } })
    );
  },

  releaseCandidateOfferHold(candidateId, reason) {
    return httpPost(
      `${ENDPOINTS.recruitment}/candidates/${encodeURIComponent(candidateId)}/offer-hold/release`,
      { reason },
      () => ({
        success: true,
        message: "Candidate released from Offer Hold.",
        data: {}
      })
    );
  }

};

export default recruitmentClient;
