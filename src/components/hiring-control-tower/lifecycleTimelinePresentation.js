import {
  formatOptalynxDate,
  formatOptalynxDateTime
} from "@/utils/formatDateTime";

const SOURCE_LABELS = {
  "wp_budget_requests.submitted_on": "Budget request",
  "wp_budget_requests.status": "Budget workflow",
  "wp_budget_requests": "Budget request",
  "wp_approved_positions": "Approved position catalogue",
  "rm_requisitions.created_on": "Requisition record",
  "rm_requisitions.requestor_submitted_on": "Requisition submission",
  "rm_requisitions.req_status": "Requisition approval",
  "rm_recruiter_assignments": "Recruiter assignment",
  "rm_candidate_mappings": "Candidate pipeline",
  "rm_candidate_mappings.stage_name": "Candidate pipeline stage",
  "im_interviews": "Interview records",
  "om_offers.offer_status": "Offer management",
  "om_offer_acceptance": "Offer acceptance",
  "om_offer_acceptance.accepted_on": "Offer acceptance",
  "wf_instances.started_on": "Workflow",
  "wf_history": "Workflow history"
};

function formatDateTime(value) {
  if (!value) {
    return null;
  }

  return formatOptalynxDateTime(value);
}

function formatShortDate(value) {
  if (!value) {
    return null;
  }

  const formatted = formatOptalynxDate(value);
  return formatted === "—" ? null : formatted;
}

function translateSource(source) {
  if (!source) {
    return "Not available";
  }

  const normalized = String(source).trim();

  if (SOURCE_LABELS[normalized]) {
    return SOURCE_LABELS[normalized];
  }

  if (/budget/i.test(normalized)) {
    return "Budget workflow";
  }

  if (/requisition/i.test(normalized)) {
    return "Requisition workflow";
  }

  if (/recruiter/i.test(normalized)) {
    return "Recruiter assignment";
  }

  if (/candidate|pipeline|mapping/i.test(normalized)) {
    return "Candidate pipeline";
  }

  if (/interview/i.test(normalized)) {
    return "Interview records";
  }

  if (/offer/i.test(normalized)) {
    return "Offer management";
  }

  if (/wf_|workflow/i.test(normalized)) {
    return "Workflow";
  }

  return "System records";
}

function formatStageSummary(stageSummary) {
  if (!stageSummary || typeof stageSummary !== "object") {
    return null;
  }

  const entries = Object.entries(stageSummary);

  if (!entries.length) {
    return null;
  }

  return entries.map(([stage, count]) => `${stage} (${count})`).join(", ");
}

function getMilestoneKeyLine(stage, summary = {}) {
  const { status, timestamp, key } = stage;

  if (status === "Completed" && timestamp) {
    return formatShortDate(timestamp);
  }

  if (key === "recruiter_assigned" && summary.recruiterCount > 0) {
    const count = summary.recruiterCount;
    return count === 1 ? "1 recruiter assigned" : `${count} recruiters assigned`;
  }

  if (key === "candidate_pipeline" && summary.activeCandidateCount > 0) {
    const count = summary.activeCandidateCount;
    return count === 1 ? "1 active candidate" : `${count} active candidates`;
  }

  if (key === "interview_progress" && summary.interviewCount > 0) {
    return `${summary.interviewCount} interview${summary.interviewCount === 1 ? "" : "s"}`;
  }

  if (key === "offer_progress" && summary.offerCount > 0) {
    const statusLabel = summary.primaryOffer?.offer_status;
    return statusLabel ? `${summary.offerCount} offer · ${statusLabel}` : `${summary.offerCount} offer${summary.offerCount === 1 ? "" : "s"}`;
  }

  if (key === "hire_outcome" && status === "Completed") {
    return "Offer accepted";
  }

  if (status === "In Progress") {
    return "In progress";
  }

  if (status === "Blocked") {
    return "Needs attention";
  }

  if (status === "Not Applicable") {
    return "Not applicable";
  }

  if (status === "Not Started") {
    return "Not started";
  }

  return status;
}

