export const HEADCOUNT_CHANGE_STATUS = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled"
};

export const HEADCOUNT_CHANGE_TYPE = {
  INCREASE: "Increase",
  REDUCTION: "Reduction"
};

export function isPendingHeadcountChange(status) {
  return String(status || "").trim() === HEADCOUNT_CHANGE_STATUS.PENDING;
}
