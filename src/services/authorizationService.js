import API from "../api/axios";
import {
  getProvisionableRolesForAdmin,
  getProvisionableRolesForUserAdministrator,
  PLATFORM_ADMIN_ROLE
} from "../constants/employeeRoles";

const REQUISITION_REQUESTOR_CODE = "REQUISITION_REQUESTOR";
const REQUISITION_ASSIGNER_CODE = "REQUISITION_ASSIGNER";
const TA_LEAD_ROLES = ["TA Lead", "TA Leader"];
const RAISE_BUDGET_REQUEST_CODE = "RAISE_BUDGET_REQUEST";
const BUDGET_REQUESTOR_CODE = "BUDGET_REQUESTOR";
const USER_ADMINISTRATOR_CODE = "USER_ADMINISTRATOR";

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

function isTaLeadRole(user) {
  return TA_LEAD_ROLES.includes(String(user?.role_name || "").trim());
}

function readWorkspaceFlags() {
  try {
    return JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch {
    return {};
  }
}

/**
 * Returns whether the logged-in user may access Recruiter Assignment.
 * Admin, TA Lead / TA Leader, or active REQUISITION_ASSIGNER assignment.
 */
async function canAssignRecruiters() {
  const user = getLoggedInUser();

  if (!user) {
    return false;
  }

  if (user.role_name === "Admin" || isTaLeadRole(user)) {
    return true;
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

/**
 * Returns whether the logged-in user may open the TA Lead workspace.
 */
async function canAccessTaLeadWorkspace() {
  const user = getLoggedInUser();

  if (!user) {
    return false;
  }

  const workspace = readWorkspaceFlags();

  if (workspace.showTaLeadWorkspace) {
    return true;
  }

  return canAssignRecruiters();
}

/**
 * Returns whether the logged-in user may access User Administration (/users).
 * Platform Admins or active USER_ADMINISTRATOR assignment.
 */
async function canAccessUserAdministration() {
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
    return hasActiveWorkAssignment(assignments, USER_ADMINISTRATOR_CODE);
  } catch {
    return false;
  }
}

function getProvisionableRoles() {
  const user = getLoggedInUser();

  if (user?.role_name === PLATFORM_ADMIN_ROLE) {
    return getProvisionableRolesForAdmin();
  }

  return getProvisionableRolesForUserAdministrator();
}

const AuthorizationService = {
  canRaiseRequisition,
  canRaiseBudgetRequest,
  canAssignRecruiters,
  canAccessTaLeadWorkspace,
  canAccessUserAdministration,
  getProvisionableRoles
};

export {
  canRaiseRequisition,
  canRaiseBudgetRequest,
  canAssignRecruiters,
  canAccessTaLeadWorkspace,
  canAccessUserAdministration,
  getProvisionableRoles,
  USER_ADMINISTRATOR_CODE,
  TA_LEAD_ROLES
};
export default AuthorizationService;
