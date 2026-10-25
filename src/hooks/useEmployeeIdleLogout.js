import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import employeeSessionClient from "@/api/clients/employeeSessionClient";
import applicationAuditClient from "@/api/clients/applicationAuditClient";
import {
  clearEmployeeIdleSync,
  readEmployeeIdleSync,
  writeEmployeeIdleSync
} from "@/utils/employeeIdleSync";
import { attemptIdleTimeoutLogout } from "@/utils/employeeIdleTimeoutReconcile";
import {
  clearAuthStorage,
  getStoredToken,
  parseJwtPayload
} from "@/utils/sessionAuth";
import useEnterpriseStore from "@/store/enterpriseStore";

const TICK_MS = 1000;
const ACTIVITY_DEBOUNCE_MS = 2000;
const SERVER_SYNC_MS = 60 * 1000;
const WARNING_LEAD_MS = 2 * 60 * 1000;
const IDLE_LOGOUT_RETRY_MS = 5000;

const IDLE_LOGOUT_MESSAGE =
  "You were signed out due to inactivity. Sign in again to continue.";

const INTERACTION_EVENTS = [
  "keydown",
  "pointerdown",
  "mousedown",
  "touchstart",
  "click"
];

function parseTime(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function readCurrentSessionId() {
  const payload = parseJwtPayload(getStoredToken());
  return payload?.session_id ? String(payload.session_id) : null;
}

export default function useEmployeeIdleLogout({ enabled = true } = {}) {
  const navigate = useNavigate();
  const resetEnterpriseSession = useEnterpriseStore(
    (state) => state.resetEnterpriseSession
  );

  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_LEAD_MS / 1000);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const deadlinesRef = useRef({
    warningAt: null,
    idleExpiresAt: null,
    effectiveExpiresAt: null
  });
  const activityTimerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const loggingOutRef = useRef(false);
  const idleLogoutRetryAfterRef = useRef(0);

  const applyServerStatus = useCallback((status) => {
    if (!status) {
      return;
    }

    const warningAt = parseTime(status.warning_at);
    const idleExpiresAt = parseTime(status.idle_expires_at);
    const effectiveExpiresAt = parseTime(status.effective_expires_at);

    deadlinesRef.current = {
      warningAt,
      idleExpiresAt,
      effectiveExpiresAt
    };

    writeEmployeeIdleSync({
      session_id: readCurrentSessionId(),
      warning_at: status.warning_at,
      idle_expires_at: status.idle_expires_at,
      effective_expires_at: status.effective_expires_at,
      server_now: status.server_now
    });
  }, []);

  const hydrateFromStorage = useCallback(() => {
    const sessionId = readCurrentSessionId();
    const stored = readEmployeeIdleSync(sessionId);
    if (!stored?.effective_expires_at) {
      return false;
    }
    applyServerStatus(stored);
    return true;
  }, [applyServerStatus]);

  const performLogout = useCallback(
    async (message = IDLE_LOGOUT_MESSAGE, { idleTimeout = false } = {}) => {
      if (loggingOutRef.current) {
        return;
      }
      loggingOutRef.current = true;
      setWarningOpen(false);

      if (getStoredToken()) {
        if (idleTimeout) {
          const reconciliation = await attemptIdleTimeoutLogout({
            completeIdleTimeout: () => employeeSessionClient.completeIdleTimeout(),
            fetchIdleStatus: () => employeeSessionClient.fetchIdleStatus()
          });

          if (reconciliation.outcome === "not_due") {
            loggingOutRef.current = false;
            idleLogoutRetryAfterRef.current = 0;
            if (reconciliation.status) {
              applyServerStatus(reconciliation.status);
            }
            setErrorMessage("");
            return;
          }

          if (reconciliation.outcome === "give_up") {
            loggingOutRef.current = false;
            idleLogoutRetryAfterRef.current = Date.now() + IDLE_LOGOUT_RETRY_MS;
            setWarningOpen(true);
            setSecondsRemaining(0);
            setErrorMessage(
              "We could not reach the server to complete sign-out. "
              + "Your session remains governed by server inactivity rules. "
              + "We will retry automatically, or use Log out to sign out now."
            );
            return;
          }

          if (reconciliation.outcome === "session_invalid") {
            message = reconciliation.message || message;
          }
        } else {
          try {
            await applicationAuditClient.postLogout();
          } catch {
            // Client logout proceeds even if session audit update fails.
          }
        }
      }

      idleLogoutRetryAfterRef.current = 0;
      clearEmployeeIdleSync();
      clearAuthStorage();
      resetEnterpriseSession?.();

      navigate("/login", {
        replace: true,
        state: { sessionMessage: message }
      });
    },
    [navigate, resetEnterpriseSession, applyServerStatus]
  );

  const refreshIdleStatus = useCallback(async () => {
    if (!enabled || !getStoredToken()) {
      return null;
    }

    try {
      const status = await employeeSessionClient.fetchIdleStatus();
      applyServerStatus(status);
      return status;
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "SESSION_INVALID" || error.response?.status === 401) {
        await performLogout(
          error.response?.data?.message || IDLE_LOGOUT_MESSAGE
        );
      }
      return null;
    }
  }, [enabled, applyServerStatus, performLogout]);

  const recordGenuineActivity = useCallback(async () => {
    if (!enabled || !getStoredToken() || loggingOutRef.current) {
      return;
    }

    try {
      const status = await employeeSessionClient.recordActivity();
      applyServerStatus(status);
      setWarningOpen(false);
      setErrorMessage("");
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "SESSION_INVALID" || error.response?.status === 401) {
        await performLogout(
          error.response?.data?.message || IDLE_LOGOUT_MESSAGE
        );
      }
    }
  }, [enabled, applyServerStatus, performLogout]);

  const scheduleActivityPing = useCallback(() => {
    if (activityTimerRef.current) {
      window.clearTimeout(activityTimerRef.current);
    }
    activityTimerRef.current = window.setTimeout(() => {
      recordGenuineActivity();
    }, ACTIVITY_DEBOUNCE_MS);
  }, [recordGenuineActivity]);

  const evaluateDeadlines = useCallback(() => {
    const now = Date.now();
    const { warningAt, idleExpiresAt, effectiveExpiresAt } = deadlinesRef.current;

    if (!effectiveExpiresAt) {
      return;
    }

    if (now >= effectiveExpiresAt) {
      if (now < idleLogoutRetryAfterRef.current) {
        return;
      }
      performLogout(IDLE_LOGOUT_MESSAGE, { idleTimeout: true });
      return;
    }

    const warningThreshold = warningAt || (idleExpiresAt ? idleExpiresAt - WARNING_LEAD_MS : null);
    if (warningThreshold && now >= warningThreshold && now < effectiveExpiresAt) {
      const remainingMs = Math.max(0, effectiveExpiresAt - now);
      setSecondsRemaining(Math.ceil(remainingMs / 1000));
      setWarningOpen(true);
      return;
    }

    setWarningOpen(false);
  }, [performLogout]);

  const handleStayLoggedIn = useCallback(async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const status = await employeeSessionClient.stayLoggedIn();
      applyServerStatus(status);
      setWarningOpen(false);
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "SESSION_INVALID" || error.response?.status === 401) {
        await performLogout(
          error.response?.data?.message || IDLE_LOGOUT_MESSAGE
        );
        return;
      }
      setErrorMessage(
        error.response?.data?.message
          || "Unable to extend your session. Try again or sign out."
      );
    } finally {
      setSubmitting(false);
    }
  }, [applyServerStatus, performLogout]);

  const handleLogOut = useCallback(async () => {
    setSubmitting(true);
    await performLogout("You have been signed out.");
    setSubmitting(false);
  }, [performLogout]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const bootstrap = async () => {
      const sessionId = readCurrentSessionId();
      const stored = readEmployeeIdleSync(sessionId);
      if (stored && sessionId && stored.session_id !== sessionId) {
        clearEmployeeIdleSync();
      }
      await refreshIdleStatus();
      evaluateDeadlines();
    };

    bootstrap();

    const onInteraction = (event) => {
      if (event.type === "keydown" && event.repeat) {
        return;
      }
      scheduleActivityPing();
    };

    INTERACTION_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, onInteraction, { passive: true });
    });

    const onStorage = (event) => {
      if (event.key && event.key.includes("optalynx_employee_idle_sync")) {
        if (hydrateFromStorage()) {
          evaluateDeadlines();
        }
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshIdleStatus().then(() => evaluateDeadlines());
      }
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onVisibility);
    window.addEventListener("pageshow", onVisibility);

    tickTimerRef.current = window.setInterval(evaluateDeadlines, TICK_MS);
    syncTimerRef.current = window.setInterval(refreshIdleStatus, SERVER_SYNC_MS);

    return () => {
      INTERACTION_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, onInteraction);
      });
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onVisibility);
      window.removeEventListener("pageshow", onVisibility);
      if (activityTimerRef.current) {
        window.clearTimeout(activityTimerRef.current);
      }
      if (tickTimerRef.current) {
        window.clearInterval(tickTimerRef.current);
      }
      if (syncTimerRef.current) {
        window.clearInterval(syncTimerRef.current);
      }
    };
  }, [
    enabled,
    hydrateFromStorage,
    refreshIdleStatus,
    scheduleActivityPing,
    evaluateDeadlines
  ]);

  return {
    warningOpen,
    secondsRemaining,
    totalWarningSeconds: WARNING_LEAD_MS / 1000,
    submitting,
    errorMessage,
    handleStayLoggedIn,
    handleLogOut
  };
}
