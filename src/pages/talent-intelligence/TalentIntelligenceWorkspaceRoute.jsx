import { useEffect, useState } from "react";
import { Alert, Container } from "@mui/material";

import TalentIntelligenceWorkspacePage from "./TalentIntelligenceWorkspacePage";
import recruitmentClient from "@/api/clients/recruitmentClient";
import { LoadingState } from "@/components/enterprise";
import {
  canShowTalentIntelligenceNav,
  hasTalentIntelligenceWorkAssignment,
  isRecruiterRoleUser,
  readLoggedInUser,
  readOtiWorkspaceNavEligible,
  readWorkspaceFlags,
  refreshOtiWorkspaceNavEligibility
} from "@/enterprise/workspaceAvailability";

function TalentIntelligenceWorkspaceRoute() {
  const user = readLoggedInUser();
  const workspaceFlags = readWorkspaceFlags();
  const [navEligible, setNavEligible] = useState(() => readOtiWorkspaceNavEligible());
  const [eligibilityReady, setEligibilityReady] = useState(() => {
    if (user?.role_name === "Admin") {
      return true;
    }
    if (hasTalentIntelligenceWorkAssignment(workspaceFlags)) {
      return true;
    }
    return navEligible !== null;
  });

  useEffect(() => {
    if (user?.role_name === "Admin" || hasTalentIntelligenceWorkAssignment(workspaceFlags)) {
      return;
    }

    if (!isRecruiterRoleUser(user)) {
      setEligibilityReady(true);
      return;
    }

    let cancelled = false;

    refreshOtiWorkspaceNavEligibility(() =>
      recruitmentClient.getTalentIntelligenceNavEligibility()
    ).then((eligible) => {
      if (cancelled) {
        return;
      }
      setNavEligible(eligible);
      setEligibilityReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.role_name, workspaceFlags]);

  if (!eligibilityReady) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LoadingState message="Checking Talent Intelligence access…" />
      </Container>
    );
  }

  const canAccess = canShowTalentIntelligenceNav({
    user,
    workspaceFlags,
    serverNavEligible: navEligible
  });

  if (!canAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          Talent Intelligence is available when you have at least one assigned requisition or the
          TALENT_INTELLIGENCE work assignment. Contact your administrator if you need access.
        </Alert>
      </Container>
    );
  }

  return <TalentIntelligenceWorkspacePage />;
}

export default TalentIntelligenceWorkspaceRoute;
