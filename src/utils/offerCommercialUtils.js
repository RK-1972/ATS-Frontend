import { formatCurrency } from "./formatCurrency";
import { formatApprovedDate } from "./offerLetterUtils";
import {
  collectNonNegativeNumberErrors,
  collectStrictlyPositiveNumberErrors
} from "./nonNegativeNumericValidation";

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
  const variablePayErrors = collectNonNegativeNumberErrors("variable_pay", form.variable_pay, {
    label: "Variable pay",
    allowBlank: true
  });
  if (variablePayErrors.length) {
    errors.variable_pay = variablePayErrors[0];
    isValid = false;
  } else if (variablePay > 0 && !form.variable_pay_frequency) {
    errors.variable_pay_frequency = "Select a variable pay frequency.";
    isValid = false;
  }

  const joiningBonusErrors = collectNonNegativeNumberErrors(
    "joining_bonus",
    form.joining_bonus,
    { label: "Joining bonus", allowBlank: true }
  );
  if (joiningBonusErrors.length) {
    errors.joining_bonus = joiningBonusErrors[0];
    isValid = false;
  } else if (Number(form.joining_bonus) > 0 && !form.joining_bonus_frequency) {
    errors.joining_bonus_frequency = "Select a joining bonus frequency.";
    isValid = false;
  }

  return { isValid, errors };
}

export function validateOfferCtcAmount(rawValue, label = "Offered CTC") {
  const errors = collectStrictlyPositiveNumberErrors("offered_ctc", rawValue, { label });
  return errors[0] || "";
}

export function validateNonNegativeOfferAmount(rawValue, label) {
  const errors = collectNonNegativeNumberErrors("amount", rawValue, {
    label,
    allowBlank: true
  });
  return errors[0] || "";
}

export function validateOptionalOfferCtcAmount(rawValue, label = "Counter CTC") {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return "";
  }

  return validateOfferCtcAmount(rawValue, label);
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
