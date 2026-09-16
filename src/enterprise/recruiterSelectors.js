import { buildPipelineMetrics, getPipelineStageLabels } from "@/enterprise/atsStageCatalogUtils";

// Preserved for disabled Wave 2 paths only. Active Enterprise UI uses rm_ats_stage_catalog.
const PIPELINE_STAGES = [
  "Applied",
  "Screening",
  "L1 Interview",
  "L2 Interview",
  "Client Interview",
  "Offer",
  "Joined"
];

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

export function buildRecruiterWorkspaceData({
  recruitment,
  taskInbox,
  interviews,
  filter = "",
  catalogStages = []
}) {
  const requisitions = recruitment?.requisitions || [];
  const pipeline = recruitment?.pipeline || [];
  const tasks = taskInbox?.tasks || [];
  const interviewList = interviews?.interviews || [];
  const search = filter.trim().toLowerCase();

  const filteredRequisitions = requisitions.filter((req) =>
    matchesSearch([
      req.requisition_code,
      req.position_title,
      req.department,
      req.location,
      req.hiring_manager
    ], search)
  );

  const filteredPipeline = pipeline.filter((row) =>
    matchesSearch([
      row.candidate_code,
      row.requisition_code,
      row.stage_name
    ], search)
  );

  const pipelineStages = getPipelineStageLabels(catalogStages);
  const pipelineMetrics = buildPipelineMetrics(catalogStages, pipeline);

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

  return {
    executiveMetrics,
    pipelineMetrics,
    pipelineStages,
    requisitions: filteredRequisitions,
    pipeline: filteredPipeline,
    tasks: recruiterTasks,
    interviewsToday,
    summary: {
      openRequisitions: requisitions.filter((req) =>
        /open|approved|pending/i.test(req.req_status || "")
      ).length,
      activeCandidates: pipeline.length,
      pendingTasks: recruiterTasks.length
    }
  };
}

export { PIPELINE_STAGES, normalizeStage };

export default buildRecruiterWorkspaceData;
