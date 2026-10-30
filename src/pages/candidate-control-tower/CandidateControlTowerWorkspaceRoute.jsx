import { Alert, Container } from "@mui/material";

import CandidateControlTowerPage from "./CandidateControlTowerPage";
import { readWorkspaceFlags } from "@/enterprise/workspaceAvailability";

function CandidateControlTowerWorkspaceRoute() {
  const workspace = readWorkspaceFlags();
  const canAccess = Boolean(workspace.showCandidateControlTowerWorkspace);

  if (!canAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          The Centralized Candidate Control Tower requires the CANDIDATE_CONTROL_TOWER
          work assignment. Contact your administrator if you need access.
        </Alert>
      </Container>
    );
  }

  return <CandidateControlTowerPage />;
}

export default CandidateControlTowerWorkspaceRoute;
