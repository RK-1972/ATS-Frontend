function formatCountValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return String(value);
}

function formatHoursValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${value}h`;
}

function formatDaysValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return `${value}d`;
}

function formatWorkloadValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  return String(value);
}

function buildExecutiveKpiCards(kpiData) {
  const kpis = kpiData?.kpis || {};
  const metadata = kpiData?.metadata || {};

  const approvalCohortText = metadata.approvalTimeCohortSize != null
    ? `${metadata.approvalTimeCohortSize} completed approvals`
    : null;

  const timeToHireCohortText = metadata.timeToHireCohortSize != null
    ? `${metadata.timeToHireCohortSize} accepted offers`
    : null;

  return [
    {
      key: "activeProcesses",
      label: "Active Processes",
      value: formatCountValue(kpis.activeProcesses),
      subtitle: "Enterprise-wide",
      detailRows: [
        { label: "Definition", value: "Approved requisitions with active hiring activity." }
      ]
    },
    {
      key: "pendingApprovals",
      label: "Pending Approvals",
      value: formatCountValue(kpis.pendingApprovals),
      subtitle: "Open approval tasks",
      highlight: true,
      detailRows: [
        { label: "Definition", value: "Open approval tasks on active workflows." },
        { label: "Note", value: "Clarification holds are not counted as pending approvals." }
      ]
    },
    {
      key: "clarifications",
      label: "Clarifications",
      value: formatCountValue(kpis.clarifications),
      subtitle: "Open clarification items",
      detailRows: [
        { label: "Definition", value: "Open clarification items aggregated across supported hiring workflows." },
        { label: "Note", value: "Duplicate signals are deduplicated where possible." }
      ]
    },
    {
      key: "budgetExceptions",
      label: "Budget Exceptions",
      value: formatCountValue(kpis.budgetExceptions),
      subtitle: metadata.budgetVarianceThresholdPct != null
        ? `>${metadata.budgetVarianceThresholdPct}% variance`
        : "Live offer variance",
      detailRows: [
        { label: "Definition", value: "Offers exceeding the configured budget variance threshold." },
        {
          label: "Threshold",
          value: metadata.budgetVarianceThresholdPct != null
            ? `${metadata.budgetVarianceThresholdPct}%`
            : "Not available"
        }
      ]
    },
    {
      key: "avgApprovalTimeHours",
      label: "Avg Approval Time",
      value: formatHoursValue(kpis.avgApprovalTimeHours),
      subtitle: approvalCohortText || "Completed approvals",
      detailRows: [
        { label: "Status", value: kpis.avgApprovalTimeHours != null ? "Available" : "Not available" },
        { label: "Definition", value: "Average completed approval-task duration." },
        {
          label: "Window",
          value: metadata.approvalTimeWindowDays
            ? `Last ${metadata.approvalTimeWindowDays} days`
            : "Not available"
        },
        {
          label: "Cohort",
          value: approvalCohortText || "Not available"
        },
        {
          label: "Configured SLA",
          value: kpis.configuredApprovalSlaHours != null
            ? `${kpis.configuredApprovalSlaHours}h`
            : "Not available"
        },
        { label: "Note", value: "Configured SLA is not SLA compliance." }
      ]
    },
    {
      key: "avgTimeToHireDays",
      label: "Avg Time To Hire",
      value: formatDaysValue(kpis.avgTimeToHireDays),
      subtitle: kpis.avgTimeToHireDays != null
        ? "Accepted offers"
        : "No accepted-offer cohort",
      detailRows: [
        { label: "Status", value: kpis.avgTimeToHireDays != null ? "Available" : "Not available" },
        ...(kpis.avgTimeToHireDays == null
          ? [{ label: "Reason", value: "No valid accepted-offer cohort is currently available." }]
          : []),
        {
          label: "Window",
          value: metadata.timeToHireWindowDays
            ? `Last ${metadata.timeToHireWindowDays} days`
            : "Not available"
        },
        { label: "Cohort", value: timeToHireCohortText || "0 accepted offers" }
      ]
    },
    {
      key: "recruiterWorkload",
      label: "Recruiter Workload",
      value: formatWorkloadValue(kpis.recruiterWorkload),
      subtitle: "Candidates / recruiter",
      detailRows: [
        { label: "Status", value: kpis.recruiterWorkload != null ? "Available" : "Not available" },
        {
          label: "Active candidates",
          value: metadata.activeCandidateCount != null
            ? String(metadata.activeCandidateCount)
            : "Not available"
        },
        {
          label: "Active recruiters",
          value: metadata.recruiterCount != null
            ? String(metadata.recruiterCount)
            : "Not available"
        },
        { label: "Calculation", value: "Active candidates ÷ active recruiters" },
        {
          label: "Result",
          value: kpis.recruiterWorkload != null
            ? `${kpis.recruiterWorkload} candidates / recruiter`
            : "Not available"
        }
      ]
    }
  ];
}

export {
  buildExecutiveKpiCards,
  formatCountValue,
  formatDaysValue,
  formatHoursValue,
  formatWorkloadValue
};
