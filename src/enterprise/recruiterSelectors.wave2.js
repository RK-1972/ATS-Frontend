const PIPELINE_STAGES = [
  "Applied",
  "Screening",
  "L1 Interview",
  "L2 Interview",
  "Client Interview",
  "Offer",
  "Joined"
];

const SAVED_VIEWS_KEY = "optalynx.recruiter.savedViews";

function normalizeStage(stageName = "") {
  const normalized = stageName.trim().toLowerCase();

  if (/applied/.test(normalized)) return "Applied";
  if (/screen/.test(normalized)) return "Screening";
  if (/l1|level 1|technical/.test(normalized)) return "L1 Interview";
  if (/l2|level 2/.test(normalized)) return "L2 Interview";
  if (/client/.test(normalized)) return "Client Interview";
  if (/offer/.test(normalized)) return "Offer";
  if (/join/.test(normalized)) return "Joined";

  return stageName || "Applied";
}

function matchesSearch(haystackParts, search) {
  if (!search) return true;
  const haystack = haystackParts.filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(search);
}

function mapAuditEvent(event) {
  return {
    id: event.id || event.correlationId,
    title: event.action || event.eventType,
    subtitle: [event.entity, event.entityId].filter(Boolean).join(" · "),
    timestamp: event.timestamp
      ? new Date(event.timestamp).toLocaleString()
      : event.created_on
        ? new Date(event.created_on).toLocaleString()
        : null,
    module: event.module,
    entityId: event.entityId,
    entity: event.entity
  };
}

