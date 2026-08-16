import { Box, Typography } from "@mui/material";
import {
  MdGroups,
  MdPersonOutline,
  MdHourglassTop,
  MdWorkOutline,
  MdAccountTree,
  MdWarningAmber
} from "react-icons/md";
import EnterpriseSurface from "@/components/enterprise/EnterpriseSurface";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_SHELL } from "./adminHomeTokens";

const CARDS = [
  { key: "totalUsers", label: "Total Users", icon: MdGroups, module: "team" },
  { key: "activeUsers", label: "Active Users", icon: MdPersonOutline, module: "candidates" },
  { key: "pendingAccessItems", label: "Pending Access / Approval Items", icon: MdHourglassTop, module: "approvals" },
  { key: "activeRequisitions", label: "Active Requisitions", icon: MdWorkOutline, module: "requisitions" },
  { key: "openWorkflowTasks", label: "Open Workflow / Approval Tasks", icon: MdAccountTree, module: "workflows" },
  { key: "governanceExceptions", label: "Governance / Configuration Exceptions", icon: MdWarningAmber, module: "reports" }
];

function AdminSummaryCards({
  totalUsers = 0,
  activeUsers = 0,
  pendingAccessItems = 0,
  activeRequisitions = 0,
  openWorkflowTasks = 0,
  governanceExceptions = 0
}) {
  const values = {
    totalUsers,
    activeUsers,
    pendingAccessItems,
    activeRequisitions,
    openWorkflowTasks,
    governanceExceptions
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(6, minmax(0, 1fr))"
        },
        gap: 1,
        mb: 2
      }}
    >
      {CARDS.map(({ key, label, icon: Icon, module }) => (
        <EnterpriseSurface
          key={key}
          elevation={0}
          padding={false}
          sx={{
            ...PANEL_SHELL,
            px: 1.5,
            py: 1.25,
            transition: "none"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <EnterpriseModuleIcon icon={Icon} module={module} density="sm" />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: DESIGN.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1.25
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: DESIGN.textPrimary,
                  mt: 0.25
                }}
              >
                {values[key]}
              </Typography>
            </Box>
          </Box>
        </EnterpriseSurface>
      ))}
    </Box>
  );
}

export default AdminSummaryCards;
