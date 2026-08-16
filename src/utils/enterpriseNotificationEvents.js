export const OWNERSHIP_REQUESTS_UPDATED_EVENT = "ownershipRequestsUpdated";
export const APPROVAL_NOTIFICATIONS_UPDATED_EVENT = "approvalNotificationsUpdated";

export function dispatchOwnershipRequestsUpdated() {
  window.dispatchEvent(new Event(OWNERSHIP_REQUESTS_UPDATED_EVENT));
}

export function dispatchApprovalNotificationsUpdated() {
  window.dispatchEvent(new Event(APPROVAL_NOTIFICATIONS_UPDATED_EVENT));
}
