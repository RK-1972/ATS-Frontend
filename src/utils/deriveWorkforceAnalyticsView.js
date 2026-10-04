import { deriveWorkforceDashboardView } from "./deriveWorkforceDashboardView";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

function buildDepartmentUtilization(approvedPositions = []) {
  const byDepartment = new Map();

  for (const position of approvedPositions) {
    const department = String(position.department || "Unassigned").trim() || "Unassigned";
    const current = byDepartment.get(department) || {
      approved: 0,
      utilized: 0
    };

    current.approved += Number(position.budget_approved || 0);
    current.utilized += Number(position.budget_consumed || 0);
    byDepartment.set(department, current);
  }

  return [...byDepartment.entries()]
    .map(([department, totals]) => {
      const approved = totals.approved;
      const utilized = totals.utilized;
      const pct =
        approved > 0 ? Math.round((utilized / approved) * 100) : 0;

      return {
        department,
        approved,
        utilized,
        pct
      };
    })
    .sort((left, right) => right.approved - left.approved);
}

function parseSubmittedDate(request) {
  const raw = request?.submitted_on || request?.submitted_at || null;

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isApprovedBudgetRequestStatus(status) {
  return /approved/i.test(String(status || ""));
}

function buildMonthlyTrendFromBudgetRequests(budgetRequests = []) {
  const buckets = new Map();

  for (const request of budgetRequests) {
    const submittedAt = parseSubmittedDate(request);

    if (!submittedAt) {
      continue;
    }

    const bucketKey = `${submittedAt.getFullYear()}-${submittedAt.getMonth()}`;
    const bucket = buckets.get(bucketKey) || {
      sortKey: submittedAt.getFullYear() * 12 + submittedAt.getMonth(),
      month: MONTH_LABELS[submittedAt.getMonth()],
      budget: 0,
      actual: 0
    };

    const proposed = Number(request.proposed_budget || 0);
    bucket.budget += proposed;

    if (isApprovedBudgetRequestStatus(request.status)) {
      bucket.actual += proposed;
    }

    buckets.set(bucketKey, bucket);
  }

  return [...buckets.values()]
    .sort((left, right) => left.sortKey - right.sortKey)
    .slice(-6)
    .map(({ month, budget, actual }) => ({
      month,
      budget,
      actual
    }));
}

function collectTimelineEntries(item) {
  const timeline = Array.isArray(item?.timeline) ? item.timeline : [];
  const history = Array.isArray(item?.history) ? item.history : [];

  return [...timeline, ...history];
}

function resolveTimelineDate(entry) {
  const raw = entry?.date || entry?.recorded_on || entry?.timestamp || null;

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function computeApprovalSlaDays(approvalQueue = [], budgetRequests = []) {
  const durations = [];
  const items = [...approvalQueue, ...budgetRequests];

  for (const item of items) {
    const entries = collectTimelineEntries(item);
    const submittedEntry = entries.find((entry) =>
      /submitted/i.test(String(entry.step || entry.action || ""))
    );
    const approvedEntry = entries.find((entry) =>
      /approved/i.test(String(entry.step || entry.action || ""))
    );

    const submittedAt = resolveTimelineDate(submittedEntry);
    const approvedAt = resolveTimelineDate(approvedEntry);

    if (!submittedAt || !approvedAt) {
      continue;
    }

    const days = (approvedAt.getTime() - submittedAt.getTime()) / 86400000;

    if (days >= 0) {
      durations.push(days);
    }
  }

  if (!durations.length) {
    return 0;
  }

  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;

  return Math.round(average * 10) / 10;
}

function sumPendingPipelineBudget(approvalQueue = []) {
  return (approvalQueue || [])
    .filter((item) => /pending/i.test(String(item.status || "")))
    .reduce((sum, item) => sum + Number(item.proposed_budget || 0), 0);
}

function sumPositiveExceptionVariance(budgetExceptions = []) {
  return (budgetExceptions || []).reduce(
    (sum, exception) => sum + Math.max(0, Number(exception.variance_amount || 0)),
    0
  );
}

/**
 * @param {object} workforce Full workforce planning bundle
 * @returns {object} Analytics view model for WorkforceAnalyticsPage
 */
export function deriveWorkforceAnalyticsView(workforce) {
  const base = workforce?.analytics || {};
  const dashboard = deriveWorkforceDashboardView(workforce);

  const approved = Number(dashboard.total_approved_budget || 0);
  const actual = Number(dashboard.budget_consumed || 0);
  const pendingPipeline = sumPendingPipelineBudget(workforce?.approval_queue);
  const forecast = actual + pendingPipeline;
  const savings = Math.max(0, approved - actual);
  const overspend = sumPositiveExceptionVariance(workforce?.budget_exceptions);

  const departmentUtilization = buildDepartmentUtilization(
    workforce?.approved_positions
  );
  const monthlyTrend = buildMonthlyTrendFromBudgetRequests(
    workforce?.budget_requests
  );
  const approvalSlaDays = computeApprovalSlaDays(
    workforce?.approval_queue,
    workforce?.budget_requests
  );

  return {
    ...base,
    budget_vs_actual: {
      approved,
      actual,
      forecast
    },
    savings,
    overspend,
    approval_sla_days: approvalSlaDays,
    department_utilization: departmentUtilization.length
      ? departmentUtilization
      : base.department_utilization || [],
    monthly_trend: monthlyTrend.length ? monthlyTrend : base.monthly_trend || []
  };
}

export default deriveWorkforceAnalyticsView;
