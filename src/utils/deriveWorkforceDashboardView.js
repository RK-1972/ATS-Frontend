/**
 * Derive Workforce Dashboard KPIs and lists from authoritative bundle arrays
 * (approved_positions, budget_exceptions, approval_queue) instead of static
 * dashboard.* literals in the seed/mock payload.
 */

function countFilledHeadcount(position) {
  const headcount = Number(position?.headcount || 0);
  const requisitionsCreated = Number(position?.requisitions_created || 0);

  if (String(position?.status || "") === "Fully Utilized") {
    return headcount;
  }

  return Math.min(headcount, requisitionsCreated);
}

function isPendingApprovalStatus(status) {
  return /pending/i.test(String(status || ""));
}

function buildBudgetExceptionsSummary(budgetExceptions = []) {
  return budgetExceptions.map((ex) => ({
    id: ex.id,
    position: ex.position,
    variance_pct: ex.variance_pct,
    status: ex.workflow_status || ex.status || ""
  }));
}

function buildUpcomingHiring(draft) {
  const fromQueue = (draft.approval_queue || [])
    .filter((item) => isPendingApprovalStatus(item.status))
    .map((item) => ({
      id: item.id,
      department: item.department,
      position: item.position,
      headcount: Number(item.headcount || 1),
      target_date: item.target_date || item.submitted_on || null,
      budget: Number(item.proposed_budget || 0)
    }));

  const fromPositions = (draft.approved_positions || [])
    .filter((position) => {
      const headcount = Number(position.headcount || 0);
      const requisitionsCreated = Number(position.requisitions_created || 0);

      return (
        headcount > requisitionsCreated
        && String(position.status || "") !== "Fully Utilized"
      );
    })
    .map((position) => ({
      id: position.id,
      department: position.department,
      position: position.position,
      headcount: Number(position.headcount || 0)
        - Number(position.requisitions_created || 0),
      target_date: position.expiry_date || null,
      budget: Number(position.remaining_budget ?? position.budget_approved ?? 0)
    }));

  return [...fromQueue, ...fromPositions];
}

/**
 * @param {object} workforce Full workforce planning bundle (store / outlet context)
 * @returns {object} Dashboard view model for WorkforceDashboardPage
 */
export function deriveWorkforceDashboardView(workforce) {
  const base = workforce?.dashboard || {};
  const positions = workforce?.approved_positions || [];

  const approvedHeadcount = positions.reduce(
    (sum, position) => sum + Number(position.headcount || 0),
    0
  );

  const filledPositions = positions.reduce(
    (sum, position) => sum + countFilledHeadcount(position),
    0
  );

  const vacantPositions = Math.max(0, approvedHeadcount - filledPositions);

  const totalApprovedBudget = positions.reduce(
    (sum, position) => sum + Number(position.budget_approved || 0),
    0
  );

  const budgetConsumed = positions.reduce(
    (sum, position) => sum + Number(position.budget_consumed || 0),
    0
  );

  const budgetUtilizationPct =
    totalApprovedBudget > 0
      ? Math.round((budgetConsumed / totalApprovedBudget) * 100)
      : Number(base.budget_utilization_pct || 0);

  const budgetExceptionsSummary = buildBudgetExceptionsSummary(
    workforce?.budget_exceptions || []
  );

  const upcomingHiring = buildUpcomingHiring(workforce);

  return {
    ...base,
    approved_headcount: approvedHeadcount,
    filled_positions: filledPositions,
    vacant_positions: vacantPositions,
    total_approved_budget: totalApprovedBudget,
    budget_consumed: budgetConsumed,
    budget_utilization_pct: budgetUtilizationPct,
    budget_exceptions_summary: budgetExceptionsSummary.length
      ? budgetExceptionsSummary
      : base.budget_exceptions_summary || [],
    upcoming_hiring: upcomingHiring.length
      ? upcomingHiring
      : base.upcoming_hiring || []
  };
}

export function countPendingApprovalQueueItems(approvalQueue = []) {
  return approvalQueue.filter((item) => isPendingApprovalStatus(item.status)).length;
}

export function countPendingBudgetExceptions(budgetExceptions = []) {
  return budgetExceptions.filter((item) =>
    /pending/i.test(String(item.workflow_status || ""))
  ).length;
}

export default deriveWorkforceDashboardView;
