const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2})/;

function parseOptalynxDateInput(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();

  if (!str) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(str)) {
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function padTwo(value) {
  return String(value).padStart(2, "0");
}

export function isDateOnlyValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  return DATE_ONLY_PATTERN.test(String(value).trim());
}

export function formatOptalynxDate(value) {
  const date = parseOptalynxDateInput(value);

  if (!date) {
    return "—";
  }

  return `${padTwo(date.getDate())}/${padTwo(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatOptalynxDateTime(value) {
  const date = parseOptalynxDateInput(value);

  if (!date) {
    return "—";
  }

  return `${formatOptalynxDate(value)} ${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

export function formatOptalynxDateTimeValue(value) {
  if (isDateOnlyValue(value)) {
    return formatOptalynxDate(value);
  }

  return formatOptalynxDateTime(value);
}

export function formatOptalynxMaybeDateTime(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  const str = String(value).trim();

  if (!str) {
    return "—";
  }

  if (str === "Not available") {
    return str;
  }

  if (isDateOnlyValue(str) || ISO_DATE_TIME_PATTERN.test(str)) {
    const formatted = formatOptalynxDateTimeValue(str);

    if (formatted !== "—") {
      return formatted;
    }
  }

  return str;
}

export function formatDateTime(value, options = {}) {
  if (!value) {
    return "—";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  const formatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };

  if (options.includeYear) {
    formatOptions.year = "numeric";
  }

  return parsed.toLocaleString(undefined, formatOptions);
}

export default formatDateTime;