function buildDetailRows(stage, summary = {}, metadata = {}) {
  const rows = [
    { label: "Status", value: stage.status }
  ];

  const dateLabel = stage.status === "Completed"
    ? "Date"
    : stage.timestamp
      ? "Last updated"
      : "Date";

  if (stage.timestamp) {
    rows.push({ label: dateLabel, value: formatDateTime(stage.timestamp) });
  } else if (
    stage.key === "requisition_submitted"
    && stage.status === "Not Started"
  ) {
    rows.push({
      label: "Submission date",
      value: "Submission signal not recorded"
    });
  }

  if (stage.sla) {
    rows.push({ label: "SLA", value: stage.sla });
  } else if (stage.dueAt) {
    rows.push({ label: "Due date", value: formatDateTime(stage.dueAt) });
  } else {
    rows.push({ label: "SLA", value: "Not available" });
  }

  rows.push({ label: "Source", value: translateSource(stage.source) });

  if (stage.key === "recruiter_assigned") {
    if (summary.recruiterCount > 0) {
      rows.push({
        label: "Recruiters",
        value: String(summary.recruiterCount)
      });
    }

    if (summary.assignedRecruiters?.length) {
      rows.push({
        label: "Assigned",
        value: summary.assignedRecruiters.join(", ")
      });
    }
  }

  if (stage.key === "candidate_pipeline") {
    if (typeof summary.activeCandidateCount === "number") {
      rows.push({
        label: "Active candidates",
        value: String(summary.activeCandidateCount)
      });
    }

    const stageText = formatStageSummary(summary.candidateStageSummary);

    if (stageText) {
      rows.push({ label: "Stage summary", value: stageText });
    }
  }

  if (stage.key === "interview_progress") {
    if (typeof summary.interviewCount === "number") {
      rows.push({ label: "Total interviews", value: String(summary.interviewCount) });
    }

    if (typeof summary.scheduledInterviewCount === "number") {
      rows.push({ label: "Scheduled", value: String(summary.scheduledInterviewCount) });
    }

    if (typeof summary.completedInterviewCount === "number") {
      rows.push({ label: "Completed", value: String(summary.completedInterviewCount) });
    }

    if (typeof summary.feedbackPendingCount === "number") {
      rows.push({ label: "Feedback pending", value: String(summary.feedbackPendingCount) });
    }
  }

  if (stage.key === "offer_progress") {
    if (typeof summary.offerCount === "number") {
      rows.push({ label: "Offers", value: String(summary.offerCount) });
    }

    if (summary.primaryOffer?.offer_status) {
      rows.push({
        label: "Primary offer status",
        value: summary.primaryOffer.offer_status
      });
    }

    if (summary.primaryOffer?.offer_id) {
      rows.push({
        label: "Primary offer",
        value: summary.primaryOffer.offer_id
      });
    }
  }

  if (stage.key === "hire_outcome") {
    if (stage.status === "Completed") {
      rows.push({ label: "Outcome", value: "Offer accepted" });
    }

    if (metadata.joinedSignalFragile) {
      rows.push({
        label: "Note",
        value: "Joined status is derived from pipeline stage text and may not be formally recorded."
      });
    }
  }

  if (stage.reason) {
    rows.push({ label: "Details", value: stage.reason });
  }

  return rows;
}

const STATUS_DISPLAY = {
  Completed: { label: "Completed", color: "success", variant: "filled" },
  "In Progress": { label: "In Progress", color: "primary", variant: "outlined" },
  "Not Started": { label: "Not Started", color: "default", variant: "outlined" },
  Blocked: { label: "Blocked", color: "error", variant: "outlined" },
  "Not Applicable": { label: "Not Applicable", color: "default", variant: "outlined" },
  Pending: { label: "Waiting", color: "default", variant: "outlined" },
  "Waiting for Clarification": { label: "Clarification", color: "warning", variant: "outlined" },
  "Clarification Submitted": { label: "Clarification", color: "info", variant: "outlined" },
  Rejected: { label: "Rejected", color: "error", variant: "outlined" }
};

function mapDisplayStatus(status) {
  return STATUS_DISPLAY[status] ?? {
    label: status || "Unknown",
    color: "default",
    variant: "outlined"
  };
}

export {
  formatDateTime,
  formatShortDate,
  translateSource,
  getMilestoneKeyLine,
  buildDetailRows,
  mapDisplayStatus
};
