import { isLiveMode } from "@/api/config";
import workforcePlanningClient from "@/api/clients/workforcePlanningClient";
import workforcePlanningMock from "@/data/mock/workforcePlanning.mock";
import { cloneData } from "@/utils/cloneData";

function buildEmptyShell() {
  return {
    meta: {
      fiscal_year: "",
      org_name: "",
      currency: "INR",
      last_updated: null
    },
    dashboard: {
      approved_headcount: 0,
      filled_positions: 0,
      vacant_positions: 0,
      budget_utilization_pct: 0,
      total_approved_budget: 0,
      budget_consumed: 0,
      upcoming_hiring: [],
      budget_exceptions_summary: []
    },
    budget_requests: [],
    approval_queue: [],
    approved_positions: [],
    budget_exceptions: [],
    analytics: {
      budget_vs_actual: { approved: 0, actual: 0, forecast: 0 },
      savings: 0,
      overspend: 0,
      approval_sla_days: 0,
      department_utilization: [],
      monthly_trend: []
    }
  };
}

function getInitialState() {
  if (isLiveMode()) {
    return buildEmptyShell();
  }

  return cloneData(workforcePlanningMock);
}

function getDefaultSelectedRequestId(workforce) {
  return workforce.approval_queue[0]?.id ?? null;
}

function normalizeBundle(response) {
  if (response?.config) {
    return {
      config: cloneData(response.config),
      baseline: cloneData(response.baseline || response.config),
      isDirty: Boolean(response.isDirty)
    };
  }

  const config = cloneData(response);
  return { config, baseline: cloneData(config), isDirty: false };
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    const response = await workforcePlanningClient.getAll();
    return normalizeBundle(response);
  }

  return {
    config: cloneData(currentData),
    baseline: cloneData(currentData),
    isDirty: false
  };
}

async function getById(id, currentData) {
  if (isLiveMode()) {
    return workforcePlanningClient.getById(id, currentData?.config || currentData);
  }

  return workforcePlanningClient.getById(id, currentData);
}

