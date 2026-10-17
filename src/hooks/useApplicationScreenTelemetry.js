import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import applicationAuditClient from "@/api/clients/applicationAuditClient";
import { parseJwtPayload } from "@/utils/sessionAuth";
import { getStoredToken } from "@/utils/sessionAuth";
import { resolveScreenFromPath } from "@/utils/screenRouteRegistry";

const FLUSH_INTERVAL_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 120000;

function readSessionIdFromToken() {
  const payload = parseJwtPayload(getStoredToken());
  return payload?.session_id ? String(payload.session_id) : null;
}

export default function useApplicationScreenTelemetry() {
  const location = useLocation();
  const activeVisitRef = useRef(null);
  const pendingRef = useRef([]);
  const flushTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  const enqueue = (event) => {
    pendingRef.current.push(event);
  };

  const flush = async () => {
    if (!pendingRef.current.length) {
      return;
    }

    const batch = pendingRef.current.splice(0, 25);

    try {
      await applicationAuditClient.postScreenActivityBatch(batch);
    } catch {
      pendingRef.current.unshift(...batch);
    }
  };

  const closeActiveVisit = (reason) => {
    const visit = activeVisitRef.current;
    if (!visit) {
      return;
    }

    const nowIso = new Date().toISOString();
    const hidden = document.visibilityState === "hidden";

    enqueue({
      screen_key: visit.screenKey,
      route_template: visit.routeTemplate,
      session_id: visit.sessionId,
      entered_at: visit.enteredAt,
      exited_at: hidden || reason === "unload" ? nowIso : null,
      last_visible_at: nowIso,
      visibility: document.visibilityState
    });

    activeVisitRef.current = null;
  };

  useEffect(() => {
    closeActiveVisit("navigation");

    const { screenKey, routeTemplate } = resolveScreenFromPath(location.pathname);
    activeVisitRef.current = {
      screenKey,
      routeTemplate,
      sessionId: readSessionIdFromToken(),
      enteredAt: new Date().toISOString()
    };

    return () => {
      closeActiveVisit("unmount");
    };
  }, [location.pathname]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        closeActiveVisit("hidden");
      } else if (!activeVisitRef.current) {
        const { screenKey, routeTemplate } = resolveScreenFromPath(location.pathname);
        activeVisitRef.current = {
          screenKey,
          routeTemplate,
          sessionId: readSessionIdFromToken(),
          enteredAt: new Date().toISOString()
        };
      }
    };

    const onPageHide = () => {
      closeActiveVisit("unload");
      flush();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    flushTimerRef.current = window.setInterval(flush, FLUSH_INTERVAL_MS);
    heartbeatTimerRef.current = window.setInterval(() => {
      applicationAuditClient.postSessionHeartbeat().catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      if (flushTimerRef.current) {
        window.clearInterval(flushTimerRef.current);
      }
      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }
      closeActiveVisit("cleanup");
      flush();
    };
  }, [location.pathname]);
}
