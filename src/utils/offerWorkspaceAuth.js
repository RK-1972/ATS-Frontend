import { isPendingApprovalStatus, resolveOfferStatus } from "./offerApprovalUtils";

const TA_LEAD_ROLES = new Set(["TA Lead", "TA Leader"]);

function resolveCreatorIdentity(user = {}) {
  return String(user.full_name || user.email_id || "").trim();
}

export function isOfferOwnedByUser(offer, user = {}) {
  const creator = resolveCreatorIdentity(user);
  const employeeCode = String(user.employee_code || "").trim();
  const createdBy = String(offer.createdBy || offer.created_by || "").trim();
  const recruiterId = String(offer.recruiterId || offer.recruiter_id || "").trim();

  return (
    (creator && (createdBy === creator || recruiterId === creator))
    || (employeeCode && (recruiterId === employeeCode || createdBy === employeeCode))
  );
}

export function canWritePendingApprovalOffer(offer, user = {}) {
  if (!isPendingApprovalStatus(resolveOfferStatus(offer))) {
    return false;
  }

  const role = String(user.role_name || "").trim();
  if (role === "Admin" || TA_LEAD_ROLES.has(role)) {
    return true;
  }

  return isOfferOwnedByUser(offer, user);
}
