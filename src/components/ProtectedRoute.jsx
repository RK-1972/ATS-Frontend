import { Navigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";

import { enforceSession } from "../utils/sessionAuth";
import useEnterpriseStore from "../store/enterpriseStore";

/**
 * Route gate: require a non-expired JWT before rendering protected UI.
 * Expired/missing tokens never paint the previous screen.
 */
function ProtectedRoute({ children }) {
  const session = enforceSession();
  const resetEnterpriseSession = useEnterpriseStore(
    (state) => state.resetEnterpriseSession
  );
  const didReset = useRef(false);

  useLayoutEffect(() => {
    if (session.ok || didReset.current) {
      return;
    }

    if (session.reason === "expired" || session.reason === "invalid") {
      didReset.current = true;
      resetEnterpriseSession?.();
    }
  }, [session.ok, session.reason, resetEnterpriseSession]);

  if (!session.ok) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
