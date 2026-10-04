/**
 * Read-only session context for Help role filtering (no auth changes).
 */

export function readHelpSessionContext() {
  let user = null;
  let workspace = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch {
    workspace = {};
  }

  const roleNames = [];

  if (user?.role_name) {
    roleNames.push(String(user.role_name).trim());
  }

  if (user?.secondary_role) {
    roleNames.push(String(user.secondary_role).trim());
  }

  return {
    user,
    workspace,
    roleNames: roleNames.filter(Boolean)
  };
}

/**
 * Additive role filter: topics without roles are visible to everyone;
 * topics with roles require a matching role_name or secondary_role.
 *
 * @param {import("./helpManifest.js").HelpTopicManifestEntry} topic
 * @param {string[]} roleNames
 */
export function isHelpTopicVisibleForRoles(topic, roleNames) {
  const allowed = topic.roles;

  if (!Array.isArray(allowed) || allowed.length === 0) {
    return true;
  }

  if (!Array.isArray(roleNames) || roleNames.length === 0) {
    return true;
  }

  const normalizedAllowed = allowed.map((role) =>
    String(role || "").trim().toLowerCase()
  );

  return roleNames.some((role) =>
    normalizedAllowed.includes(String(role || "").trim().toLowerCase())
  );
}
