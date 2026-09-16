import { Navigate } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import { readWorkspaceFlags } from "@/enterprise/workspaceAvailability";

function HmWorkspaceRoute({ children }) {
  const workspaceFlags = readWorkspaceFlags();

  return (
    <ProtectedRoute>
      {workspaceFlags.showHiringManagerWorkspace ? (
        children
      ) : (
        <Navigate to="/workspace" replace />
      )}
    </ProtectedRoute>
  );
}

export default HmWorkspaceRoute;