function approveBudgetRequestLocal(workforce, hiringProcess, id, comment) {
  const request = workforce.approval_queue.find((req) => req.id === id);

  if (!request) {
    return null;
  }

  const approvedPosition = {
    id: `AP-2026-${String(workforce.approved_positions.length + 90).padStart(4, "0")}`,
    department: request.department,
    position: request.position,
    grade: request.grade,
    headcount: request.headcount,
    budget_approved: request.proposed_budget,
    budget_consumed: 0,
    remaining_budget: request.proposed_budget,
    expiry_date: "2026-12-31",
    requisitions_created: 0,
    status: "Active",
    source_request_id: request.id
  };

  const nextWorkforce = {
    ...workforce,
    approval_queue: workforce.approval_queue.map((req) => {
      if (req.id !== id) {
        return req;
      }

      return {
        ...req,
        status: "Approved",
        timeline: [
          ...req.timeline,
          {
            step: "Approved",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ],
        history: [
          ...req.history,
          {
            action: "Approved",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ]
      };
    }),
    budget_requests: workforce.budget_requests.map((req) =>
      req.id === id ? { ...req, status: "Approved" } : req
    ),
    approved_positions: [approvedPosition, ...workforce.approved_positions],
    dashboard: {
      ...workforce.dashboard,
      approved_headcount: workforce.dashboard.approved_headcount + request.headcount,
      vacant_positions: workforce.dashboard.vacant_positions + request.headcount
    }
  };

  return {
    workforce: nextWorkforce,
    hiringProcess: { ...hiringProcess, linkedPositionId: approvedPosition.id },
    request,
    approvedPosition,
    toastMessage: "Budget request approved."
  };
}

async function approveBudgetRequest(workforce, hiringProcess, id, comment) {
  if (!isLiveMode()) {
    return approveBudgetRequestLocal(workforce, hiringProcess, id, comment);
  }

  const result = await workforcePlanningClient.approveBudgetRequest(id, comment);
  const hiringProcessUpdate = result.hiringProcessUpdate || {};

  return {
    workforce: result.workforce,
    hiringProcess: {
      ...hiringProcess,
      ...hiringProcessUpdate,
      meta: {
        ...hiringProcess.meta,
        ...(hiringProcessUpdate.meta || {})
      },
      linkedPositionId:
        hiringProcessUpdate.linkedPositionId
        || result.approvedPosition?.id
        || hiringProcess.linkedPositionId
    },
    request: result.request,
    approvedPosition: result.approvedPosition,
    toastMessage: result.toastMessage
  };
}

function rejectBudgetRequestLocal(workforce, id, comment) {
  const request = workforce.approval_queue.find((req) => req.id === id);

  const nextWorkforce = {
    ...workforce,
    approval_queue: workforce.approval_queue.map((req) => {
      if (req.id !== id) {
        return req;
      }

      return {
        ...req,
        status: "Rejected",
        timeline: [
          ...req.timeline,
          {
            step: "Rejected",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ],
        history: [
          ...req.history,
          {
            action: "Rejected",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ]
      };
    }),
    budget_requests: workforce.budget_requests.map((req) =>
      req.id === id ? { ...req, status: "Rejected" } : req
    )
  };

  return {
    workforce: nextWorkforce,
    request,
    toastMessage: "Budget request rejected."
  };
}

async function rejectBudgetRequest(workforce, id, comment) {
  if (!isLiveMode()) {
    return rejectBudgetRequestLocal(workforce, id, comment);
  }

  const result = await workforcePlanningClient.rejectBudgetRequest(id, comment);
  return {
    workforce: result.workforce,
    request: result.request,
    toastMessage: result.toastMessage
  };
}

function sendBackBudgetRequestLocal(workforce, id, comment) {
  const request = workforce.approval_queue.find((req) => req.id === id);

  const nextWorkforce = {
    ...workforce,
    approval_queue: workforce.approval_queue.map((req) => {
      if (req.id !== id) {
        return req;
      }

      return {
        ...req,
        status: "Sent Back",
        current_approver: "Hiring Manager",
        timeline: [
          ...req.timeline,
          {
            step: "Sent Back",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ],
        history: [
          ...req.history,
          {
            action: "Sent Back",
            actor: "Current User",
            date: new Date().toISOString(),
            comment: comment || null
          }
        ]
      };
    }),
    budget_requests: workforce.budget_requests.map((req) =>
      req.id === id ? { ...req, status: "Sent Back" } : req
    )
  };

  return {
    workforce: nextWorkforce,
    request,
    toastMessage: "Budget request sent back to hiring manager."
  };
}

async function sendBackBudgetRequest(workforce, id, comment) {
  if (!isLiveMode()) {
    return sendBackBudgetRequestLocal(workforce, id, comment);
  }

  const result = await workforcePlanningClient.sendBackBudgetRequest(id, comment);
  return {
    workforce: result.workforce,
    request: result.request,
    toastMessage: result.toastMessage
  };
}

function createRequisitionLocal(workforce, hiringProcess, positionId) {
  const position = workforce.approved_positions.find((item) => item.id === positionId);

  if (!position) {
    return null;
  }

  const requisitionId = `REQ-2026-${1188 + workforce.approved_positions.indexOf(position)}`;

  const nextWorkforce = {
    ...workforce,
    approved_positions: workforce.approved_positions.map((item) =>
      item.id === positionId
        ? { ...item, requisitions_created: item.requisitions_created + 1 }
        : item
    )
  };

  const nextHiringProcess = {
    ...hiringProcess,
    linkedPositionId: positionId,
    linkedRequisitionId: requisitionId,
    meta: {
      ...hiringProcess.meta,
      requisition_id: requisitionId,
      position_title: position.position,
      department: position.department
    }
  };

  return {
    workforce: nextWorkforce,
    hiringProcess: nextHiringProcess,
    position,
    requisitionId,
    toastMessage: `Requisition ${requisitionId} created from ${positionId}.`
  };
}

async function createRequisition(workforce, hiringProcess, positionId) {
  if (!isLiveMode()) {
    return createRequisitionLocal(workforce, hiringProcess, positionId);
  }

  const result = await workforcePlanningClient.createRequisition(positionId);
  const hiringProcessUpdate = result.hiringProcessUpdate || {};

  return {
    workforce: result.workforce,
    hiringProcess: {
      ...hiringProcess,
      linkedPositionId: hiringProcessUpdate.linkedPositionId || positionId,
      linkedRequisitionId: hiringProcessUpdate.linkedRequisitionId || result.requisitionId,
      meta: {
        ...hiringProcess.meta,
        ...(hiringProcessUpdate.meta || {})
      }
    },
    position: result.position,
    requisitionId: result.requisitionId,
    toastMessage: result.toastMessage
  };
}

const workforcePlanningRepository = {
  getInitialState,
  getDefaultSelectedRequestId,
  getAll,
  getById,
  approveBudgetRequest,
  rejectBudgetRequest,
  sendBackBudgetRequest,
  createRequisition
};

export default workforcePlanningRepository;
