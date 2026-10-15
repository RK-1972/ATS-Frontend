/** Client-side list filter helpers for Workforce Planning section pages. */

export const WORKFORCE_PLANNING_RESULTS_SCROLL_SX = {
  maxHeight: {
    xs: "min(70vh, 640px)",
    md: "min(calc(100vh - 280px), 720px)"
  },
  overflowY: "auto",
  overflowX: "hidden",
  pr: 0.5
};

export const WORKFORCE_PLANNING_QUEUE_SCROLL_SX = {
  maxHeight: {
    xs: "min(50vh, 480px)",
    lg: "min(calc(100vh - 240px), 720px)"
  },
  overflowY: "auto",
  overflowX: "hidden",
  pr: 0.5
};

export const BUDGET_REQUEST_SEARCH_FIELDS = [
  "id",
  "position",
  "department",
  "grade",
  "submitted_by",
  "status"
];

export const APPROVED_POSITION_SEARCH_FIELDS = [
  "id",
  "position",
  "department",
  "grade",
  "status",
  "source_request_id"
];

export const BUDGET_EXCEPTION_SEARCH_FIELDS = [
  "id",
  "candidate_name",
  "position",
  "department",
  "req_code",
  "workflow_status",
  "approver",
  "comments"
];

export function normalizeWorkforceSearchQuery(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function filterItemsBySearch(items, fields, searchQuery) {
  const normalizedQuery = normalizeWorkforceSearchQuery(searchQuery);

  if (!normalizedQuery) {
    return items ?? [];
  }

  return (items ?? []).filter((item) =>
    fields.some((field) =>
      String(item?.[field] ?? "")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  );
}
