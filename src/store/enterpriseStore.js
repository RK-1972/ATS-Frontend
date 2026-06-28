import { create } from "zustand";

import { isLiveMode } from "../api/config";
import ENTERPRISE_EVENTS from "../enterprise/events";
import { createCorrelationId } from "../enterprise/auditService";
import {
  platformConfigRepository,
  businessRulesRepository,
  workflowConfigurationRepository,
  workflowsRepository,
  workforcePlanningRepository,
  recruitmentRepository,
  taskRepository,
  interviewRepository,
  offerRepository,
  hiringControlTowerRepository,
  masterDataRepository,
  notificationsRepository,
  auditRepository
} from "../repositories";

const platformConfigInitial = platformConfigRepository.getInitialState();
const businessRulesInitial = businessRulesRepository.getInitialState();
const workflowsInitial = workflowsRepository.getInitialState();
const workforceInitial = workforcePlanningRepository.getInitialState();
const recruitmentInitial = recruitmentRepository.getInitialState();
const taskInboxInitial = taskRepository.getInitialState();
const interviewsInitial = interviewRepository.getInitialState();
const offersInitial = offerRepository.getInitialState();
const hiringProcessInitial = hiringControlTowerRepository.getInitialState();
const masterDataInitial = masterDataRepository.getInitialState();

function publishAudit(set, get, eventType, auditPayload) {

  const { events, record } = auditRepository.create(
    get().auditEvents,
    eventType,
    auditPayload
  );

  set({ auditEvents: events });

  return record;

}