export function loadSavedViews() {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(views) {
  localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
}

export function buildRecruiterAIInsights({
  pipeline,
  recruiterTasks,
  interviewsToday
}) {
  const insights = [];

  const overdueTasks = recruiterTasks.filter((task) => {
    if (!task.dueAt && !task.due_at) return false;
    return new Date(task.dueAt || task.due_at) < new Date();
  });

  if (overdueTasks.length > 0) {
    insights.push({
      id: "overdue-tasks",
      title: `${overdueTasks.length} overdue action${overdueTasks.length > 1 ? "s" : ""}`,
      description: "Review pending tasks that have passed their due date."
    });
  }

  if (interviewsToday.length > 0) {
    insights.push({
      id: "interviews-today",
      title: `${interviewsToday.length} interview${interviewsToday.length > 1 ? "s" : ""} scheduled today`,
      description: "Confirm panel availability and candidate readiness."
    });
  }

  const appliedCount = pipeline.filter(
    (row) => normalizeStage(row.stage_name) === "Applied"
  ).length;

  if (appliedCount >= 3) {
    insights.push({
      id: "applied-backlog",
      title: `${appliedCount} candidates in Applied stage`,
      description: "Consider advancing screened candidates to reduce pipeline backlog."
    });
  }

  const screeningCount = pipeline.filter(
    (row) => normalizeStage(row.stage_name) === "Screening"
  ).length;

  if (screeningCount > 0 && recruiterTasks.length > 5) {
    insights.push({
      id: "high-task-load",
      title: "High task volume detected",
      description: `${recruiterTasks.length} pending actions alongside active screening work.`
    });
  }

  return insights.slice(0, 4);
}

export function buildEntityTasks(tasks, { requisitionCode, candidateMapId } = {}) {
  if (!requisitionCode && !candidateMapId) {
    return [];
  }

  return tasks.filter((task) => {
    const objectId = String(task.businessObjectId || task.business_object_id || "");
    const metadata = task.metadata || {};

    if (requisitionCode && objectId === String(requisitionCode)) {
      return true;
    }

    if (candidateMapId && (
      objectId === String(candidateMapId)
      || metadata.mapId === candidateMapId
      || metadata.mapping_id === candidateMapId
    )) {
      return true;
    }

    return false;
  });
}

export function buildEntityAuditEvents(auditEvents, { requisitionCode, candidateMapId } = {}) {
  const events = Array.isArray(auditEvents) ? auditEvents : auditEvents?.events || [];

  if (!requisitionCode && !candidateMapId) {
    return [];
  }

  return events
    .filter((event) => {
      const entityId = String(event.entityId || "");
      if (requisitionCode && entityId === String(requisitionCode)) {
        return true;
      }
      if (candidateMapId && entityId === String(candidateMapId)) {
        return true;
      }
      return false;
    })
    .slice(0, 20)
    .map(mapAuditEvent);
}

export function buildRecruiterWorkspaceData({
  recruitment,
  taskInbox,
  interviews,
  auditEvents,
  filter = "",
  statusFilter = "all",
  stageFilter = "all",
  kpiFilter = null
}) {
  const requisitions = recruitment?.requisitions || [];
  const pipeline = recruitment?.pipeline || [];
  const tasks = taskInbox?.tasks || [];
  const interviewList = interviews?.interviews || [];

  const search = filter.trim().toLowerCase();

  let filteredRequisitions = requisitions.filter((req) => {
    if (!matchesSearch([
      req.requisition_code,
      req.position_title,
      req.department,
      req.location,
      req.hiring_manager
    ], search)) {
      return false;
    }

    if (statusFilter !== "all" && req.req_status !== statusFilter) {
      return false;
    }

    if (kpiFilter === "requisitions") {
      return true;
    }

    return true;
  });

  let filteredPipeline = pipeline.filter((row) => {
    if (!matchesSearch([
      row.candidate_code,
      row.requisition_code,
      row.stage_name
    ], search)) {
      return false;
    }

    const stage = normalizeStage(row.stage_name);

    if (stageFilter !== "all" && stage !== stageFilter) {
      return false;
    }

    if (kpiFilter && PIPELINE_STAGES.includes(kpiFilter)) {
      return stage === kpiFilter;
    }

    if (kpiFilter === "candidates") {
      return true;
    }

    return true;
  });

  if (kpiFilter === "requisitions") {
    filteredPipeline = [];
  }

  if (kpiFilter === "candidates") {
    filteredRequisitions = [];
  }

  const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {});

  pipeline.forEach((row) => {
    const stage = normalizeStage(row.stage_name);
    if (stageCounts[stage] !== undefined) {
      stageCounts[stage] += 1;
    }
  });

  const today = new Date().toISOString().slice(0, 10);

  const interviewsToday = interviewList.filter((row) => {
    const date = row.interview_date || row.interviewDate;
    return date === today;
  });

  const recruiterTasks = tasks.filter((task) => task.status === "Pending");

  const executiveMetrics = [
    {
      key: "candidates",
      label: "My Candidates",
      value: pipeline.length,
      highlight: true
    },
    {
      key: "requisitions",
      label: "My Requisitions",
      value: requisitions.length
    },
    {
      key: "interviews",
      label: "Interviews Today",
      value: interviewsToday.length
    },
    {
      key: "tasks",
      label: "Pending Actions",
      value: recruiterTasks.length
    }
  ];

  const pipelineMetrics = PIPELINE_STAGES.map((stage) => ({
    key: stage,
    label: stage,
    value: stageCounts[stage]
  }));

  const activityEvents = (Array.isArray(auditEvents) ? auditEvents : auditEvents?.events || [])
    .filter((event) => /recruitment|interview|candidate|requisition|stage/i.test(
      `${event.module || ""} ${event.action || ""} ${event.entity || ""}`
    ))
    .slice(0, 12)
    .map(mapAuditEvent);

  const aiInsights = buildRecruiterAIInsights({
    pipeline,
    recruiterTasks,
    interviewsToday
  });

  const statusOptions = [...new Set(requisitions.map((req) => req.req_status).filter(Boolean))];

  return {
    executiveMetrics,
    pipelineMetrics,
    requisitions: filteredRequisitions,
    pipeline: filteredPipeline,
    tasks: recruiterTasks,
    interviewsToday,
    activityEvents,
    aiInsights,
    statusOptions,
    pipelineStages: PIPELINE_STAGES,
    summary: {
      openRequisitions: requisitions.filter((req) =>
        /open|approved|pending/i.test(req.req_status || "")
      ).length,
      activeCandidates: pipeline.length,
      pendingTasks: recruiterTasks.length
    }
  };
}

export { PIPELINE_STAGES, normalizeStage, SAVED_VIEWS_KEY };

export default buildRecruiterWorkspaceData;
