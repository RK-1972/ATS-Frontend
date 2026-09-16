export const BUDGET_CHANGE_STATUS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled"
};

export const BUDGET_CHANGE_TYPE = {
  INCREASE: "Increase",
  REDUCTION: "Reduction"
};

export function isPendingBudgetChange(status) {
  return String(status || "").trim() === BUDGET_CHANGE_STATUS.PENDING;
}
