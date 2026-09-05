export function formatStandardReportOperatorLabel(operator) {
  const normalized = String(operator || "equals").trim().toLowerCase();

  if (normalized === "between") {
    return "Between";
  }

  if (normalized === "equals") {
    return "Equals";
  }

  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const STANDARD_REPORT_FIXED_OPERATORS = {
  stage_name: "equals",
  department: "equals",
  assigned_recruiter_code: "equals",
  mapping_recruiter_code: "equals",
  requisition_code: "equals",
  req_status: "equals",
  hiring_manager: "equals",
  applied_on: "between"
};
