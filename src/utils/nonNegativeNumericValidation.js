/**
 * Shared validation for business numeric fields that must not be negative.
 */

export function parseNumeric(rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return null;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function collectNonNegativeNumberErrors(fieldName, rawValue, options = {}) {
  const { allowBlank = true, label = fieldName } = options;
  const errors = [];

  if (allowBlank && (rawValue === "" || rawValue === null || rawValue === undefined)) {
    return errors;
  }

  const parsed = parseNumeric(rawValue);

  if (parsed === null) {
    errors.push(`${label} is required.`);
    return errors;
  }

  if (Number.isNaN(parsed)) {
    errors.push(`${label} must be a valid number.`);
    return errors;
  }

  if (parsed < 0) {
    errors.push(`${label} cannot be negative.`);
  }

  return errors;
}

export function collectStrictlyPositiveNumberErrors(fieldName, rawValue, options = {}) {
  const { label = fieldName } = options;
  const errors = [];

  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    errors.push(`${label} is required.`);
    return errors;
  }

  const parsed = parseNumeric(rawValue);

  if (parsed === null || Number.isNaN(parsed)) {
    errors.push(`${label} must be a valid number.`);
    return errors;
  }

  if (parsed <= 0) {
    errors.push(`${label} must be greater than 0.`);
  }

  return errors;
}

export function collectOpeningsCountErrors(rawValue, options = {}) {
  const { allowBlank = false } = options;

  if (allowBlank && (rawValue === "" || rawValue === null || rawValue === undefined)) {
    return [];
  }

  const parsed = parseNumeric(rawValue);

  if (parsed === null || Number.isNaN(parsed)) {
    return ["Openings count must be a whole number of at least 1."];
  }

  if (!Number.isInteger(parsed) || parsed < 1) {
    return ["Openings count must be a whole number of at least 1."];
  }

  return [];
}

/**
 * Reject pasted or typed negative values while preserving blank optional fields.
 */
export function sanitizeNonNegativeInputString(rawValue, { allowBlank = true } = {}) {
  if (allowBlank && (rawValue === "" || rawValue === null || rawValue === undefined)) {
    return "";
  }

  const parsed = parseNumeric(rawValue);
  if (Number.isNaN(parsed) || parsed < 0) {
    return "0";
  }

  return String(rawValue);
}

export function clampNonNegativeNumber(value, { allowBlank = true } = {}) {
  if (allowBlank && (value === "" || value === null || value === undefined)) {
    return value;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}
