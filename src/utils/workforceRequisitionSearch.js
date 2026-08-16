export function formatWorkforceRequisitionDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

export function buildWorkforceRequisitionSearchHaystack(row) {
  const createdFormatted = formatWorkforceRequisitionDate(row.created_on);
  const modifiedFormatted = formatWorkforceRequisitionDate(row.modified_on);

  return [
    row.requisition_code,
    row.approved_position_id,
    row.position_title,
    row.department,
    row.project,
    row.client,
    row.grade,
    row.req_status,
    row.created_by,
    row.hiring_manager,
    row.workflow_comment,
    createdFormatted,
    modifiedFormatted,
    row.created_on,
    row.modified_on
  ]
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value).toLowerCase())
    .join(" ");
}

export function matchesWorkforceRequisitionSearch(row, searchTerm) {
  const term = String(searchTerm || "").trim().toLowerCase();

  if (!term) {
    return true;
  }

  return buildWorkforceRequisitionSearchHaystack(row).includes(term);
}
