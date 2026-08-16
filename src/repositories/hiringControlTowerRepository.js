import { isLiveMode } from "@/api/config";
import hiringControlTowerClient from "@/api/clients/hiringControlTowerClient";
import workflowsRepository from "@/repositories/workflowsRepository";
import hiringControlTowerMock from "@/data/mock/hiringControlTower.mock";
import workforcePlanningMock from "@/data/mock/workforcePlanning.mock";
import { cloneData } from "@/utils/cloneData";

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

function getInitialState() {
  if (isLiveMode()) {
    return workflowsRepository.getHiringInitialState();
  }

  return {
    ...cloneData(hiringProcessRest),
    meta: cloneData(initialMeta),
    budget: cloneData(initialBudget),
    stages: cloneData(initialStages),
    timeline: cloneData(initialTimeline),
    stage_notifications: cloneData(initialStageNotifications),
    kpis: cloneData(initialKpis),
    budget_approval_path: cloneData(initialBudgetApprovalPath),
    linkedPositionId: workforcePlanningMock.approved_positions[1]?.id || null,
    linkedRequisitionId: initialMeta.requisition_id
  };
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const process = await workflowsRepository.getPrimaryHiringProcess();

    if (process) {
      return process;
    }

    return hiringControlTowerClient.getAll();
  }

  return cloneData(currentData);
}

async function getById(id, currentData) {
  return hiringControlTowerClient.getById(id, currentData);
}

async function searchRequisitions(params) {
  const response = await hiringControlTowerClient.searchRequisitions(params);
  return response?.data || { items: [], page: 1, pageSize: 20, total: 0 };
}

async function getRequisitionHeader(code) {
  try {
    const response = await hiringControlTowerClient.getRequisitionHeader(code);

    if (!response?.success) {
      const error = new Error(response?.message || "Failed to load requisition header.");
      error.status = response?.status;
      throw error;
    }

    return response.data || null;
  } catch (error) {
    const wrapped = new Error(
      error.response?.data?.message
      || error.message
      || "Failed to load requisition header."
    );
    wrapped.status = error.response?.status || error.status;
    throw wrapped;
  }
}

async function getRequisitionLifecycle(code) {
  try {
    const response = await hiringControlTowerClient.getRequisitionLifecycle(code);

    if (!response?.success) {
      const error = new Error(response?.message || "Failed to load hiring lifecycle.");
      error.status = response?.status;
      throw error;
    }

    return response.data || null;
  } catch (error) {
    const wrapped = new Error(
      error.response?.data?.message
      || error.message
      || "Failed to load hiring lifecycle."
    );
    wrapped.status = error.response?.status || error.status;
    throw wrapped;
  }
}

async function getExecutiveKpis() {
  try {
    const response = await hiringControlTowerClient.getExecutiveKpis();

    if (!response?.success) {
      const error = new Error(response?.message || "Failed to load executive KPIs.");
      error.status = response?.status;
      throw error;
    }

    return response.data || null;
  } catch (error) {
    const wrapped = new Error(
      error.response?.data?.message
      || error.message
      || "Failed to load executive KPIs."
    );
    wrapped.status = error.response?.status || error.status;
    throw wrapped;
  }
}

async function getStageInspector(code, milestoneKey) {
  try {
    const response = await hiringControlTowerClient.getStageInspector(code, milestoneKey);

    if (!response?.success) {
      const error = new Error(response?.message || "Failed to load stage inspector.");
      error.status = response?.status;
      throw error;
    }

    return response.data || null;
  } catch (error) {
    const wrapped = new Error(
      error.response?.data?.message
      || error.message
      || "Failed to load stage inspector."
    );
    wrapped.status = error.response?.status || error.status;
    throw wrapped;
  }
}

function updateProcess(hiringProcess, updater) {
  return typeof updater === "function"
    ? updater(hiringProcess)
    : updater;
}

function appendTimeline(hiringProcess, event) {
  return {
    ...hiringProcess,
    timeline: [...hiringProcess.timeline, event]
  };
}

