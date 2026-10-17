import {
  filterItemsBySearch,
  normalizeWorkforceSearchQuery
} from "@/utils/workforcePlanningListFilter";

export function resolveMirrorVersionStatus(step = {}) {
  return String(step.version_status || step.versionStatus || "Published");
}

export function resolveMirrorSubmissionVersion(step = {}, offer = {}) {
  const raw = step.version ?? step.submission_version ?? offer.version ?? offer.offerVersion ?? 1;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : 1;
}

export function isCurrentSubmissionApprovalRow(step, offer = {}) {
  if (resolveMirrorVersionStatus(step) === "Superseded") {
    return false;
  }

  const offerVersion = Number(offer.version ?? offer.offerVersion ?? 1);
  const rowVersion = resolveMirrorSubmissionVersion(step, offer);
  return rowVersion === offerVersion;
}

export function splitApprovalMirrorRows(approvals, offerId, offer = {}) {
  const all = normalizeApprovals(approvals, offerId);
  const current = all.filter((row) => isCurrentSubmissionApprovalRow(row, offer));
  const historical = all.filter((row) => !isCurrentSubmissionApprovalRow(row, offer));
  return { current, historical, all };
}

export function normalizeApprovals(approvals, offerId) {
  return (approvals || [])
    .filter((row) => String(row.offer_id || row.offerId) === String(offerId))
    .sort(
      (a, b) =>
        Number(a.sequence_order ?? a.sequenceOrder ?? 0) -
        Number(b.sequence_order ?? b.sequenceOrder ?? 0)
    );
}

export function currentPendingStep(steps) {
  return (
    steps.find((row) =>
      /pending/i.test(String(row.approval_status || row.approvalStatus || ""))
    ) || null
  );
}

export function resolveOfferStatus(offer = {}) {
  return offer.offerStatus ?? offer.offer_status ?? "";
}

export function isPendingApprovalStatus(status) {
  return String(status || "") === "Pending Approval";
}

const WITHDRAWN_TERMINAL_STATUSES = new Set(["Accepted", "Declined", "Withdrawn"]);

export function canWithdrawOfferStatus(status) {
  const normalized = String(status || "").trim();
  return Boolean(normalized) && !WITHDRAWN_TERMINAL_STATUSES.has(normalized);
}

export const OFFER_PENDING_APPROVAL_SEARCH_FIELDS = [
  "offerId",
  "candidateName",
  "candidate_name",
  "requisitionCode",
  "requisition_code",
  "currentApprovalStep",
  "currentApproverRole",
  "positionTitle",
  "position_title",
  "businessUnit",
  "business_unit",
  "department"
];

export function filterPendingApprovalQueueBySearch(queue, searchQuery) {
  return filterItemsBySearch(
    queue,
    OFFER_PENDING_APPROVAL_SEARCH_FIELDS,
    searchQuery
  );
}

export { normalizeWorkforceSearchQuery as normalizeOfferApprovalSearchQuery };

export function buildPendingApprovalQueue(bundle) {
  const offers = bundle?.offers || [];
  const approvals = bundle?.approvals || [];

  return offers
    .filter((offer) => isPendingApprovalStatus(resolveOfferStatus(offer)))
    .map((offer) => {
      const { current: steps, historical } = splitApprovalMirrorRows(
        approvals,
        offer.offerId,
        offer
      );
      const pending = currentPendingStep(steps);

      return {
        ...offer,
        approvalSteps: steps,
        approvalHistorySteps: historical,
        currentApprovalStep:
          pending?.approval_step || pending?.approvalStep || null,
        currentApproverRole:
          pending?.approver_role || pending?.approverRole || null
      };
    });
}

export function buildApprovedOffersList(bundle) {
  const offers = bundle?.offers || [];
  const approvals = bundle?.approvals || [];
  const excludedOfferIds = new Set([
    ...(bundle?.awaitingLetters || []).map((item) => item.offerId),
    ...(bundle?.generatedLetters || []).map((item) => item.offerId)
  ]);

  return offers
    .filter(
      (offer) =>
        String(offer.offerStatus || "") === "Approved" &&
        !excludedOfferIds.has(offer.offerId)
    )
    .map((offer) => {
      const { current, historical } = splitApprovalMirrorRows(
        approvals,
        offer.offerId,
        offer
      );
      return {
        ...offer,
        approvalSteps: current,
        approvalHistorySteps: historical
      };
    });
}

