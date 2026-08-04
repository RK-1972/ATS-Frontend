import API from "../api/axios";

const REQUISITION_REQUESTOR_CODE = "REQUISITION_REQUESTOR";
const REQUISITION_ASSIGNER_CODE = "REQUISITION_ASSIGNER";
const RAISE_BUDGET_REQUEST_CODE = "RAISE_BUDGET_REQUEST";
const BUDGET_REQUESTOR_CODE = "BUDGET_REQUESTOR";

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function isPermissionEnabled(permissions, permissionCode) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  const permission = permissions.find(
    (row) =>
      String(row.permission_code || "").trim().toUpperCase() ===
      String(permissionCode || "").trim().toUpperCase()
  );

  return Boolean(permission?.is_enabled);
}

async function fetchUserPermissions(employeeCode) {
  const response = await API.get(
    `/user-permissions/${encodeURIComponent(employeeCode)}`
  );
  return response.data?.data || [];
}

async function fetchEmployeeWorkAssignments(employeeCode) {
  const response = await API.get(
    `/employee-work-assignments/${encodeURIComponent(employeeCode)}`
  );
  return response.data?.data || [];
}

function hasActiveWorkAssignment(assignments, assignmentCode) {
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return false;
  }

  return assignments.some((row) => {
    if (row.is_active !== true) {
      return false;
    }

    if (row.master_is_active === false) {
      return false;
    }

    return (
      String(row.assignment_code || "").trim().toUpperCase() ===
      String(assignmentCode || "").trim().toUpperCase()
    );
  });
}

/**
 * Returns whether the logged-in user may raise requisitions.
 * Admins are always allowed; others require active REQUISITION_REQUESTOR assignment.
 */
async function canRaiseRequisition() {
  const user = getLoggedInUser();

  if (!user) {
    return false;
  }

  if (user.role_name === "Admin") {
    return true;
  }

  const employeeCode = user.employee_code;

  if (!employeeCode) {
    return false;
  }

  try {
    const assignments = await fetchEmployeeWorkAssignments(employeeCode);
    return hasActiveWorkAssignment(assignments, REQUISITION_REQUESTOR_CODE);
  } catch {
    return false;
  }
}

/**
 * Returns whether the logged-in user may raise Budget Requests.
 * Admins are always allowed; others require an active BUDGET_REQUESTOR Work Assignment.
 */
async function canRaiseBudgetRequest() {
  const user = getLoggedInUser();

  if (!user) {
    return false;
  }

  if (user.role_name === "Admin") {
    return true;
  }

  const employeeCode = user.employee_code;

  if (!employeeCode) {
    return false;
  }

  try {
    const assignments = await fetchEmployeeWorkAssignments(employeeCode);
    return hasActiveWorkAssignment(assignments, BUDGET_REQUESTOR_CODE);
  } catch {
    return false;
  }
}

/**
 * Returns whether the logged-in user may access Recruiter Assignment.
 * Requires an active REQUISITION_ASSIGNER Work Assignment only.
 */
async function canAssignRecruiters() {
  const user = getLoggedInUser();

  if (!user) {
    return false;
  }

  const employeeCode = user.employee_code;

  if (!employeeCode) {
    return false;
  }

  try {
    const assignments = await fetchEmployeeWorkAssignments(employeeCode);
    return hasActiveWorkAssignment(assignments, REQUISITION_ASSIGNER_CODE);
  } catch {
    return false;
  }
}

const AuthorizationService = {
  canRaiseRequisition,
  canRaiseBudgetRequest,
  canAssignRecruiters
};

export { canRaiseRequisition, canRaiseBudgetRequest, canAssignRecruiters };
export default AuthorizationService;
