/**
 * Canonical employee role_name values from Platform Configuration
 * (ats-backend/seed/platformConfig.seed.json → role_visibility.roles).
 *
 * Candidate portal accounts are separate and are not employee provisioning roles.
 */
/** Stable role code (documentation / integrations); stored value is role_name. */
export const ENTERPRISE_TALENT_ADMIN_ROLE_CODE = "ENTERPRISE_TALENT_ADMIN";

/** Primary user_mstr.role_name for Enterprise Talent Administrator. */
export const ENTERPRISE_TALENT_ADMIN_ROLE_NAME = "Enterprise Talent Administrator";

export const EMPLOYEE_ROLE_NAMES = Object.freeze([
  "Admin",
  "TA Leader",
  "TA Lead",
  "Recruiter",
  "Hiring Manager",
  "Interviewer",
  ENTERPRISE_TALENT_ADMIN_ROLE_NAME
]);

export const PLATFORM_ADMIN_ROLE = "Admin";

export function getProvisionableRolesForAdmin() {
  return [...EMPLOYEE_ROLE_NAMES];
}

export function getProvisionableRolesForUserAdministrator() {
  return EMPLOYEE_ROLE_NAMES.filter((role) => role !== PLATFORM_ADMIN_ROLE);
}
