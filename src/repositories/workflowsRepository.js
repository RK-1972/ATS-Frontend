import { isLiveMode } from "@/api/config";
import workflowsClient from "@/api/clients/workflowsClient";
import platformConfigMock from "@/data/mock/platformConfig.mock";
import hiringControlTowerMock from "@/data/mock/hiringControlTower.mock";
import { cloneData } from "@/utils/cloneData";

function buildEmptyShell() {
  return {
    meta: {
      org_name: "",
      last_published: null,
      environment: "Production"
    },
    definitions: [],
    workflows: [],
    instances: [],
    primary_instance_id: null
  };
}

function buildHiringProcessFromInstance(primaryInstance) {
  if (!primaryInstance) {
    return null;
  }

  const {
    instanceId: _instanceId,
    workflowCode: _workflowCode,
    currentStageKey: _currentStageKey,
    status: _status,
    ...hiringProcess
  } = primaryInstance;

  return cloneData(hiringProcess);
}

function getInitialState() {
  if (isLiveMode()) {
    return buildEmptyShell();
  }

  return {
    meta: {
      org_name: "IGS Engineering Quality",
      last_published: null,
      environment: "Production"
    },
    definitions: [],
    workflows: cloneData(platformConfigMock.workflows),
    instances: [{
      instanceId: hiringControlTowerMock.meta.process_id,
      workflowCode: "ENTERPRISE_HIRING_LIFECYCLE",
      status: "Running"
    }],
    primary_instance_id: hiringControlTowerMock.meta.process_id
  };
}

function getHiringInitialState() {
  if (isLiveMode()) {
    return {
      ...cloneData(hiringControlTowerMock),
      meta: { ...hiringControlTowerMock.meta, process_id: "" },
      stages: [],
      timeline: []
    };
  }

  return workflowsRepositoryGetHiringMockState();
}

function workflowsRepositoryGetHiringMockState() {
  const {
    integration_chain: _integrationChain,
    business_rule_details: _businessRuleDetails,
    process_business_rules: _processBusinessRules,
    timeline: initialTimeline,
    stages: initialStages,
    budget: initialBudget,
    stage_notifications: initialStageNotifications,
    kpis: initialKpis,
    meta: initialMeta,
    budget_approval_path: initialBudgetApprovalPath,
    ...hiringProcessRest
  } = hiringControlTowerMock;

  return {
    ...cloneData(hiringProcessRest),
    meta: cloneData(initialMeta),
    budget: cloneData(initialBudget),
    stages: cloneData(initialStages),
    timeline: cloneData(initialTimeline),
    stage_notifications: cloneData(initialStageNotifications),
    kpis: cloneData(initialKpis),
    budget_approval_path: cloneData(initialBudgetApprovalPath),
    linkedPositionId: "AP-ENG-042",
    linkedRequisitionId: initialMeta.requisition_id
  };
}

function normalizeBundle(response) {
  if (response?.config) {
    return {
      config: cloneData(response.config),
      baseline: cloneData(response.baseline || response.config),
      workflows: cloneData(response.workflows || response.config.workflows || []),
      definitions: cloneData(response.definitions || response.config.definitions || []),
      instances: cloneData(response.instances || []),
      primaryInstance: response.primaryInstance ? cloneData(response.primaryInstance) : null,
      isDirty: Boolean(response.isDirty),
      version: response.version
    };
  }

  return {
    config: cloneData(response),
    baseline: cloneData(response),
    workflows: cloneData(response.workflows || []),
    definitions: [],
    instances: [],
    primaryInstance: null,
    isDirty: false
  };
}

function resolveInstanceId(hiringProcess) {
  return hiringProcess?.meta?.process_id || hiringProcess?.instanceId;
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await workflowsClient.getAll();
    return normalizeBundle(response);
  }

  return {
    config: {
      workflows: cloneData(currentData?.workflows || platformConfigMock.workflows)
    },
    workflows: cloneData(currentData?.workflows || platformConfigMock.workflows),
    primaryInstance: workflowsRepositoryGetHiringMockState(),
    isDirty: false
  };
}

