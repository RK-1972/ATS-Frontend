/**
 * Production V1 session helpers.
 * Validates JWT presence + exp locally (no backend round-trip).
 */

export const AUTH_STORAGE_KEYS = [
  "token",
  "user",
  "work_assignments",
  "work_assignment_status",
  "workspace"
];

function decodeBase64Url(segment) {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  return atob(base64);
}

/**
 * Parse JWT payload without verifying signature (client-side expiry gate only).
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * True when token is missing exp, malformed, or past exp.
 */
export function isTokenExpired(token, skewMs = 0) {
  const payload = parseJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + skewMs;
}

export function getStoredToken() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const token = localStorage.getItem("token");
  return token && String(token).trim() ? token : null;
}

export function clearAuthStorage() {
  if (typeof localStorage !== "undefined") {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  if (typeof sessionStorage !== "undefined") {
    AUTH_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
  }
}

/**
 * @returns {{ ok: true, token: string } | { ok: false, reason: "missing" | "expired" | "invalid" }}
 */
export function enforceSession() {
  const token = getStoredToken();

  if (!token) {
    return { ok: false, reason: "missing" };
  }

  const payload = parseJwtPayload(token);
  if (!payload) {
    clearAuthStorage();
    return { ok: false, reason: "invalid" };
  }

  if (isTokenExpired(token)) {
    clearAuthStorage();
    return { ok: false, reason: "expired" };
  }

  return { ok: true, token };
}

export function isSessionValid() {
  return enforceSession().ok;
}
