/**
 * Candidate portal session helpers — separate from employee sessionAuth.
 */

export const CANDIDATE_AUTH_STORAGE_KEYS = [
  "candidate_token",
  "candidate_user"
];

function decodeBase64Url(segment) {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLength);
  return atob(base64);
}

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

export function isTokenExpired(token, skewMs = 0) {
  const payload = parseJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + skewMs;
}

export function getStoredCandidateToken() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const token = localStorage.getItem("candidate_token");
  return token && String(token).trim() ? token : null;
}

export function getStoredCandidateUser() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("candidate_user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCandidateSession(token, user) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem("candidate_token", token);
  localStorage.setItem("candidate_user", JSON.stringify(user));
}

export function clearCandidateAuthStorage() {
  if (typeof localStorage !== "undefined") {
    CANDIDATE_AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  if (typeof sessionStorage !== "undefined") {
    CANDIDATE_AUTH_STORAGE_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }
}

export function enforceCandidateSession() {
  const token = getStoredCandidateToken();

  if (!token) {
    return { ok: false, reason: "missing" };
  }

  const payload = parseJwtPayload(token);

  if (!payload || payload.account_type !== "candidate") {
    clearCandidateAuthStorage();
    return { ok: false, reason: "invalid" };
  }

  if (isTokenExpired(token)) {
    clearCandidateAuthStorage();
    return { ok: false, reason: "expired" };
  }

  return { ok: true, token, payload };
}

export function isCandidateSessionValid() {
  return enforceCandidateSession().ok;
}
