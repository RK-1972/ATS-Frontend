import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";

import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { PANEL_SHELL, PANEL_HEADER, ROW_INTERACTIVE } from "./taLeadTokens";

function TaLeadQuickActionsPanel({
  actions = [],
  pendingApprovals = 0
}) {
  if (!actions.length) {
    return null;
  }

  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        display: "flex",
        flexDirection: "column",
        height: { xs: "auto", lg: "100%" }
      }}
    >
      <Box
        sx={{
          ...PANEL_HEADER,
          display: "flex",
          alignItems: "center",
          gap: 0.75
        }}
      >
        <EnterpriseModuleIcon
          icon={BoltOutlinedIcon}
          module="notifications"
          density="sm"
          size={28}
          iconSize={16}
        />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "text.secondary",
            letterSpacing: "0.04em"
          }}
        >
          QUICK ACTIONS
        </Typography>
      </Box>

      <List dense disablePadding sx={{ py: 0.5 }}>
        {actions.map((action) => {
          const Icon = action.icon;
          const showBadge = action.key === "approvals" && pendingApprovals > 0;

          return (
            <ListItemButton
              key={action.key}
              onClick={action.onClick}
              sx={{
                ...ROW_INTERACTIVE,
                py: 0.7,
                px: 1.5
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                {showBadge ? (
                  <Badge
                    badgeContent={pendingApprovals}
                    color="error"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: 10,
                        height: 16,
                        minWidth: 16
                      }
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </Badge>
                ) : (
                  <Icon sx={{ fontSize: 18, color: "text.secondary" }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={action.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "text.primary"
                }}
              />
              <ChevronRightOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default TaLeadQuickActionsPanel;
