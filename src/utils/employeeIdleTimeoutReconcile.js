export const IDLE_TIMEOUT_NOT_DUE_CODE = "IDLE_TIMEOUT_NOT_DUE";
export const SESSION_INVALID_CODE = "SESSION_INVALID";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 750;

function parseTime(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

export function classifyIdleTimeoutError(error) {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.message;

  if (status === 409 && code === IDLE_TIMEOUT_NOT_DUE_CODE) {
    return { kind: "not_due" };
  }

  if (status === 401 || code === SESSION_INVALID_CODE) {
    return { kind: "session_invalid", message };
  }

  if (!error?.response) {
    return { kind: "transient" };
  }

  if (status >= 500) {
    return { kind: "transient" };
  }

  return { kind: "unexpected", status, code };
}

export function isIdleDeadlineElapsed(status, nowMs = Date.now()) {
  const effectiveExpiresAt = parseTime(status?.effective_expires_at);
  if (effectiveExpiresAt == null) {
    return false;
  }
  return nowMs >= effectiveExpiresAt;
}

function delay(ms, sleep) {
  return sleep(ms);
}

/**
 * Confirm server-side IDLE_TIMEOUT termination without recording USER_LOGOUT.
 * Never extends session deadlines; uses idle-status only to reconcile ambiguity.
 */
export async function attemptIdleTimeoutLogout({
  completeIdleTimeout,
  fetchIdleStatus,
  nowMs = Date.now(),
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
} = {}) {
  if (!completeIdleTimeout || !fetchIdleStatus) {
    throw new Error("completeIdleTimeout and fetchIdleStatus are required.");
  }

  const tryCompleteIdleTimeout = async () => {
    await completeIdleTimeout();
    return { outcome: "confirmed" };
  };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await tryCompleteIdleTimeout();
    } catch (error) {
      const classified = classifyIdleTimeoutError(error);

      if (classified.kind === "not_due") {
        try {
          const status = await fetchIdleStatus();
          return { outcome: "not_due", status };
        } catch (syncError) {
          const syncClassified = classifyIdleTimeoutError(syncError);
          if (syncClassified.kind === "session_invalid") {
            return {
              outcome: "session_invalid",
              message: syncClassified.message
            };
          }
        }
        return { outcome: "not_due", status: null };
      }

      if (classified.kind === "session_invalid") {
        return {
          outcome: "session_invalid",
          message: classified.message
        };
      }

      if (attempt < maxAttempts - 1) {
        await delay(retryDelayMs, sleep);
      }
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const status = await fetchIdleStatus();

      if (!isIdleDeadlineElapsed(status, nowMs)) {
        return { outcome: "not_due", status };
      }

      try {
        return await tryCompleteIdleTimeout();
      } catch (error) {
        const classified = classifyIdleTimeoutError(error);

        if (classified.kind === "not_due") {
          try {
            const refreshed = await fetchIdleStatus();
            return { outcome: "not_due", status: refreshed };
          } catch {
            return { outcome: "not_due", status };
          }
        }

        if (classified.kind === "session_invalid") {
          return {
            outcome: "session_invalid",
            message: classified.message
          };
        }

        if (attempt < maxAttempts - 1) {
          await delay(retryDelayMs, sleep);
        }
      }
    } catch (error) {
      const classified = classifyIdleTimeoutError(error);
      if (classified.kind === "session_invalid") {
        return {
          outcome: "session_invalid",
          message: classified.message
        };
      }

      if (attempt < maxAttempts - 1) {
        await delay(retryDelayMs, sleep);
      }
    }
  }

  return { outcome: "give_up" };
}
