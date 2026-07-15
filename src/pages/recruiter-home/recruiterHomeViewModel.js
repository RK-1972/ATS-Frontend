import { PIPELINE_STAGES, normalizeStage } from "@/enterprise/recruiterSelectors";
import { getAttentionItemMeta, priorityLabelFromScore } from "@/components/recruiter-home/recruiterHomeUiHelpers";
import { formatRangeLabel } from "./recruiterHomeDateFilter";

const STAGE_PRIORITY = {
  Offer: 100,
  "Client Interview": 85,
  "L2 Interview": 70,
  "L1 Interview": 55,
  Screening: 35,
  Applied: 15,
  Joined: 0
};

const LIFECYCLE_STAGES = ["Sourcing", "Screening", "Interviewing", "Offer", "Filled"];

const ACTION_TYPE_PRIORITY = {
  "Candidate overdue": 95,
  "Offer approval": 90,
  "Interview today": 80,
  "Interview feedback": 65,
  "Schedule interview": 60
};

function formatInterviewDateLabel(row) {
  const date = row.interview_date || row.interviewDate;
  const time = row.interview_time || row.interviewTime;
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const formatted = d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return time ? `${formatted} · ${time}` : formatted;
}

function isOpenRequisition(req) {
  return /open|pending|approved/i.test(String(req.req_status || req.status || ""));
}

function findPipelineRow(pipeline, nameOrCode) {
  const key = String(nameOrCode || "").toLowerCase();
  return pipeline.find((row) =>
    String(row.candidate_name || "").toLowerCase() === key
    || String(row.candidate_code || "").toLowerCase() === key
  );
}

function findRequisition(requisitions, code) {
  return requisitions.find((r) => r.requisition_code === code) || null;
}

function resolveSlaStatus({ escalated, dueAt }) {
  if (escalated) {
    return { badge: "SLA BREACH", tone: "error", detail: "Escalated" };
  }
  if (!dueAt) {
    return { badge: "IN PROGRESS", tone: "info", detail: "Pending" };
  }
  const due = new Date(dueAt);
  const now = new Date();
  const hoursLeft = (due - now) / (1000 * 60 * 60);
  if (hoursLeft < 0) {
    const hoursOver = Math.abs(Math.round(hoursLeft));
    return { badge: "SLA BREACH", tone: "error", detail: `Delayed by ${hoursOver}h` };
  }
  if (hoursLeft <= 24) {
    return { badge: "AT RISK", tone: "warning", detail: `Due in ${Math.max(1, Math.round(hoursLeft))}h` };
  }
  if (hoursLeft <= 48) {
    return { badge: "HIGH PRIORITY", tone: "orange", detail: `Due in ${Math.round(hoursLeft / 24)}d` };
  }
  return { badge: "IN PROGRESS", tone: "info", detail: `Due in ${Math.round(hoursLeft / 24)}d` };
}

function mapDisplayStatus(status, risk) {
  const lower = String(status || "").toLowerCase();
  if (lower.includes("hold") || lower.includes("pause")) return "ON HOLD";
  if (risk === "High" || lower.includes("urgent")) return "URGENT";
  if (lower.includes("open") || lower.includes("approved") || lower.includes("pending")) return "ACTIVE";
  if (lower.includes("offer")) return "ACTIVE";
  return String(status || "ACTIVE").toUpperCase();
}

function deriveLifecycleStage(pipelineForReq) {
  if (!pipelineForReq.length) return "Sourcing";
  let maxScore = -1;
  let stage = "Sourcing";
  pipelineForReq.forEach((row) => {
    const normalized = normalizeStage(row.stage_name);
    let score = 0;
    if (normalized === "Joined") { score = 5; stage = "Filled"; }
    else if (normalized === "Offer") { score = 4; stage = "Offer"; }
    else if (normalized.includes("Interview")) { score = 3; stage = "Interviewing"; }
    else if (normalized === "Screening") { score = 2; stage = "Screening"; }
    else if (normalized === "Applied") { score = 1; stage = "Sourcing"; }
    if (score > maxScore) {
      maxScore = score;
      if (score === 5) stage = "Filled";
      else if (score === 4) stage = "Offer";
      else if (score === 3) stage = "Interviewing";
      else if (score === 2) stage = "Screening";
      else stage = "Sourcing";
    }
  });
  return stage;
}