const useEnterpriseStore = create((set, get) => ({

  platformConfig: platformConfigInitial,
  platformConfigBaseline: structuredClone(platformConfigInitial),
  platformConfigDirty: false,

  businessRules: businessRulesInitial,
  businessRulesBaseline: structuredClone(businessRulesInitial),
  businessRulesDirty: false,

  workflows: workflowsInitial,
  workflowsBaseline: structuredClone(workflowsInitial),
  workflowsDirty: false,

  workforce: workforceInitial,
  workforceBaseline: structuredClone(workforceInitial),
  workforceDirty: false,

  recruitment: recruitmentInitial,

  taskInbox: taskInboxInitial,

  interviews: interviewsInitial,

  offers: offersInitial,

  hiringProcess: hiringProcessInitial,

  auditEvents: auditRepository.getInitialState(),

  workforceUi: {
    selectedRequestId: workforcePlanningRepository.getDefaultSelectedRequestId(
      workforceInitial
    ),
    toastMessage: ""
  },

  hiringTowerUi: {
    selectedStageKey: "finance_approval",
    showClarificationForm: false,
    clarificationDraft: {
      comment: "",
      document: "",
      mention: "",
      priority: "Normal",
      due_date: ""
    },
    toastMessage: ""
  },

  businessRulesUi: {
    draftRule: null,
    simulationInput: businessRulesRepository.getSimulatorDefaults(),
    simulationResult: null
  },

  masterData: masterDataInitial,

  masterDataUi: {
    selectedDomainKey: "workforce",
    selectedEntityType: "grades",
    selectedRecordId: null,
    drawerOpen: false,
    drawerTab: "edit",
    searchQuery: "",
    statusFilter: "all",
    importDialogOpen: false,
    importPreview: null,
    draftRecord: null,
    toastMessage: ""
  },

  recruiterUi: {
    selectedRequisitionCode: null,
    selectedCandidateMapId: null,
    inspectorOpen: false,
    searchQuery: "",
    activeTab: "requisitions",
    toastMessage: "",
    toastSeverity: "success",
    initialLoadComplete: false
  },

  requisitionManagement: {
    requisitions: [],
    assignedRecruiters: [],
    formOptions: {
      clients: [],
      projects: [],
      hiringManagers: [],
      recruiters: []
    }
  },

  requisitionManagementUi: {
    selectedReqId: null,
    selectedRecruiter: "",
    showAssignModal: false,
    initialLoadComplete: false
  },

  setRequisitionManagementUi(updater) {
    set((state) => ({
      requisitionManagementUi: typeof updater === "function"
        ? updater(state.requisitionManagementUi)
        : { ...state.requisitionManagementUi, ...updater }
    }));
  },

  loadRequisitionManagementPage() {
    Promise.all([
      recruitmentRepository.listManagementRequisitions(),
      recruitmentRepository.listFormClients(),
      recruitmentRepository.listFormRecruiters()
    ]).then(([requisitions, clients, recruiters]) => {
      set({
        requisitionManagement: {
          ...get().requisitionManagement,
          requisitions,
          formOptions: {
            ...get().requisitionManagement.formOptions,
            clients,
            recruiters,
            projects: [],
            hiringManagers: []
          }
        },
        requisitionManagementUi: {
          ...get().requisitionManagementUi,
          initialLoadComplete: true
        }
      });
    }).catch((error) => {
      console.error(
        "[enterpriseStore] loadRequisitionManagementPage failed:",
        error?.response?.data || error.message
      );
      set({
        requisitionManagementUi: {
          ...get().requisitionManagementUi,
          initialLoadComplete: true
        }
      });
    });
  },

  loadRequisitionFormProjects(clientId) {
    recruitmentRepository.listFormProjects(clientId).then((projects) => {
      set({
        requisitionManagement: {
          ...get().requisitionManagement,
          formOptions: {
            ...get().requisitionManagement.formOptions,
            projects,
            hiringManagers: []
          }
        }
      });
    });
  },

  loadRequisitionFormHiringManagers(projectId) {
    recruitmentRepository.listFormHiringManagers(projectId).then((hiringManagers) => {
      set({
        requisitionManagement: {
          ...get().requisitionManagement,
          formOptions: {
            ...get().requisitionManagement.formOptions,
            hiringManagers
          }
        }
      });
    });
  },

  loadAssignedRecruiters(reqId) {
    recruitmentRepository.getAssignedRecruiters(reqId).then((assignedRecruiters) => {
      set({
        requisitionManagement: {
          ...get().requisitionManagement,
          assignedRecruiters
        }
      });
    });
  },

  createRequisitionFromForm(formData) {
    return recruitmentRepository.createRequisitionFromForm(formData)
      .then(async () => {
        const requisitions = await recruitmentRepository.listManagementRequisitions();
        set({
          requisitionManagement: {
            ...get().requisitionManagement,
            requisitions
          }
        });
        get().refreshRecruitment();
      });
  },

  assignRecruiterOnRequisition(reqId, recruiterCode) {
    return recruitmentRepository.assignRecruiterToRequisition(reqId, recruiterCode)
      .then(async () => {
        const assignedRecruiters = await recruitmentRepository.getAssignedRecruiters(reqId);
        set({
          requisitionManagement: {
            ...get().requisitionManagement,
            assignedRecruiters
          },
          requisitionManagementUi: {
            ...get().requisitionManagementUi,
            selectedRecruiter: ""
          }
        });
        get().refreshRecruitment();
      });
  },

  removeRecruiterFromRequisition(assignmentId, reqId) {
    return recruitmentRepository.removeRecruiterFromRequisition(assignmentId)
      .then(async () => {
        const assignedRecruiters = await recruitmentRepository.getAssignedRecruiters(reqId);
        set({
          requisitionManagement: {
            ...get().requisitionManagement,
            assignedRecruiters
          }
        });
        get().refreshRecruitment();
      });
  },

  setRecruiterUi(updater) {
    set((state) => ({
      recruiterUi: typeof updater === "function"
        ? updater(state.recruiterUi)
        : { ...state.recruiterUi, ...updater }
    }));
  },

  refreshRecruitment() {
    if (!isLiveMode()) {
      console.warn("[enterpriseStore] refreshRecruitment skipped — mock mode");
      return;
    }

    recruitmentRepository.getRecruiterWorkspaceBundle()
      .then(({ recruitment, taskInbox, interviews }) => {
        set({
          recruitment,
          taskInbox,
          interviews,
          recruiterUi: {
            ...get().recruiterUi,
            initialLoadComplete: true,
            toastMessage: "",
            toastSeverity: "success"
          }
        });
      })
      .catch((error) => {
        console.error(
          "[enterpriseStore] refreshRecruitment failed:",
          error?.response?.data || error.message
        );
        set({
          recruiterUi: {
            ...get().recruiterUi,
            initialLoadComplete: true,
            toastMessage: "Failed to load recruiter workspace data.",
            toastSeverity: "error"
          }
        });
      });
  },

  // ─── Platform Configuration ───────────────────────────────────────────────

  toggleModule(key) {

    Promise.resolve(
      platformConfigRepository.toggleModule(get().platformConfig, key)
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

      publishAudit(set, get, result.updated.enabled
        ? ENTERPRISE_EVENTS.MODULE_ENABLED
        : ENTERPRISE_EVENTS.MODULE_DISABLED, {
        module: "Platform Configuration",
        entity: "Module",
        entityId: key,
        action: `${result.updated.title} ${result.updated.enabled ? "enabled" : "disabled"}`,
        previousValue: result.previous?.enabled,
        newValue: result.updated.enabled
      });

    });

  },

  toggleWorkflow(key) {

    Promise.resolve(
      workflowConfigurationRepository.toggleWorkflow(
        get().platformConfig,
        key
      )
    ).then((result) => {

      const config = result?.config || result;

      set({
        platformConfig: config,
        platformConfigBaseline: result?.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result?.isDirty ?? true
      });

    });

  },

  updateBudget(field, value) {

    Promise.resolve(
      platformConfigRepository.updateBudget(
        get().platformConfig,
        field,
        value
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

      if (field === "max_budget_variance_pct") {
        set({
          businessRules: platformConfigRepository.syncBusinessRulesOnBudgetChange(
            get().businessRules,
            value
          )
        });

        publishAudit(set, get, ENTERPRISE_EVENTS.BUDGET_THRESHOLD_UPDATED, {
          module: "Platform Configuration",
          entity: "Budget Policy",
          entityId: "max_budget_variance_pct",
          action: `Budget threshold updated to ${value}%`,
          previousValue: result.previous,
          newValue: value
        });
      }

    });

  },

  updateNotificationSettings(field, value) {

    Promise.resolve(
      platformConfigRepository.updateNotificationSettings(
        get().platformConfig,
        field,
        value
      )
    ).then((result) => {

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

    });

  },

  updateAiGovernance(field, value) {

    Promise.resolve(
      platformConfigRepository.updateAiGovernance(
        get().platformConfig,
        field,
        value
      )
    ).then((result) => {

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

    });

  },

  toggleNotificationChannel(key) {

    Promise.resolve(
      notificationsRepository.toggleChannel(
        get().platformConfig,
        key
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.NOTIFICATION_CHANNEL_TOGGLED, {
        module: "Platform Configuration",
        entity: "Notification Channel",
        entityId: key,
        action: `${result.updated.title} ${result.updated.enabled ? "enabled" : "disabled"}`,
        previousValue: result.previous?.enabled,
        newValue: result.updated.enabled
      });

    });

  },

  toggleAiFeature(key) {

    Promise.resolve(
      platformConfigRepository.toggleAiFeature(get().platformConfig, key)
    ).then((result) => {

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

    });

  },

  toggleRoleVisibility(role, moduleKey) {

    Promise.resolve(
      platformConfigRepository.toggleRoleVisibility(
        get().platformConfig,
        role,
        moduleKey
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.ROLE_VISIBILITY_UPDATED, {
        module: "Platform Configuration",
        entity: "Role Visibility",
        entityId: `${role}:${moduleKey}`,
        action: `${moduleKey} visibility for ${role} updated`,
        previousValue: result.previous,
        newValue: result.nextValue
      });

    });

  },

  insertWorkflowStage(workflowKey, stageName, afterStageName) {

    Promise.resolve(
      workflowConfigurationRepository.insertStage(
        get().platformConfig,
        workflowKey,
        stageName,
        afterStageName
      )
    ).then((result) => {

      if (!result) {
        return false;
      }

      set({
        platformConfig: result.config,
        platformConfigBaseline: result.baseline
          ? structuredClone(result.baseline)
          : get().platformConfigBaseline,
        platformConfigDirty: result.isDirty ?? true
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.WORKFLOW_STAGE_INSERTED, {
        module: "Platform Configuration",
        entity: "Workflow",
        entityId: workflowKey,
        action: `Stage "${stageName}" inserted after "${afterStageName}"`,
        previousValue: result.workflow.stages,
        newValue: result.nextStages
      });

    });

    return true;

  },

  savePlatformConfig() {

    Promise.resolve(
      platformConfigRepository.publish(get().platformConfig)
    ).then((result) => {

      const snapshot = result?.config || result;

      set({
        platformConfig: snapshot,
        platformConfigBaseline: structuredClone(result?.baseline || snapshot),
        platformConfigDirty: result?.isDirty ?? false
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.WORKFLOW_PUBLISHED, {
        module: "Platform Configuration",
        entity: "Platform Config",
        entityId: "platform-config",
        action: "Platform configuration published",
        newValue: snapshot.meta?.last_published
      });

    });

    return true;

  },

  discardPlatformConfig() {

    Promise.resolve(
      platformConfigRepository.discard(get().platformConfigBaseline)
    ).then((result) => {

      set({
        platformConfig: result.config,
        platformConfigBaseline: structuredClone(result.baseline),
        platformConfigDirty: result.isDirty ?? false
      });

    });

  },

  // ─── Business Rules ─────────────────────────────────────────────────────────

  saveBusinessRules() {

    Promise.resolve(
      businessRulesRepository.publish(get().businessRules)
    ).then((result) => {

      const published = result?.config || result;

      set({
        businessRules: published,
        businessRulesBaseline: structuredClone(result?.baseline || published),
        businessRulesDirty: result?.isDirty ?? false
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.BUSINESS_RULE_UPDATED, {
        module: "Business Rules",
        entity: "Rule Library",
        entityId: "business-rules",
        action: "Business rules published",
        newValue: published.meta?.last_published
      });

    });

    return true;

  },

  discardBusinessRules() {

    Promise.resolve(
      businessRulesRepository.discard(get().businessRulesBaseline)
    ).then((result) => {

      set({
        businessRules: result.config,
        businessRulesBaseline: structuredClone(result.baseline),
        businessRulesDirty: result.isDirty ?? false,
        businessRulesUi: {
          draftRule: null,
          simulationInput: businessRulesRepository.getSimulatorDefaults(),
          simulationResult: null
        }
      });

    });

  },

  setBusinessRulesDirty() {
    set({ businessRulesDirty: true });
  },

  updateBusinessRulesState(updater) {

    set({
      businessRules: businessRulesRepository.updateState(get().businessRules, updater),
      businessRulesDirty: true
    });

  },

  setBusinessRulesUi(updater) {
    set((state) => ({
      businessRulesUi: typeof updater === "function"
        ? updater(state.businessRulesUi)
        : updater
    }));
  },

  // ─── Workforce Planning ─────────────────────────────────────────────────────

  setWorkforceUi(updater) {
    set((state) => ({
      workforceUi: typeof updater === "function"
        ? updater(state.workforceUi)
        : updater
    }));
  },

  approveBudgetRequest(id, comment) {

    const correlationId = createCorrelationId();

    Promise.resolve(
      workforcePlanningRepository.approveBudgetRequest(
        get().workforce,
        get().hiringProcess,
        id,
        comment
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        workforce: result.workforce,
        hiringProcess: result.hiringProcess,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.BUDGET_APPROVED, {
        module: "Workforce Planning",
        entity: "Budget Request",
        entityId: id,
        action: `Budget approved for ${result.request.position}`,
        previousValue: result.request.status,
        newValue: "Approved",
        correlationId,
        metadata: { comment, stageKey: "position_budget_approval" }
      });

      if (result.approvedPosition) {
        publishAudit(set, get, ENTERPRISE_EVENTS.POSITION_APPROVED, {
          module: "Workforce Planning",
          entity: "Approved Position",
          entityId: result.approvedPosition.id,
          action: `Position ${result.request.position} added to catalogue`,
          correlationId,
          metadata: { stageKey: "approved_position" }
        });
      }

    });

  },

  rejectBudgetRequest(id, comment) {

    Promise.resolve(
      workforcePlanningRepository.rejectBudgetRequest(
        get().workforce,
        id,
        comment
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        workforce: result.workforce,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.BUDGET_REJECTED, {
        module: "Workforce Planning",
        entity: "Budget Request",
        entityId: id,
        action: `Budget rejected for ${result.request?.position || id}`,
        previousValue: result.request?.status,
        newValue: "Rejected",
        metadata: { comment, stageKey: "position_budget_approval" }
      });

    });

  },

  sendBackBudgetRequest(id, comment) {

    Promise.resolve(
      workforcePlanningRepository.sendBackBudgetRequest(
        get().workforce,
        id,
        comment
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        workforce: result.workforce,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.BUDGET_SENT_BACK, {
        module: "Workforce Planning",
        entity: "Budget Request",
        entityId: id,
        action: `Budget sent back for ${result.request?.position || id}`,
        metadata: { comment, stageKey: "position_budget_approval" }
      });

    });

  },

  createRequisition(positionId) {

    Promise.resolve(
      workforcePlanningRepository.createRequisition(
        get().workforce,
        get().hiringProcess,
        positionId
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        workforce: result.workforce,
        hiringProcess: result.hiringProcess,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.REQUISITION_CREATED, {
        module: "Recruitment Management",
        entity: "Requisition",
        entityId: result.requisitionId,
        action: `Requisition created from approved position ${positionId}`,
        metadata: { stageKey: "requisition_raised" }
      });

      Promise.resolve(recruitmentRepository.getAll()).then((recruitment) => {
        set({ recruitment });
      });

    });

  },

  assignRecruiter(requisitionCode, recruiterCode) {

    Promise.resolve(
      recruitmentRepository.assignRecruiter(
        get().recruitment,
        requisitionCode,
        recruiterCode
      )
    ).then((result) => {

      set({
        recruitment: result.recruitment,
        taskInbox: result.taskInbox || get().taskInbox,
        interviews: result.interviews || get().interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.RECRUITER_ASSIGNED, {
        module: "Recruitment Management",
        entity: "Requisition",
        entityId: requisitionCode,
        action: `Recruiter ${recruiterCode} assigned`,
        metadata: { recruiterCode, stageKey: "recruiter_assigned" }
      });

    });

  },

  mapCandidateToRequisition(payload) {

    Promise.resolve(
      recruitmentRepository.mapCandidate(get().recruitment, payload)
    ).then((result) => {

      set({
        recruitment: result.recruitment,
        taskInbox: result.taskInbox || get().taskInbox,
        interviews: result.interviews || get().interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.CANDIDATE_MAPPED, {
        module: "Recruitment Management",
        entity: "Candidate",
        entityId: String(payload.candidate_id),
        action: "Candidate mapped to requisition",
        metadata: { reqId: payload.req_id, stageKey: "applied" }
      });

    });

  },

  updateRecruitmentStage(mapId, stageName, remarks = "") {

    Promise.resolve(
      recruitmentRepository.updateCandidateStage(
        get().recruitment,
        mapId,
        stageName,
        remarks
      )
    ).then((result) => {

      set({
        recruitment: result.recruitment,
        taskInbox: result.taskInbox || get().taskInbox,
        interviews: result.interviews || get().interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      const eventType = result.eventType === "CandidateRejected"
        ? ENTERPRISE_EVENTS.CANDIDATE_REJECTED
        : result.eventType === "CandidateShortlisted"
          ? ENTERPRISE_EVENTS.CANDIDATE_SHORTLISTED
          : ENTERPRISE_EVENTS.STAGE_CHANGED;

      publishAudit(set, get, eventType, {
        module: "Recruitment Management",
        entity: "Candidate Pipeline",
        entityId: String(mapId),
        action: `Stage updated to ${stageName}`,
        newValue: stageName,
        metadata: { remarks }
      });

    });

  },

  approveRecruitmentRequisition(requisitionCode, comment = "") {

    Promise.resolve(
      recruitmentRepository.approveRequisition(
        get().recruitment,
        requisitionCode,
        comment
      )
    ).then((result) => {

      set({
        recruitment: result.recruitment,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.REQUISITION_APPROVED, {
        module: "Recruitment Management",
        entity: "Requisition",
        entityId: requisitionCode,
        action: "Requisition approved for recruitment",
        metadata: { comment, stageKey: "approved_requisition" }
      });

    });

  },

  completeTask(taskId, comment = "") {

    Promise.resolve(
      taskRepository.completeTask(get().taskInbox, taskId, comment)
    ).then((result) => {

      set({
        taskInbox: result.tasks,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.TASK_COMPLETED, {
        module: "Enterprise Task Inbox",
        entity: "Task",
        entityId: String(taskId),
        action: "Task completed from inbox"
      });

    });

  },

  scheduleInterview(payload) {

    Promise.resolve(
      interviewRepository.scheduleInterview(get().interviews, payload)
    ).then((result) => {

      set({
        interviews: result.interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.INTERVIEW_SCHEDULED, {
        module: "Interview Management",
        entity: "Interview",
        entityId: payload.interview_id || "scheduled",
        action: "Interview scheduled via enterprise service",
        metadata: { roundType: payload.round_type }
      });

      Promise.resolve(taskRepository.getAll()).then((taskInbox) => {
        set({ taskInbox });
      });

    });

  },

  submitInterviewFeedback(interviewId, payload) {

    Promise.resolve(
      interviewRepository.submitFeedback(get().interviews, interviewId, payload)
    ).then((result) => {

      set({
        interviews: result.interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.FEEDBACK_SUBMITTED, {
        module: "Interview Management",
        entity: "Interview",
        entityId: String(interviewId),
        action: "Interview feedback submitted"
      });

    });

  },

  completeInterview(interviewId, comment = "") {

    Promise.resolve(
      interviewRepository.completeInterview(get().interviews, interviewId, comment)
    ).then((result) => {

      set({
        interviews: result.interviews,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.INTERVIEW_COMPLETED, {
        module: "Interview Management",
        entity: "Interview",
        entityId: String(interviewId),
        action: "Interview marked completed"
      });

    });

  },

  createOffer(payload) {

    Promise.resolve(
      offerRepository.createOffer(get().offers, payload)
    ).then((result) => {

      set({
        offers: result.offers,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.OFFER_CREATED, {
        module: "Offer Management",
        entity: "Offer",
        entityId: result.offer?.offerId || "new-offer",
        action: "Offer draft created",
        metadata: { requisitionCode: payload.requisition_code }
      });

      Promise.resolve(taskRepository.getAll()).then((taskInbox) => {
        set({ taskInbox });
      });

    });

  },

  submitOffer(offerId, comment = "") {

    Promise.resolve(
      offerRepository.submitOffer(get().offers, offerId, comment)
    ).then((result) => {

      set({
        offers: result.offers,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.OFFER_SUBMITTED, {
        module: "Offer Management",
        entity: "Offer",
        entityId: offerId,
        action: "Offer submitted for approval"
      });

    });

  },

  approveOfferStep(offerId, approvalStep, comment = "") {

    Promise.resolve(
      offerRepository.approveOffer(get().offers, offerId, approvalStep, comment)
    ).then((result) => {

      set({
        offers: result.offers,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      const eventType = /finance/i.test(approvalStep)
        ? ENTERPRISE_EVENTS.FINANCE_APPROVED
        : /leadership/i.test(approvalStep)
          ? ENTERPRISE_EVENTS.LEADERSHIP_APPROVED
          : ENTERPRISE_EVENTS.STAGE_APPROVED;

      publishAudit(set, get, eventType, {
        module: "Offer Management",
        entity: "Offer",
        entityId: offerId,
        action: `${approvalStep} completed`,
        metadata: { comment }
      });

    });

  },

  releaseOffer(offerId, payload = {}) {

    Promise.resolve(
      offerRepository.releaseOffer(get().offers, offerId, payload)
    ).then((result) => {

      set({
        offers: result.offers,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.OFFER_RELEASED, {
        module: "Offer Management",
        entity: "Offer",
        entityId: offerId,
        action: "Offer released to candidate"
      });

    });

  },

  acceptOffer(offerId) {

    Promise.resolve(
      offerRepository.acceptOffer(get().offers, offerId)
    ).then((result) => {

      set({
        offers: result.offers,
        workforceUi: {
          ...get().workforceUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.OFFER_ACCEPTED, {
        module: "Offer Management",
        entity: "Offer",
        entityId: offerId,
        action: "Candidate accepted offer",
        metadata: { stageKey: "joined" }
      });

    });

  },

  // ─── Hiring Control Tower ───────────────────────────────────────────────────

  setHiringTowerUi(updater) {
    set((state) => ({
      hiringTowerUi: typeof updater === "function"
        ? updater(state.hiringTowerUi)
        : updater
    }));
  },

  updateHiringProcess(updater) {

    set({
      hiringProcess: hiringControlTowerRepository.updateProcess(
        get().hiringProcess,
        updater
      )
    });

  },

  appendHiringTimeline(event) {

    set({
      hiringProcess: hiringControlTowerRepository.appendTimeline(
        get().hiringProcess,
        event
      )
    });

  },

  updateHiringStageStatus(stageKey, status, extra = {}) {

    set({
      hiringProcess: hiringControlTowerRepository.updateStageStatus(
        get().hiringProcess,
        stageKey,
        status,
        extra
      )
    });

  },

  approveHiringStage(stageKey) {

    Promise.resolve(
      hiringControlTowerRepository.approveStage(
        get().hiringProcess,
        stageKey
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        hiringProcess: result.hiringProcess,
        hiringTowerUi: {
          ...get().hiringTowerUi,
          toastMessage: result.toastMessage
        }
      });

      const eventType = stageKey === "finance_approval"
        ? ENTERPRISE_EVENTS.FINANCE_APPROVED
        : stageKey === "leadership_approval"
          ? ENTERPRISE_EVENTS.LEADERSHIP_APPROVED
          : ENTERPRISE_EVENTS.STAGE_APPROVED;

      publishAudit(set, get, eventType, {
        module: "Hiring Control Tower",
        entity: "Workflow Stage",
        entityId: stageKey,
        action: `Approved — ${result.stage.name}`,
        metadata: { stageKey }
      });

    });

  },

  rejectHiringStage(stageKey) {

    Promise.resolve(
      hiringControlTowerRepository.rejectStage(
        get().hiringProcess,
        stageKey
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        hiringProcess: result.hiringProcess,
        hiringTowerUi: {
          ...get().hiringTowerUi,
          toastMessage: result.toastMessage
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.STAGE_REJECTED, {
        module: "Hiring Control Tower",
        entity: "Workflow Stage",
        entityId: stageKey,
        action: `Rejected — ${result.stage.name}`,
        metadata: { stageKey }
      });

    });

  },

  requestHiringClarification(stageKey) {
    set({
      hiringTowerUi: hiringControlTowerRepository.requestClarification(
        get().hiringTowerUi
      )
    });
  },

  sendHiringClarification(stageKey) {

    Promise.resolve(
      hiringControlTowerRepository.sendClarification(
        get().hiringProcess,
        get().hiringTowerUi,
        stageKey
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        hiringProcess: result.hiringProcess,
        hiringTowerUi: result.hiringTowerUi
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.CLARIFICATION_REQUESTED, {
        module: "Hiring Control Tower",
        entity: "Workflow Stage",
        entityId: stageKey,
        action: "Requested Clarification",
        metadata: { stageKey, comment: result.clarificationDraft?.comment }
      });

    });

  },

  submitHiringClarification(stageKey) {

    Promise.resolve(
      hiringControlTowerRepository.submitClarification(
        get().hiringProcess,
        stageKey,
        get().hiringTowerUi.clarificationDraft?.comment || ""
      )
    ).then((result) => {

      if (!result) {
        return;
      }

      set({ hiringProcess: result.hiringProcess });

      publishAudit(set, get, ENTERPRISE_EVENTS.CLARIFICATION_SUBMITTED, {
      module: "Hiring Control Tower",
      entity: "Workflow Stage",
      entityId: stageKey,
      action: "Clarification Submitted",
      metadata: {
        stageKey,
        comment: "Response provided — workflow resuming."
      }
    });

    setTimeout(() => {
      set({
        hiringProcess: hiringControlTowerRepository.resumeAfterClarification(
          get().hiringProcess,
          stageKey,
          result.stage
        ),
        hiringTowerUi: {
          ...get().hiringTowerUi,
          toastMessage: "Clarification submitted. Workflow resumed."
        }
      });
    }, 800);

    });

  },

  // ─── Master Data ────────────────────────────────────────────────────────────

  setMasterDataUi(updater) {
    set((state) => ({
      masterDataUi: typeof updater === "function"
        ? updater(state.masterDataUi)
        : updater
    }));
  },

  selectMasterEntityType(domainKey, entityType) {
    set((state) => ({
      masterDataUi: {
        ...state.masterDataUi,
        selectedDomainKey: domainKey,
        selectedEntityType: entityType,
        selectedRecordId: null,
        drawerOpen: false,
        drawerTab: "edit",
        draftRecord: null
      }
    }));
  },

  openMasterRecordDrawer(recordId, tab = "edit") {
    const record = get().masterData.records[get().masterDataUi.selectedEntityType]
      ?.find((item) => item.id === recordId);

    set((state) => ({
      masterDataUi: {
        ...state.masterDataUi,
        selectedRecordId: recordId,
        drawerOpen: true,
        drawerTab: tab,
        draftRecord: record ? { ...record } : null
      }
    }));
  },

  closeMasterRecordDrawer() {
    set((state) => ({
      masterDataUi: {
        ...state.masterDataUi,
        drawerOpen: false,
        selectedRecordId: null,
        draftRecord: null
      }
    }));
  },

  startNewMasterRecord() {
    const entityType = get().masterDataUi.selectedEntityType;

    set((state) => ({
      masterDataUi: {
        ...state.masterDataUi,
        selectedRecordId: null,
        drawerOpen: true,
        drawerTab: "edit",
        draftRecord: {
          id: null,
          entityType,
          code: "",
          name: "",
          description: "",
          status: "Active",
          version: "0.1",
          versionStatus: "Draft",
          usedBy: [],
          lastUpdated: new Date().toISOString(),
          history: []
        }
      }
    }));
  },

  updateMasterDraft(field, value) {
    set((state) => ({
      masterDataUi: {
        ...state.masterDataUi,
        draftRecord: state.masterDataUi.draftRecord
          ? { ...state.masterDataUi.draftRecord, [field]: value }
          : null
      }
    }));
  },

  saveMasterRecord(reason = "") {

    const { draftRecord, selectedEntityType } = get().masterDataUi;

    Promise.resolve(
      masterDataRepository.saveRecord(get().masterData, {
        draftRecord,
        selectedEntityType,
        reason
      })
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        masterData: result.masterData,
        masterDataUi: {
          ...get().masterDataUi,
          selectedRecordId: result.recordId,
          draftRecord: { ...result.savedRecord },
          toastMessage: result.toastMessage
            || (result.isNew ? "Master record created." : "Master record saved.")
        }
      });

      publishAudit(set, get, result.isNew
        ? ENTERPRISE_EVENTS.MASTER_DATA_CREATED
        : ENTERPRISE_EVENTS.MASTER_DATA_UPDATED, {
        module: "Enterprise Master Data",
        entity: result.entityType,
        entityId: result.recordId,
        action: `${result.savedRecord.name} ${result.isNew ? "created" : "updated"}`,
        previousValue: result.previous?.name || null,
        newValue: result.savedRecord.name,
        metadata: { reason, code: result.savedRecord.code }
      });

    });

  },

  publishMasterRecord(recordId, reason = "") {

    const entityType = get().masterDataUi.selectedEntityType;

    Promise.resolve(
      masterDataRepository.publishRecord(get().masterData, {
        entityType,
        recordId,
        reason
      })
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        masterData: result.masterData,
        masterDataUi: {
          ...get().masterDataUi,
          toastMessage: result.toastMessage || `${result.record.name} published.`
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.MASTER_DATA_PUBLISHED, {
        module: "Enterprise Master Data",
        entity: result.entityType,
        entityId: result.recordId,
        action: `${result.record.name} published`,
        previousValue: "Draft",
        newValue: "Published",
        metadata: { reason, version: result.nextVersion }
      });

    });

  },

  archiveMasterRecord(recordId, reason = "") {

    const entityType = get().masterDataUi.selectedEntityType;

    Promise.resolve(
      masterDataRepository.archiveRecord(get().masterData, {
        entityType,
        recordId,
        reason
      })
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        masterData: result.masterData,
        masterDataUi: {
          ...get().masterDataUi,
          toastMessage: result.toastMessage || "Master record archived."
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.MASTER_DATA_ARCHIVED, {
        module: "Enterprise Master Data",
        entity: result.entityType,
        entityId: result.recordId,
        action: "Record archived",
        metadata: { reason }
      });

    });

  },

  rollbackMasterRecord(recordId, targetVersion, reason = "") {

    const entityType = get().masterDataUi.selectedEntityType;

    Promise.resolve(
      masterDataRepository.rollbackRecord(get().masterData, {
        entityType,
        recordId,
        targetVersion,
        reason
      })
    ).then((result) => {

      if (!result) {
        return;
      }

      set({
        masterData: result.masterData,
        masterDataUi: {
          ...get().masterDataUi,
          toastMessage: result.toastMessage || `Rolled back to version ${targetVersion}.`
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.MASTER_DATA_ROLLBACK, {
        module: "Enterprise Master Data",
        entity: result.entityType,
        entityId: result.recordId,
        action: `Rollback to v${targetVersion}`,
        previousValue: result.record?.version,
        newValue: targetVersion,
        metadata: { reason }
      });

    });

  },

  previewMasterImport(rows) {

    const entityType = get().masterDataUi.selectedEntityType;

    Promise.resolve(
      masterDataRepository.previewImport(get().masterData, {
        entityType,
        rows
      })
    ).then((preview) => {
      set({
        masterDataUi: {
          ...get().masterDataUi,
          importPreview: preview
        }
      });
    });

  },

  commitMasterImport(rows, reason = "") {

    const entityType = get().masterDataUi.selectedEntityType;

    Promise.resolve(
      masterDataRepository.commitImport(get().masterData, {
        entityType,
        rows,
        reason
      })
    ).then((result) => {

      if (!result.imported) {
        set({
          masterDataUi: {
            ...get().masterDataUi,
            toastMessage: "No new records to import — duplicates detected."
          }
        });
        return;
      }

      set({
        masterData: result.masterData,
        masterDataUi: {
          ...get().masterDataUi,
          importDialogOpen: false,
          importPreview: null,
          toastMessage: result.toastMessage
            || `${result.newRecords.length} record(s) imported.`
        }
      });

      publishAudit(set, get, ENTERPRISE_EVENTS.MASTER_DATA_IMPORTED, {
        module: "Enterprise Master Data",
        entity: result.entityType,
        entityId: result.entityType,
        action: `${result.newRecords.length} records imported`,
        newValue: result.newRecords.map((item) => item.code).join(", "),
        metadata: { reason, count: result.newRecords.length }
      });

    });

  },

  exportMasterRecords(format = "CSV") {

    const entityType = get().masterDataUi.selectedEntityType;
    const records = get().masterData.records[entityType] || [];

    set({
      masterDataUi: {
        ...get().masterDataUi,
        toastMessage: `Exported ${records.length} record(s) as ${format}.`
      }
    });

    return records;

  }

}));

export default useEnterpriseStore;
