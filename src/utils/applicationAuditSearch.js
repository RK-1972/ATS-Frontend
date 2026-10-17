/**
 * Application Audit smart-search helpers (aligned with myApprovalsSearch haystack pattern).
 */

export function normalizeApplicationAuditSearchTerm(value) {
  const term = String(value || "").trim();
  return term || "";
}

export function resolveApplicationAuditSearchPlaceholder(tab) {
  if (tab === "sessions") {
    return "Search employee, account, session, status…";
  }

  if (tab === "screens") {
    return "Search employee, screen, or route…";
  }

  if (tab === "business") {
    return "Search employee, action, or entity…";
  }

  return "Search employee, account, screen or event…";
}
