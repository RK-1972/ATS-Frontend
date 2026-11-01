import { Alert, Container } from "@mui/material";

import TalentIntelligenceWorkspacePage from "./TalentIntelligenceWorkspacePage";
import { readWorkspaceFlags, readLoggedInUser } from "@/enterprise/workspaceAvailability";

function TalentIntelligenceWorkspaceRoute() {
  const workspace = readWorkspaceFlags();
  const user = readLoggedInUser();
  const isAdmin = user?.role_name === "Admin";
  const canAccess = isAdmin || Boolean(workspace.showTalentIntelligenceWorkspace);

  if (!canAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Talent Intelligence requires the TALENT_INTELLIGENCE work assignment. Contact your
          administrator if you need access.
        </Alert>
      </Container>
    );
  }

  return <TalentIntelligenceWorkspacePage />;
}

export default TalentIntelligenceWorkspaceRoute;