function computeReqNextAction({ openPositions, candidateCount, pendingInterviews, pipeline, code }) {
  if (pendingInterviews > 0) {
    return `Collect ${pendingInterviews} pending interview feedback`;
  }
  const reqCandidates = pipeline.filter((row) => row.requisition_code === code);
  const offerCount = reqCandidates.filter((row) => normalizeStage(row.stage_name) === "Offer").length;
  if (offerCount > 0) return `Process ${offerCount} offer${offerCount === 1 ? "" : "s"}`;
  const interviewStages = reqCandidates.filter((row) => normalizeStage(row.stage_name).includes("Interview")).length;
  if (interviewStages > 0) return `Monitor ${interviewStages} active interview${interviewStages === 1 ? "" : "s"}`;
  if (openPositions > 0 && candidateCount === 0) return "Source candidates for open headcount";
  if (openPositions > 0) return "Advance candidates through pipeline";
  return "Headcount filled — monitor joiners";
}

function computeRisk({ critical, openPositions, pendingInterviews, progress, status }) {
  const statusLower = String(status || "").toLowerCase();
  if (statusLower.includes("hold") || statusLower.includes("cancel")) return "Low";
  if (critical || pendingInterviews >= 3 || (openPositions > 0 && progress === 0)) return "High";
  if (pendingInterviews > 0 || openPositions > 1) return "Medium";
  return "Low";
}

function mapPipelineRow(row) {
  const stage = normalizeStage(row.stage_name);
  return {
    id: row.mapping_id || row.map_id || row.candidate_code,
    name: row.candidate_name || row.candidate_code || "Candidate",
    code: row.candidate_code || "",
    requisition: row.requisition_code || "—",
    stage,
    route: "/candidates"
  };
}

function buildRoleSubtitle(req) {
  if (!req) return "";
  const parts = [
    req.department || req.approved_department,
    req.grade,
    req.location || req.employment_type
  ].filter(Boolean);
  return parts.join(" · ");
}

function enrichCandidateContext(candidate, pipeline, requisitions, interviewList, tasks) {
  if (!candidate) return null;
  const pipelineRow = pipeline.find((row) =>
    (row.mapping_id || row.map_id || row.candidate_code) === candidate.id
    || row.candidate_code === candidate.code
    || row.candidate_name === candidate.name
  );
  const reqCode = candidate.requisition || candidate.detail;
  const req = findRequisition(requisitions, reqCode);
  const reqTitle = req?.position_title || req?.approved_position_title || "";
  const interviewRow = interviewList.find((row) =>
    (row.candidate_name || row.candidateName) === candidate.name
    || (row.requisition_code || row.requisitionCode) === reqCode
  );
  const relatedTask = tasks.find((t) =>
    t.title?.includes(candidate.name)
    || t.businessObjectId === reqCode
  );
  const sla = relatedTask
    ? resolveSlaStatus({ escalated: relatedTask.escalated, dueAt: relatedTask.dueAt })
    : null;

  return {
    ...candidate,
    code: candidate.code || pipelineRow?.candidate_code || "",
    stage: candidate.stage || candidate.context,
    requisitionLabel: reqTitle ? `${reqCode} · ${reqTitle}` : reqCode,
    inspectorSubtitle: `${reqTitle || reqCode}${req?.grade ? ` · ${req.grade}` : ""}`,
    hiringManager: req?.hiring_manager || "—",
    interviewer: interviewRow?.interviewer_name || interviewRow?.interviewerName || interviewRow?.interviewer || "—",
    interviewDateLabel: interviewRow ? formatInterviewDateLabel(interviewRow) : "—",
    nextStep: computeReqNextAction({
      openPositions: 0,
      candidateCount: 1,
      pendingInterviews: 0,
      pipeline,
      code: reqCode
    }),
    slaStatus: sla?.badge || "—",
    slaTone: sla?.tone || "info"
  };
}

function enrichActionItem(item, pipeline, requisitions, interviewList, tasks) {
  const meta = getAttentionItemMeta(item.type);
  const pipelineRow = findPipelineRow(pipeline, item.title);
  const reqCode = item.detail || pipelineRow?.requisition_code;
  const req = findRequisition(requisitions, reqCode);
  const stageLabel = pipelineRow ? normalizeStage(pipelineRow.stage_name) : null;
  const roleLine = req
    ? [req.position_title || req.approved_position_title, req.grade, item.title].filter(Boolean).join(" · ")
    : item.title;

  let sla = { badge: meta.slaBadge || "IN PROGRESS", tone: meta.slaTone || "info", detail: item.timeLabel || "Pending" };
  if (item.taskId) {
    const task = tasks.find((t) => (t.taskId || t.task_id) === item.taskId);
    if (task) sla = resolveSlaStatus({ escalated: task.escalated, dueAt: task.dueAt });
  } else if (item.type === "Interview feedback") {
    sla = { badge: "IN PROGRESS", tone: "info", detail: "Awaiting feedback" };
  } else if (item.type === "Offer approval") {
    sla = { badge: "HIGH PRIORITY", tone: "orange", detail: "Offer pending" };
  } else if (item.type === "Interview today") {
    sla = { badge: "IN PROGRESS", tone: "info", detail: "Today" };
  }

  return {
    ...item,
    displayType: meta.displayType,
    priorityLabel: priorityLabelFromScore(item.priority),
    roleLine,
    stageLabel,
    slaBadge: sla.badge,
    slaTone: sla.tone,
    slaDetail: sla.detail,
    isCritical: sla.badge === "SLA BREACH" || item.priority >= 85
  };
}

