import { useEffect } from "react";

import { Box, Stack } from "@mui/material";

import { EmptyState, WorkspaceHeader } from "@/components/enterprise";
import { useCopilotContext } from "@/components/copilot/CopilotContext";

function CandidateWorkspaceListPage() {
  const { setCurrentPage } = useCopilotContext();

  useEffect(() => {
    setCurrentPage("Candidates");
  }, [setCurrentPage]);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <WorkspaceHeader
        title="Candidate Workspace"
        subtitle="Select a candidate from the list to open the enterprise profile workspace."
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Recruitment" },
          { label: "Candidates" },
          { label: "Candidate Workspace" }
        ]}
      />

      <Stack flex={1} justifyContent="center">
        <EmptyState
          title="No candidate selected"
          description="Choose a candidate from the sidebar to review profile, pipeline status, documents, and activity."
        />
      </Stack>
    </Box>
  );
}

export default CandidateWorkspaceListPage;
