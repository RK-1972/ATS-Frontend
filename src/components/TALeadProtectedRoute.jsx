import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import OptalynxLoader from "./OptalynxLoader";
import AuthorizationService from "@/services/authorizationService";

function TALeadProtectedRoute({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    let cancelled = false;

    AuthorizationService.canAccessTaLeadWorkspace()
      .then((result) => {
        if (!cancelled) {
          setAllowed(Boolean(result));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllowed(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (allowed === null) {
    return <OptalynxLoader />;
  }

  if (!allowed) {
    return <Navigate to="/workspace" replace />;
  }

  return children;
}

export default TALeadProtectedRoute;
