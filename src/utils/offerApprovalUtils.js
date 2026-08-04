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

export function buildPendingApprovalQueue(bundle) {
  const offers = bundle?.offers || [];
  const approvals = bundle?.approvals || [];

  return offers
    .filter((offer) => isPendingApprovalStatus(resolveOfferStatus(offer)))
    .map((offer) => {
      const steps = normalizeApprovals(approvals, offer.offerId);
      const pending = currentPendingStep(steps);

      return {
        ...offer,
        approvalSteps: steps,
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

  return offers
    .filter((offer) => String(offer.offerStatus || "") === "Approved")
    .map((offer) => ({
      ...offer,
      approvalSteps: normalizeApprovals(approvals, offer.offerId)
    }));
}

export function mapApprovalStepRow(step) {
  const status = String(step.approval_status || step.approvalStatus || "");
  const approvedOn = step.approved_on || step.approvedOn || null;

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

  return {
    key: `${step.approval_id || step.approvalId || step.approval_step}-${step.sequence_order || step.sequenceOrder}`,
    step: step.approval_step || step.approvalStep || "—",
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
    status
  };
}
