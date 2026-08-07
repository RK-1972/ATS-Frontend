import { formatCurrency } from "./formatCurrency";
import { formatApprovedDate } from "./offerLetterUtils";

export const PAY_FREQUENCY_OPTIONS = [
  "One Time",
  "Monthly",
  "Quarterly",
  "Half Yearly",
  "Yearly"
];

export function todayIsoDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const local = new Date(today.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function validateCommercialOfferFields(form) {
  const errors = {
    expected_joining_date: "",
    variable_pay: "",
    variable_pay_frequency: "",
    joining_bonus: "",
    joining_bonus_frequency: ""
  };
  let isValid = true;

  if (!String(form.expected_joining_date ?? "").trim()) {
    errors.expected_joining_date = "Expected joining date is required.";
    isValid = false;
  } else {
    const selected = new Date(form.expected_joining_date);
    const today = new Date(todayIsoDate());

    if (Number.isNaN(selected.getTime())) {
      errors.expected_joining_date = "Enter a valid joining date.";
      isValid = false;
    } else if (selected < today) {
      errors.expected_joining_date = "Joining date cannot be earlier than today.";
      isValid = false;
    }
  }

  const variablePay = Number(form.variable_pay);
  if (!Number.isFinite(variablePay) || variablePay < 0) {
    errors.variable_pay = "Variable pay cannot be negative.";
    isValid = false;
  } else if (variablePay > 0 && !form.variable_pay_frequency) {
    errors.variable_pay_frequency = "Select a variable pay frequency.";
    isValid = false;
  }

  const joiningBonus = Number(form.joining_bonus);
  if (!Number.isFinite(joiningBonus) || joiningBonus < 0) {
    errors.joining_bonus = "Joining bonus cannot be negative.";
    isValid = false;
  } else if (joiningBonus > 0 && !form.joining_bonus_frequency) {
    errors.joining_bonus_frequency = "Select a joining bonus frequency.";
    isValid = false;
  }

  return { isValid, errors };
}

export function formatPayFrequency(value) {
  return value || "—";
}

export function readCommercialValue(source, camelKey, snakeKey, fallback = null) {
  if (source?.[camelKey] !== undefined && source?.[camelKey] !== null) {
    return source[camelKey];
  }

  if (source?.[snakeKey] !== undefined && source?.[snakeKey] !== null) {
    return source[snakeKey];
  }

  return fallback;
}

export function formatCommercialJoiningDate(value) {
  return formatApprovedDate(value);
}

export function formatCommercialAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "—";
  }

  return formatCurrency(amount);
}

export function formatCommercialPayFrequency(amount, frequency) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "—";
  }

  return formatPayFrequency(frequency);
}
