import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import {
  WorkspaceLayout,
  EnterpriseModuleCard,
  EnterpriseModuleGrid
} from "@/components/enterprise";

function WorkspacePickerPage() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  let workspaceFlags = {};

  try {
    workspaceFlags =
      JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch {
    workspaceFlags = {};
  }

  const workspaces = [
    {
      id: "recruiter",
      flag: "showRecruitmentWorkspace",
      title: "Recruitment Workspace",
      description: "What work requires my attention today?",
      path: "/recruiter",
      icon: DashboardOutlinedIcon,
      module: "recruitment"
    },
    {
      id: "interviewer",
      flag: "showInterviewWorkspace",
      title: "Interview Workspace",
      description: "What interviews must I conduct today?",
      path: "/interviewer",
      icon: WorkOutlineOutlinedIcon,
      module: "interviews"
    },
    {
      id: "approvals",
      flag: "showApprovalWorkspace",
      title: "My Approvals",
      description: "What approvals require my decision today?",
      path: "/my-approvals",
      icon: FactCheckOutlinedIcon,
      module: "approvals"
    },
    {
      id: "request",
      flag: "showRequestWorkspace",
      title: "Requisitions / Request Workspace",
      description: "What requisitions do I need to raise or track?",
      path: "/workforce-planning/catalogue",
      icon: DescriptionOutlinedIcon,
      module: "requisitions"
    },
    {
      id: "offers",
      flag: "showOfferWorkspace",
      title: "Offer Workspace",
      description: "What offers need action today?",
      path: "/offers",
      icon: LocalOfferOutlinedIcon,
      module: "offers"
    }
  ].filter((workspace) => Boolean(workspaceFlags[workspace.flag]));

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
