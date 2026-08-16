/**
 * Report Builder — field → authoritative lookup source mapping.
 * Master values come from enterprise APIs; enums from report metadata.
 */

export const FILTER_VALUE_SOURCE = Object.freeze({
  MASTER_DEPARTMENTS: "master:departments",
  MASTER_GRADES: "master:grades",
  MASTER_DESIGNATIONS: "master:designations",
  MASTER_WORK_LOCATIONS: "master:work_locations",
  MASTER_BUSINESS_UNITS: "master:business_units",
  MASTER_EMPLOYMENT_TYPES: "master:employment_types",
  API_RECRUITERS: "api:recruiters",
  API_HIRING_MANAGERS: "api:hiring_managers",
  METADATA_ENUM: "metadata:enum",
  NATIVE_DATE: "native:date",
  NATIVE_NUMBER: "native:number",
  FREE_TEXT: "free_text",
  DISABLED: "disabled"
});

const FIELD_SOURCE_MAP = Object.freeze({
  department: FILTER_VALUE_SOURCE.MASTER_DEPARTMENTS,
  approved_department: FILTER_VALUE_SOURCE.MASTER_DEPARTMENTS,
  grade: FILTER_VALUE_SOURCE.MASTER_GRADES,
  approved_grade: FILTER_VALUE_SOURCE.MASTER_GRADES,
  position_title: FILTER_VALUE_SOURCE.MASTER_DESIGNATIONS,
  approved_position_title: FILTER_VALUE_SOURCE.MASTER_DESIGNATIONS,
  location: FILTER_VALUE_SOURCE.MASTER_WORK_LOCATIONS,
  business_unit: FILTER_VALUE_SOURCE.MASTER_BUSINESS_UNITS,
  employment_type: FILTER_VALUE_SOURCE.MASTER_EMPLOYMENT_TYPES,
  hiring_manager: FILTER_VALUE_SOURCE.API_HIRING_MANAGERS,
  assigned_recruiter_code: FILTER_VALUE_SOURCE.API_RECRUITERS,
  mapping_recruiter_code: FILTER_VALUE_SOURCE.API_RECRUITERS
});

const TEXT_PARTIAL_OPERATORS = new Set(["contains", "starts_with", "ends_with"]);

export function isMultiValueOperator(operator) {
  return operator === "in";
}

export function isRangeOperator(operator) {
  return operator === "between";
}

export function resolveFilterValueSource(fieldCode, fieldMeta, operator) {
  if (!operator) {
    return FILTER_VALUE_SOURCE.DISABLED;
  }

  if (isRangeOperator(operator)) {
    if (fieldMeta?.data_type === "date") {
      return FILTER_VALUE_SOURCE.NATIVE_DATE;
    }
    if (fieldMeta?.data_type === "number") {
      return FILTER_VALUE_SOURCE.NATIVE_NUMBER;
    }
    return FILTER_VALUE_SOURCE.FREE_TEXT;
  }

  if (fieldMeta?.data_type === "date") {
    return FILTER_VALUE_SOURCE.NATIVE_DATE;
  }

  if (fieldMeta?.data_type === "number") {
    return FILTER_VALUE_SOURCE.NATIVE_NUMBER;
  }

  if (fieldMeta?.data_type === "enum") {
    return FILTER_VALUE_SOURCE.METADATA_ENUM;
  }

  if (TEXT_PARTIAL_OPERATORS.has(operator)) {
    return FILTER_VALUE_SOURCE.FREE_TEXT;
  }

  const mappedSource = FIELD_SOURCE_MAP[fieldCode];
  if (mappedSource) {
    return mappedSource;
  }

  return FILTER_VALUE_SOURCE.FREE_TEXT;
}

export function shouldResetValueOnOperatorChange(previousOperator, nextOperator) {
  if (!previousOperator || !nextOperator || previousOperator === nextOperator) {
    return false;
  }

  const prevMulti = isMultiValueOperator(previousOperator);
  const nextMulti = isMultiValueOperator(nextOperator);
  const prevRange = isRangeOperator(previousOperator);
  const nextRange = isRangeOperator(nextOperator);

  return prevMulti !== nextMulti || prevRange !== nextRange;
}

export function getDefaultValueForOperator(operator) {
  if (isMultiValueOperator(operator)) {
    return [];
  }

  return "";
}
