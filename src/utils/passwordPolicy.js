/**
 * Shared password policy — must match ResetPassword.jsx and backend passwordPolicy.js.
 */

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password)
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password)
  },
  {
    key: "number",
    label: "One number",
    test: (password) => /\d/.test(password)
  },
  {
    key: "special",
    label: "One special character (@$!%*?&)",
    test: (password) => /[@$!%*?&]/.test(password)
  }
];

export function isPasswordStrong(password) {
  return typeof password === "string" && PASSWORD_REGEX.test(password);
}

export function getPasswordStrengthLabel(password) {
  if (!password) {
    return "Weak";
  }

  const score = PASSWORD_RULES.reduce(
    (total, rule) => total + (rule.test(password) ? 1 : 0),
    0
  );

  if (score <= 2) {
    return "Weak";
  }

  if (score <= 4) {
    return "Medium";
  }

  return "Strong";
}

export function getPasswordStrengthColor(strength, theme) {
  if (strength === "Strong") {
    return theme.palette.success.main;
  }

  if (strength === "Medium") {
    return theme.palette.warning.main;
  }

  return theme.palette.error.main;
}

export const MOBILE_REGEX =
  /^\+?[0-9][0-9\s-]{8,18}[0-9]$/;

export function isValidMobile(mobile) {
  const normalized = String(mobile || "").trim().replace(/\s+/g, " ");
  return Boolean(normalized) && MOBILE_REGEX.test(normalized);
}

export function normalizeMobile(mobile) {
  return String(mobile || "").trim().replace(/\s+/g, " ");
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
