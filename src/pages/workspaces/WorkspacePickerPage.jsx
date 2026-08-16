import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  WorkspaceLayout,
  EnterpriseModuleCard,
  EnterpriseModuleGrid
} from "@/components/enterprise";
import {
  getAvailableWorkspaces,
  readLoggedInUser
} from "@/enterprise/workspaceAvailability";

function WorkspacePickerPage() {
  const navigate = useNavigate();
  const loggedInUser = readLoggedInUser();
  const workspaces = getAvailableWorkspaces({ user: loggedInUser });
  return (
    <WorkspaceLayout>
      <Box py={4}>
        <Box maxWidth={720} mx="auto" mb={3} px={{ xs: 0, sm: 0 }}>
          <Typography variant="h2" fontWeight={700} mb={0.5}>
            Choose Workspace
          </Typography>
          <Typography color="text.secondary" fontSize={14}>
            Welcome, {loggedInUser?.full_name || loggedInUser?.name || "User"}. Select where you want to work.
          </Typography>
        </Box>

        <EnterpriseModuleGrid>
          {workspaces.map((workspace) => (
            <EnterpriseModuleCard
              key={workspace.id}
              title={workspace.title}
              description={workspace.description}
              icon={workspace.icon}
              module={workspace.module}
              actionLabel="Open"
              onAction={() => navigate(workspace.path)}
            />
          ))}
        </EnterpriseModuleGrid>
      </Box>
    </WorkspaceLayout>
  );
}

export default WorkspacePickerPage;
