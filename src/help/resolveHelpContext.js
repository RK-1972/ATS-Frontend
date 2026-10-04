/** @typedef {import("./helpManifest.js").HelpModuleKey} HelpModuleKey */

export const HELP_MODULE_LABELS = {
  "workforce-planning": "Workforce Planning",
  requisitions: "Requisitions",
  candidates: "Candidates",
  recruiter: "Recruiter",
  interview: "Interview",
  offers: "Offers",
  "hiring-manager": "Hiring Manager",
  "ta-lead": "TA Lead",
  reports: "Reports & Analytics",
  administration: "Administration"
};

const PATH_PREFIX_RULES = [
  { prefix: "/workforce-planning", moduleKey: "workforce-planning" },
  { prefix: "/requisition-queues", moduleKey: "requisitions" },
  { prefix: "/requisitions", moduleKey: "requisitions" },
  { prefix: "/candidate-intake", moduleKey: "candidates" },
  { prefix: "/candidates", moduleKey: "candidates" },
  { prefix: "/recruiter", moduleKey: "recruiter" },
  { prefix: "/interview-schedule", moduleKey: "interview" },
  { prefix: "/interview-panel", moduleKey: "interview" },
  { prefix: "/interviewer", moduleKey: "interview" },
  { prefix: "/feedback", moduleKey: "interview" },
  { prefix: "/view-feedback", moduleKey: "interview" },
  { prefix: "/offers", moduleKey: "offers" },
  { prefix: "/hiring-manager", moduleKey: "hiring-manager" },
  { prefix: "/ta-lead", moduleKey: "ta-lead" },
  { prefix: "/reports", moduleKey: "reports" },
  { prefix: "/platform-configuration", moduleKey: "administration" },
  { prefix: "/business-rules", moduleKey: "administration" },
  { prefix: "/master-data", moduleKey: "administration" },
  { prefix: "/hiring-control-tower", moduleKey: "administration" },
  { prefix: "/users", moduleKey: "administration" },
  { prefix: "/employee-work-assignments", moduleKey: "administration" },
  { prefix: "/work-assignments", moduleKey: "administration" },
  { prefix: "/masters", moduleKey: "administration" },
  { prefix: "/my-approvals", moduleKey: "administration" }
];

/**
 * Resolve contextual Help module from the current route pathname only.
 * @param {string} pathname
 * @returns {{ moduleKey: HelpModuleKey, moduleTitle: string }}
 */
export function resolveHelpContext(pathname) {
  const normalized = String(pathname || "/").split("?")[0] || "/";

  for (const rule of PATH_PREFIX_RULES) {
    if (
      normalized === rule.prefix ||
      normalized.startsWith(`${rule.prefix}/`)
    ) {
      return {
        moduleKey: rule.moduleKey,
        moduleTitle: HELP_MODULE_LABELS[rule.moduleKey] || rule.moduleKey
      };
    }
  }

  return {
    moduleKey: "administration",
    moduleTitle: HELP_MODULE_LABELS.administration
  };
}
