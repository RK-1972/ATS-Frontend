/**
 * Header display label for the authenticated employee's business role(s).
 * Source of truth: login/JWT user snapshot (`user_mstr.role_name`, optional `secondary_role`).
 * Work assignments and workspace flags are not used for this label.
 */

const INTERVIEWER_ROLE = "Interviewer";

/**
 * @param {{ role_name?: string, secondary_role?: string | null } | null | undefined} user
 * @returns {string}
 */
export function resolveHeaderBusinessRoleLabel(user) {
  const primary = String(user?.role_name || "").trim();
  const secondary = String(user?.secondary_role || "").trim();

  if (!primary) {
    return secondary || "—";
  }

  if (secondary && secondary !== primary) {
    return `${primary} / ${secondary}`;
  }

  return primary;
}

export { INTERVIEWER_ROLE };
