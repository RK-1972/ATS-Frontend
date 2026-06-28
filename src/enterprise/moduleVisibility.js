const NAV_MODULE_MAP = {
  "Talent Management": "recruitment",
  "Requisition Management": "recruitment",
  "Interview Management": "interview_management",
  "Offer Management": "offer_management",
  "Employee Referral": "employee_referral",
  "Campus Hiring": "campus_hiring",
  "Vendor Portal": "vendor_portal"
};

const ADMIN_NAV_MODULE_MAP = {
  "/candidates": "recruitment"
};

const GOVERNANCE_PATHS = [
  "/platform-configuration",
  "/business-rules",
  "/hiring-control-tower",
  "/workforce-planning",
  "/master-data"
];

export function isModuleEnabled(platformConfig, moduleKey) {

  if (!moduleKey) {
    return true;
  }

  const module = platformConfig?.modules?.find((item) => item.key === moduleKey);
  return module ? module.enabled : true;

}

export function isModuleVisibleForRole(platformConfig, moduleKey, role) {

  if (!moduleKey) {
    return true;
  }

  if (!isModuleEnabled(platformConfig, moduleKey)) {
    return false;
  }

  const matrix = platformConfig?.role_visibility?.matrix?.[role];

  if (!matrix) {
    return true;
  }

  return matrix[moduleKey] !== false;

}

export function isNavPathVisible(path, role, platformConfig) {

  if (path === "/" || !path) {
    return true;
  }

  if (GOVERNANCE_PATHS.some((prefix) => path.startsWith(prefix))) {
    return true;
  }

  const moduleKey = ADMIN_NAV_MODULE_MAP[path];

  if (!moduleKey) {
    return true;
  }

  return isModuleVisibleForRole(platformConfig, moduleKey, role);

}

export function isHomeMenuItemVisible(menuLabel, role, platformConfig) {

  const moduleKey = NAV_MODULE_MAP[menuLabel];

  if (!moduleKey) {
    return true;
  }

  return isModuleVisibleForRole(platformConfig, moduleKey, role);

}

export function getEnabledModuleLabels(platformConfig) {

  return (platformConfig?.modules || [])
    .filter((module) => module.enabled)
    .map((module) => module.title);

}

export { NAV_MODULE_MAP, ADMIN_NAV_MODULE_MAP };
