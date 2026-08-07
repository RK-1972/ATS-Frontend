export function formatApprovalSearchDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

export function buildApprovalSearchHaystack(row, formatDocumentType) {
  const submittedFormatted = formatApprovalSearchDate(row.submitted_date);
  const submittedRaw = row.submitted_date ? String(row.submitted_date) : "";

  return [
    formatDocumentType?.(row),
    row.document_type,
    row.workflow_type,
    row.document_number,
    row.document_title,
    row.requestor,
    row.current_approval_step,
    row.stage_key,
    row.status,
    row.priority,
    row.candidateName,
    row.candidate_name,
    row.requisition_code,
    row.businessUnit,
    row.business_unit,
    row.department,
    submittedFormatted,
    submittedRaw
  ]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value).toLowerCase())
    .join(" ");
}

export function matchesApprovalSearch(row, searchTerm, formatDocumentType) {
  const term = String(searchTerm || "").trim().toLowerCase();

  if (!term) {
    return true;
  }

  return buildApprovalSearchHaystack(row, formatDocumentType).includes(term);
}