export function buildAwaitingLettersList(bundle) {
  return cloneAwaitingLetters(bundle?.awaitingLetters || []);
}

export function buildGeneratedLettersList(bundle) {
  return cloneAwaitingLetters(bundle?.generatedLetters || []);
}

function resolveCreatorIdentity(user = {}) {
  return String(user.full_name || user.email_id || "").trim();
}

function isOfferOwnedByUser(offer, user = {}) {
  const creator = resolveCreatorIdentity(user);
  const employeeCode = String(user.employee_code || "").trim();
  const createdBy = String(offer.createdBy || offer.created_by || "").trim();
  const recruiterId = String(offer.recruiterId || offer.recruiter_id || "").trim();

  return (
    (creator && (createdBy === creator || recruiterId === creator))
    || (employeeCode && (recruiterId === employeeCode || createdBy === employeeCode))
  );
}

function enrichOfferWithApprovals(bundle, offer) {
  const { current, historical } = splitApprovalMirrorRows(
    bundle?.approvals,
    offer.offerId,
    offer
  );
  return {
    ...offer,
    approvalSteps: current,
    approvalHistorySteps: historical
  };
}

export function buildMyOfferRequestsList(bundle, user) {
  return (bundle?.offers || [])
    .filter((offer) => isOfferOwnedByUser(offer, user))
    .map((offer) => enrichOfferWithApprovals(bundle, offer))
    .sort((a, b) => {
      const aTime = new Date(a.modifiedOn || a.createdOn || 0).getTime();
      const bTime = new Date(b.modifiedOn || b.createdOn || 0).getTime();
      return bTime - aTime;
    });
}

export function buildRejectedOffersList(bundle) {
  return (bundle?.offers || [])
    .filter((offer) => String(resolveOfferStatus(offer)) === "Declined")
    .map((offer) => enrichOfferWithApprovals(bundle, offer));
}

export function buildWithdrawnOffersList(bundle) {
  return (bundle?.offers || [])
    .filter((offer) => String(resolveOfferStatus(offer)) === "Withdrawn")
    .map((offer) => enrichOfferWithApprovals(bundle, offer));
}

export function buildReleasedOffersList(bundle) {
  return (bundle?.offers || [])
    .filter((offer) => String(resolveOfferStatus(offer)) === "Released")
    .map((offer) => enrichOfferWithApprovals(bundle, offer));
}

function cloneAwaitingLetters(items) {
  return items.map((item) => ({ ...item }));
}

export function mapApprovalStepRow(step) {
  const status = String(step.approval_status || step.approvalStatus || "");
  const approvedOn = step.approved_on || step.approvedOn || null;
  const versionStatus = resolveMirrorVersionStatus(step);
  const submissionVersion = resolveMirrorSubmissionVersion(step);

  let decision = "—";
  if (/approved/i.test(status)) {
    decision = "Approved";
  } else if (/rejected/i.test(status)) {
    decision = "Rejected";
  } else if (/cancelled/i.test(status)) {
    decision = "Cancelled";
  } else if (/pending/i.test(status)) {
    decision = "Pending";
  } else if (/waiting/i.test(status)) {
    decision = "Waiting";
  }

  const stepLabel =
    versionStatus === "Superseded"
      ? `${step.approval_step || step.approvalStep || "—"} (submission v${submissionVersion})`
      : step.approval_step || step.approvalStep || "—";

  return {
    key: `${step.approval_id || step.approvalId || step.approval_step}-${step.sequence_order || step.sequenceOrder}-${versionStatus}`,
    step: stepLabel,
    approver: step.approver_name || step.approverName || "—",
    role: step.approver_role || step.approverRole || "—",
    decision,
    approvedAt: approvedOn
      ? new Date(approvedOn).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "—",
    status,
    versionStatus,
    submissionVersion
  };
}
