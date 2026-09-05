/**
 * Optalynx semantic visualization tokens — centralized chart styling.
 */

export const REPORT_CHART_COLORS = [
  "#1f3b63",
  "#f39c12",
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#ca8a04"
];

export const REPORT_CHART_THEME = {
  primary: "#1f3b63",
  secondary: "#f39c12",
  neutral: "#64748b",
  positive: "#0f766e",
  warning: "#f39c12",
  critical: "#dc2626",
  grid: "rgba(15, 23, 42, 0.08)",
  axis: "#64748b"
};

export const STAGE_DIMENSION_ORDER = [
  "Applied",
  "Screening",
  "L1 Interview",
  "L2 Interview",
  "Client Interview",
  "Offer",
  "Joined"
];

export function sortRowsByStageOrder(rows, categoryField) {
  const orderMap = new Map(STAGE_DIMENSION_ORDER.map((stage, index) => [stage, index]));

  return [...rows].sort((left, right) => {
    const leftIndex = orderMap.get(String(left[categoryField] ?? "")) ?? 999;
    const rightIndex = orderMap.get(String(right[categoryField] ?? "")) ?? 999;
    return leftIndex - rightIndex;
  });
}

export function formatCategoryLabel(value, dataType) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (dataType === "date") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    }
  }

  return String(value);
}

export function formatMeasureValue(value) {
  if (value === null || value === undefined) {
    return "0";
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString();
  }

  return String(value);
}