function updateStageStatus(hiringProcess, stageKey, status, extra = {}) {
  return {
    ...hiringProcess,
    stages: hiringProcess.stages.map((stage) =>
      stage.key === stageKey
        ? { ...stage, status, ...extra }
        : stage
    )
  };
}

function approveStageLocal(hiringProcess, stageKey) {
  const stage = hiringProcess.stages.find((item) => item.key === stageKey);

  if (!stage?.is_approval_stage) {
    return null;
  }

  const nextProcess = updateStageStatus(hiringProcess, stageKey, "Completed", {
    completion_pct: 100,
    sla_remaining_hours: 0
  });

  return {
    hiringProcess: nextProcess,
    stage,
    toastMessage: `${stage.name} approved.`
  };
}

async function approveStage(hiringProcess, stageKey) {
  if (isLiveMode()) {
    return workflowsRepository.approveStage(hiringProcess, stageKey);
  }

  return approveStageLocal(hiringProcess, stageKey);
}

function rejectStageLocal(hiringProcess, stageKey) {
  const stage = hiringProcess.stages.find((item) => item.key === stageKey);

  if (!stage?.is_approval_stage) {
    return null;
  }

  const nextProcess = updateStageStatus(hiringProcess, stageKey, "Rejected", {
    completion_pct: 0
  });

  return {
    hiringProcess: nextProcess,
    stage,
    toastMessage: `${stage.name} rejected.`
  };
}

async function rejectStage(hiringProcess, stageKey) {
  if (isLiveMode()) {
    return workflowsRepository.rejectStage(hiringProcess, stageKey);
  }

  return rejectStageLocal(hiringProcess, stageKey);
}

function requestClarification(hiringTowerUi) {
  return {
    ...hiringTowerUi,
    showClarificationForm: true
  };
}

function sendClarificationLocal(hiringProcess, hiringTowerUi, stageKey) {
  const stage = hiringProcess.stages.find((item) => item.key === stageKey);

  if (!stage) {
    return null;
  }

  const nextProcess = updateStageStatus(
    hiringProcess,
    stageKey,
    "Waiting for Clarification"
  );

  return {
    hiringProcess: nextProcess,
    stage,
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
      toastMessage: "Clarification request sent. Workflow paused."
    }
  };
}

async function sendClarification(hiringProcess, hiringTowerUi, stageKey) {
  if (isLiveMode()) {
    return workflowsRepository.sendClarification(hiringProcess, hiringTowerUi, stageKey);
  }

  return sendClarificationLocal(hiringProcess, hiringTowerUi, stageKey);
}

function submitClarificationLocal(hiringProcess, stageKey) {
  const stage = hiringProcess.stages.find((item) => item.key === stageKey);

  if (!stage) {
    return null;
  }

  const nextProcess = updateStageStatus(
    hiringProcess,
    stageKey,
    "Clarification Submitted"
  );

  return {
    hiringProcess: nextProcess,
    stage
  };
}

async function submitClarification(hiringProcess, stageKey, comments = "") {
  if (isLiveMode()) {
    return workflowsRepository.submitClarificationLive(hiringProcess, stageKey, comments);
  }

  return submitClarificationLocal(hiringProcess, stageKey);
}

function resumeAfterClarification(hiringProcess, stageKey, stage) {
  return updateStageStatus(hiringProcess, stageKey, "In Progress", {
    completion_pct: Math.max(stage.completion_pct, 30)
  });
}

const hiringControlTowerRepository = {
  getInitialState,
  getAll,
  getById,
  searchRequisitions,
  getRequisitionHeader,
  getRequisitionLifecycle,
  getExecutiveKpis,
  getStageInspector,
  create: updateProcess,
  update: updateProcess,
  publish: approveStage,
  archive: rejectStage,
  delete: rejectStage,
  updateProcess,
  appendTimeline,
  updateStageStatus,
  approveStage,
  rejectStage,
  requestClarification,
  sendClarification,
  submitClarification,
  resumeAfterClarification
};

export default hiringControlTowerRepository;
