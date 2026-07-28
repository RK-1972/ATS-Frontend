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
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WorkspaceLayout from "@/components/enterprise/WorkspaceLayout";

function WorkspacePickerPage() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  let workspaceFlags = {};

  try {
    workspaceFlags =
      JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspaceFlags = {};
  }

  const workspaces = [
    {
      id: "recruiter",
      flag: "showRecruitmentWorkspace",
      title: "Recruitment Workspace",
      description: "What work requires my attention today?",
      path: "/recruiter",
      icon: DashboardOutlinedIcon
    },
    {
      id: "interviewer",
      flag: "showInterviewWorkspace",
      title: "Interview Workspace",
      description: "What interviews must I conduct today?",
      path: "/interviewer",
      icon: WorkOutlineOutlinedIcon
    },
    {
      id: "approvals",
      flag: "showApprovalWorkspace",
      title: "My Approvals",
      description: "What approvals require my decision today?",
      path: "/my-approvals",
      icon: FactCheckOutlinedIcon
    },
    {
      id: "request",
      flag: "showRequestWorkspace",
      title: "Requisitions / Request Workspace",
      description: "What requisitions do I need to raise or track?",
      path: "/workforce-planning/catalogue",
      icon: DescriptionOutlinedIcon
    }
  ].filter((workspace) => Boolean(workspaceFlags[workspace.flag]));

  return (
    <WorkspaceLayout>
      <Box maxWidth={720} mx="auto" py={4}>
        <Typography variant="h2" fontWeight={700} mb={0.5}>
          Choose Workspace
        </Typography>
        <Typography color="text.secondary" mb={3} fontSize={14}>
          Welcome, {loggedInUser?.full_name || loggedInUser?.name || "User"}. Select where you want to work.
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
