export const REPEAT_GUARD_CODES = {
  ALLOW: "ALLOW",
  CONFIRM_SELECTED: "CONFIRM_SELECTED",
  OVERRIDE_REJECTED: "OVERRIDE_REJECTED",
  ACTIVE_SCHEDULED: "ACTIVE_SCHEDULED",
  PENDING_FEEDBACK: "PENDING_FEEDBACK"
};

export function requiresRepeatDialog(precheck) {
  const code =
    precheck?.guardCode
    || precheck?.data?.guardCode
    || precheck?.guard?.code;

  return (
    code === REPEAT_GUARD_CODES.CONFIRM_SELECTED
    || code === REPEAT_GUARD_CODES.OVERRIDE_REJECTED
  );
}

export function buildRepeatSchedulePayload(basePayload, repeatForm = {}) {
  return {
    ...basePayload,
    repeat_confirmation: Boolean(repeatForm.repeatConfirmation),
    repeat_reason: String(repeatForm.repeatReason || "").trim(),
    repeat_override_acknowledged: Boolean(repeatForm.repeatOverrideAcknowledged)
  };
}
