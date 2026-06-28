import {
  Box,
  Typography,
  Stack,
  Button,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";

function WorkspacePickerPage() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const workspaces = [
    {
      id: "recruiter",
      title: "Recruiter Workspace",
      description: "What work requires my attention today?",
      path: "/recruiter",
      icon: DashboardOutlinedIcon
    },
    {
      id: "interviewer",
      title: "Interviewer Workspace",
      description: "What interviews must I conduct today?",
      path: "/interviewer",
      icon: WorkOutlineOutlinedIcon
    }
  ];

  return (
    <WorkspaceLayout>
      <Box maxWidth={720} mx="auto" py={4}>
        <Typography variant="h2" fontWeight={700} mb={0.5}>
          Choose Workspace
        </Typography>
        <Typography color="text.secondary" mb={3} fontSize={14}>
          Welcome, {loggedInUser?.name || "User"}. Select where you want to work.
        </Typography>

        <Stack spacing={2}>
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;

            return (
              <Paper
                key={workspace.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "action.selected",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main"
                  }}
                >
                  <Icon />
                </Box>

                <Box flex={1}>
                  <Typography fontWeight={600} fontSize={16}>
                    {workspace.title}
                  </Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    {workspace.description}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(workspace.path)}
                >
                  Open
                </Button>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </WorkspaceLayout>
  );
}

export default WorkspacePickerPage;
