import { useCallback, useEffect, useRef, useState } from "react";

import sessionTakeoverClient from "@/api/clients/sessionTakeoverClient";
import { clearAuthStorage } from "@/utils/sessionAuth";

const INBOX_POLL_MS = 5000;

export default function useSessionTakeoverInbox({ enabled = true, onSessionRevoked } = {}) {
  const [pending, setPending] = useState(null);
  const [dismissedRequestId, setDismissedRequestId] = useState(null);
  const pollRef = useRef(null);

  const refreshInbox = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const next = await sessionTakeoverClient.fetchInbox();
      if (!next) {
        setPending(null);
        return;
      }
      if (dismissedRequestId && next.request_id === dismissedRequestId) {
        setPending(null);
        return;
      }
      setPending(next);
    } catch (error) {
      const code = error.response?.data?.code;
      if (code === "SESSION_INVALID" || error.response?.status === 401) {
        clearAuthStorage();
        onSessionRevoked?.();
      }
    }
  }, [enabled, dismissedRequestId, onSessionRevoked]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    refreshInbox();
    pollRef.current = window.setInterval(refreshInbox, INBOX_POLL_MS);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, [enabled, refreshInbox]);

  const handleResolved = useCallback(({ requestId }) => {
    setDismissedRequestId(requestId);
    setPending(null);
  }, []);

  const handleSessionRevoked = useCallback(() => {
    clearAuthStorage();
    onSessionRevoked?.();
  }, [onSessionRevoked]);

  return {
    pending,
    refreshInbox,
    handleResolved,
    handleSessionRevoked
  };
}
