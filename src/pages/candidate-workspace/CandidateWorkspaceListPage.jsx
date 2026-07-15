import { useOutletContext } from "react-router-dom";

import { Box, Button, Stack } from "@mui/material";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";

import { EmptyState, WorkspaceHeader } from "@/components/enterprise";

function CandidateWorkspaceListPage() {
  const workspace = useOutletContext();

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
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewOutlinedIcon />}
            href="/candidates/classic"
          >
            Classic View
          </Button>
        }
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
