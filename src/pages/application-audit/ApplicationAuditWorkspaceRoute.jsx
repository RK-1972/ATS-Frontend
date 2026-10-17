import { Alert, Container } from "@mui/material";

import ApplicationAuditWorkspacePage from "./ApplicationAuditWorkspacePage";
import { readWorkspaceFlags } from "@/enterprise/workspaceAvailability";

function ApplicationAuditWorkspaceRoute() {
  const workspace = readWorkspaceFlags();
  const canAccess = Boolean(workspace.showApplicationAuditWorkspace);

  if (!canAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Application Audit & Session History requires the APPLICATION_AUDIT_OBSERVER work
          assignment. Contact your administrator if you need access.
        </Alert>
      </Container>
    );
  }

  return <ApplicationAuditWorkspacePage />;
}

export default ApplicationAuditWorkspaceRoute;
