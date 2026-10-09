/**
 * Client-side eligibility for operational employee pickers.
 * Matches EmployeeWorkAssignmentPage and user_mstr.is_active semantics.
 */

export function isActiveEmployeeRecord(record) {
  if (!record || typeof record !== "object") {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(record, "is_active")) {
    return record.is_active !== false;
  }

  return true;
}

export function filterActiveEmployeeRecords(rows) {
  return (Array.isArray(rows) ? rows : []).filter(isActiveEmployeeRecord);
}