function buildPriorityCandidate(pipeline) {
  let best = null;
  let bestScore = -1;
  pipeline.forEach((row) => {
    const stage = normalizeStage(row.stage_name);
    const score = STAGE_PRIORITY[stage] ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = { ...mapPipelineRow(row), context: stage, detail: row.requisition_code || "", source: "pipeline" };
    }
  });
  return best;
}

function buildTopCandidatesForReq(pipeline, code, limit = 5) {
  return pipeline
    .filter((row) => row.requisition_code === code)
    .map((row) => ({
      id: row.mapping_id || row.map_id,
      name: row.candidate_name || row.candidate_code,
      code: row.candidate_code,
      stage: normalizeStage(row.stage_name),
      requisition: code,
      stageLabel: normalizeStage(row.stage_name)
    }))
    .sort((a, b) => (STAGE_PRIORITY[b.stage] || 0) - (STAGE_PRIORITY[a.stage] || 0))
    .slice(0, limit);
}

export function buildRecruiterHomeModel({
  recruitment = {},
  taskInbox = {},
  interviews = {},
  selectedStage = null,
  interviewsTodayOnly = false,
  fromDate = "",
  toDate = ""
} = {}) {
  const requisitions = (recruitment.requisitions || []).filter(isOpenRequisition);
  const activePipeline = recruitment.activePipeline || recruitment.pipeline || [];
  const offerCandidates = recruitment.offerCandidates || [];
  const tasks = (taskInbox.tasks || []).filter((t) => t.status === "Pending");
  const interviewList = interviews.interviews || [];
  const summary = recruitment.summary || {};
  const today = new Date().toISOString().slice(0, 10);
  const todayInRange = fromDate && toDate ? today >= fromDate && today <= toDate : false;
  const dateRangeLabel = fromDate && toDate ? formatRangeLabel(fromDate, toDate) : "";

  const stageCounts = summary.pipelineStageCounts || PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = 0;
    return acc;
  }, {});

  const requisitionRows = requisitions.map((req) => {
    const code = req.requisition_code;
    const periodMetrics = req.periodMetrics || {
      stageCounts: {},
      candidatesEntered: 0
    };
    const stageMetrics = periodMetrics.stageCounts || {};
    const joinedAllTime = Number(req.joinedAllTime) || 0;
    const headcount = Number(req.headcount || req.openings || req.no_of_positions || 1);
    const openPositions = Math.max(0, headcount - joinedAllTime);
    const pendingInterviews = interviewList.filter(
      (row) => (row.requisition_code || row.requisitionCode) === code
        && !row.feedback_submitted && !row.feedbackSubmitted
    ).length;
    const candidateCount = Number(periodMetrics.candidatesEntered) || 0;
    const funnelProgress = headcount > 0 ? Math.min(100, Math.round((candidateCount / headcount) * 100)) : 0;
    const fillProgress = headcount > 0 ? Math.min(100, Math.round((joinedAllTime / headcount) * 100)) : 0;
    const critical = req.priority === "High" || req.priority_level === "High";
    const status = req.req_status || "—";
    const risk = computeRisk({ critical, openPositions, pendingInterviews, progress: fillProgress, status });
    const reqActivePipeline = activePipeline.filter((row) => row.requisition_code === code);

    return {
      id: code || req.req_id,
      code,
      title: req.position_title || req.approved_position_title || "—",
      status,
      displayStatus: mapDisplayStatus(status, risk),
      department: req.department || req.approved_department || "",
      grade: req.grade || "",
      location: req.location || "",
      employmentType: req.employment_type || "",
      roleSubtitle: buildRoleSubtitle(req),
      hiringManager: req.hiring_manager || "—",
      headcount,
      filled: joinedAllTime,
      openPositions,
      candidateCount,
      stageMetrics,
      funnelCurrent: candidateCount,
      funnelTarget: headcount,
      pendingInterviews,
      progress: funnelProgress,
      fillProgress,
      critical,
      priority: critical ? "High" : risk,
      risk,
      nextAction: computeReqNextAction({ openPositions, candidateCount, pendingInterviews, pipeline: reqActivePipeline, code }),
      lifecycleStage: deriveLifecycleStage(reqActivePipeline),
      lifecycleStages: LIFECYCLE_STAGES,
      briefingNote: req.primary_skill || req.remarks || "",
      topCandidates: buildTopCandidatesForReq(activePipeline, code)
    };
  }).sort((a, b) => {
    const riskOrder = { High: 3, Medium: 2, Low: 1 };
    return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
  });

  const actionItems = [];

  if (todayInRange) {
    interviewList
      .filter((row) => (row.interview_date || row.interviewDate) === today)
      .forEach((row) => {
        actionItems.push({
          id: `intv-${row.interview_id || row.interviewId}`,
          type: "Interview today",
          title: row.candidate_name || row.candidateName || row.candidate_code || "Interview",
          detail: row.requisition_code || row.requisitionCode || "",
          route: "/interview-schedule",
          priority: ACTION_TYPE_PRIORITY["Interview today"]
        });
      });
  }

  interviewList
    .filter((row) => !row.feedback_submitted && !row.feedbackSubmitted)
    .forEach((row) => {
      actionItems.push({
        id: `fb-${row.interview_id || row.interviewId}`,
        type: "Interview feedback",
        title: row.candidate_name || row.candidateName || row.candidate_code || "Candidate",
        detail: row.requisition_code || row.requisitionCode || "",
        route: "/interview-schedule",
        priority: ACTION_TYPE_PRIORITY["Interview feedback"]
      });
    });

  offerCandidates.forEach((row) => {
    actionItems.push({
      id: `offer-${row.mapping_id || row.map_id}`,
      type: "Offer approval",
      title: row.candidate_name || row.candidate_code || "Candidate",
      detail: row.requisition_code || "",
      route: "/candidates",
      priority: ACTION_TYPE_PRIORITY["Offer approval"]
    });
  });

  tasks.forEach((task) => {
    actionItems.push({
      id: `od-${task.taskId || task.task_id}`,
      type: "Candidate overdue",
      title: task.title || "Overdue task",
      detail: task.businessObjectId || "",
      route: "/candidates",
      priority: ACTION_TYPE_PRIORITY["Candidate overdue"],
      taskId: task.taskId || task.task_id
    });
  });

  const sortedActions = actionItems
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 12);

  const visibleActions = (interviewsTodayOnly
    ? sortedActions.filter((item) => item.type === "Interview today")
    : sortedActions
  ).map((item) => enrichActionItem(item, activePipeline, requisitions, interviewList, tasks));

  const criticalCount = visibleActions.filter((a) => a.isCritical).length;

  let filteredCandidates = activePipeline.map(mapPipelineRow);
  if (selectedStage) filteredCandidates = filteredCandidates.filter((row) => row.stage === selectedStage);

  const priorityCandidate = buildPriorityCandidate(activePipeline);
  const enrichedPriorityCandidate = enrichCandidateContext(
    priorityCandidate, activePipeline, requisitions, interviewList, tasks
  );

  const openRequisitions = summary.openRequisitions ?? requisitionRows.length;

  return {
    fromDate,
    toDate,
    dateRangeLabel,
    totalCandidates: summary.activeCandidates ?? 0,
    openRequisitions,
    requisitionRows,
    actionItems: visibleActions,
    actionCount: sortedActions.length,
    criticalCount,
    priorityCandidate,
    enrichedPriorityCandidate,
    filteredCandidates,
    selectedStageCount: selectedStage ? stageCounts[selectedStage] || 0 : null,
    stageCounts,
    interviewsTodayCount: summary.interviewsInRange ?? interviewList.length,
    pendingFeedbackCount: summary.pendingFeedbackInRange
      ?? interviews.interviewSummary?.pendingFeedback
      ?? 0,
    offersInPipeline: summary.offersInRange ?? 0,
    pendingTasksCount: summary.pendingTasks ?? tasks.length
  };
}

export function enrichCandidateForInspector(candidate, recruitment, interviews, taskInbox) {
  if (!candidate) return null;
  return enrichCandidateContext(
    candidate,
    recruitment?.activePipeline || recruitment?.pipeline || [],
    recruitment?.requisitions || [],
    interviews?.interviews || [],
    taskInbox?.tasks || []
  );
}

export { LIFECYCLE_STAGES };
