export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const PAN_IMMUTABILITY_NOTICE =
  "After registration, your PAN cannot be changed. Please verify it carefully before submitting.";

export function normalizePan(value) {
  const pan = String(value || "").trim().toUpperCase();
  return pan || "";
}

export function validatePanNumber(value) {
  const pan = normalizePan(value);

  if (!pan) {
    return "PAN number is required.";
  }

  if (!PAN_REGEX.test(pan)) {
    return "Invalid PAN format. Example: ABCDE1234F";
  }

  return "";
}
