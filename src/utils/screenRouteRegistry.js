/**
 * Stable screen identifiers for application audit telemetry.
 * Map pathname patterns to screen_key + route_template (no query strings).
 */

const ROUTE_RULES = [
  { pattern: /^\/login$/, screenKey: "auth.login", routeTemplate: "/login" },
  { pattern: /^\/$/, screenKey: "home", routeTemplate: "/" },
  { pattern: /^\/users$/, screenKey: "admin.users", routeTemplate: "/users" },
  { pattern: /^\/application-audit$/, screenKey: "audit.workspace", routeTemplate: "/application-audit" },
  { pattern: /^\/my-approvals$/, screenKey: "approvals.my", routeTemplate: "/my-approvals" },
  { pattern: /^\/offers\/pending-approvals$/, screenKey: "offers.pending-approvals", routeTemplate: "/offers/pending-approvals" },
  { pattern: /^\/offers\/my-requests$/, screenKey: "offers.my-requests", routeTemplate: "/offers/my-requests" },
  { pattern: /^\/offers/, screenKey: "offers.workspace", routeTemplate: "/offers/*" },
  { pattern: /^\/recruiter/, screenKey: "recruiter.workspace", routeTemplate: "/recruiter/*" },
  { pattern: /^\/candidates\/[^/]+$/, screenKey: "candidates.detail", routeTemplate: "/candidates/:candidateId" },
  { pattern: /^\/candidates/, screenKey: "candidates.list", routeTemplate: "/candidates" },
  { pattern: /^\/workforce-planning/, screenKey: "workforce.planning", routeTemplate: "/workforce-planning/*" },
  { pattern: /^\/interviewer/, screenKey: "interviewer.workspace", routeTemplate: "/interviewer/*" },
  { pattern: /^\/ta-lead/, screenKey: "ta-lead.workspace", routeTemplate: "/ta-lead/*" },
  { pattern: /^\/hiring-manager/, screenKey: "hiring-manager.workspace", routeTemplate: "/hiring-manager/*" }
];

export function resolveScreenFromPath(pathname = "") {
  const path = String(pathname || "").split("?")[0].split("#")[0] || "/";

  const match = ROUTE_RULES.find((rule) => rule.pattern.test(path));
  if (match) {
    return {
      screenKey: match.screenKey,
      routeTemplate: match.routeTemplate
    };
  }

  return {
    screenKey: `route.${path.replace(/^\//, "").replace(/\//g, ".") || "root"}`,
    routeTemplate: path.length > 120 ? `${path.slice(0, 117)}...` : path
  };
}