async function getWorkflows(platformConfig) {
  const bundle = await getAll(platformConfig);
  return bundle.workflows;
}

async function getPrimaryHiringProcess() {
  if (!isLiveMode()) {
    return workflowsRepositoryGetHiringMockState();
  }

  const bundle = await workflowsClient.getAll();
  const normalized = normalizeBundle(bundle);
  return buildHiringProcessFromInstance(normalized.primaryInstance);
}

async function getByCode(workflowCode, currentData) {
  if (isLiveMode()) {
    return workflowsClient.getByCode(workflowCode);
  }

  const workflows = currentData?.workflows || platformConfigMock.workflows;
  return cloneData(workflows.find((item) => item.key === workflowCode) || null);
}

async function publish(payload, reason = "") {
  if (!isLiveMode()) {
    return cloneData(payload);
  }

  const response = await workflowsClient.publish(payload, reason);
  return normalizeBundle(response);
}

async function discard() {
  if (!isLiveMode()) {
    return buildEmptyShell();
  }

  const response = await workflowsClient.discard();
  return normalizeBundle(response);
}

async function advanceInstance(hiringProcess, action, executionContext = {}) {
  if (!isLiveMode()) {
    return null;
  }

  const instanceId = resolveInstanceId(hiringProcess);
  const stageKey = executionContext.stageKey || executionContext.stage_key;

  return workflowsClient.advance(instanceId, action, {
    ...executionContext,
    stageKey
  });
}

async function approveStage(hiringProcess, stageKey) {
  if (!isLiveMode()) {
    return null;
  }

  const result = await advanceInstance(hiringProcess, "approve", { stageKey });
  const stage = result?.hiringProcess?.stages?.find((item) => item.key === stageKey);

  return {
    hiringProcess: result.hiringProcess,
    stage,
    toastMessage: result.toastMessage || `${stage?.name || "Stage"} approved.`
  };
}

async function rejectStage(hiringProcess, stageKey) {
  if (!isLiveMode()) {
    return null;
  }

  const result = await advanceInstance(hiringProcess, "reject", { stageKey });
  const stage = result?.hiringProcess?.stages?.find((item) => item.key === stageKey);

  return {
    hiringProcess: result.hiringProcess,
    stage,
    toastMessage: result.toastMessage || `${stage?.name || "Stage"} rejected.`
  };
}

async function sendClarification(hiringProcess, hiringTowerUi, stageKey) {
  if (!isLiveMode()) {
    return null;
  }

  const instanceId = resolveInstanceId(hiringProcess);
  const comments = hiringTowerUi.clarificationDraft?.comment || "";
  const result = await workflowsClient.requestClarification(instanceId, comments);

  return {
    hiringProcess: result.hiringProcess,
    stage: result.hiringProcess?.stages?.find((item) => item.key === stageKey),
    clarificationDraft: hiringTowerUi.clarificationDraft,
    hiringTowerUi: {
      ...hiringTowerUi,
      showClarificationForm: false,
      clarificationDraft: {
        comment: "",
        document: "",
        mention: "",
        priority: "Normal",
        due_date: ""
      },
      toastMessage: result.toastMessage
    }
  };
}

async function submitClarificationLive(hiringProcess, stageKey, comments = "") {
  const instanceId = resolveInstanceId(hiringProcess);
  const result = await workflowsClient.submitClarification(instanceId, comments);

  return {
    hiringProcess: result.hiringProcess,
    stage: result.stage || result.hiringProcess?.stages?.find((item) => item.key === stageKey)
  };
}

const workflowsRepository = {
  getInitialState,
  getHiringInitialState,
  getAll,
  getWorkflows,
  getPrimaryHiringProcess,
  getByCode,
  publish,
  discard,
  advanceInstance,
  approveStage,
  rejectStage,
  sendClarification,
  submitClarificationLive,
  resolveInstanceId
};

export default workflowsRepository;
