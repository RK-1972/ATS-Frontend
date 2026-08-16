import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from "@mui/material";

import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import AuthorizationService from "../../services/authorizationService";
import useWorkforcePlanning from "../../hooks/useWorkforcePlanning";

const REQUISITION_QUEUE_SECTIONS = [
  {
    key: "requisitions-approved",
    label: "Approved Requisitions",
    path: "/requisition-queues/approved",
    icon: VerifiedOutlinedIcon,
    countKey: "approved"
  },
  {
    key: "requisitions-clarification",
    label: "Requisition – Clarification Required",
    path: "/requisition-queues/clarification",
    icon: HelpOutlineOutlinedIcon,
    countKey: "clarification"
  },
  {
    key: "requisitions-rejected",
    label: "Rejected Requisitions",
    path: "/requisition-queues/rejected",
    icon: HighlightOffOutlinedIcon,
    countKey: "rejected"
  }
];

function RequisitionsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useWorkforcePlanning();

  const [canViewRequisitions, setCanViewRequisitions] = useState(false);

  let workspace = {};
  try {
    workspace = JSON.parse(localStorage.getItem("workspace") || "{}") || {};
  } catch (_error) {
    workspace = {};
  }

  useEffect(() => {
    let cancelled = false;

    AuthorizationService.canRaiseRequisition()
      .then((allowed) => {
        if (!cancelled) {
          setCanViewRequisitions(
            Boolean(allowed) || Boolean(workspace.showRequestWorkspace)
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanViewRequisitions(Boolean(workspace.showRequestWorkspace));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [workspace.showRequestWorkspace]);

  if (!canViewRequisitions) {
    return null;
  }

  const queueCounts = data.requisition_queue_counts || {
    approved: 0,
    clarification: 0,
    rejected: 0
  };

  return (
    <Box
      component="nav"
      aria-label="Requisitions sections"
      sx={{
        width: { xs: "100%", md: 260 },
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: { md: 1 },
        borderColor: "divider",
        minHeight: { md: "calc(100vh - 82px)" },
        py: 1.5
      }}
    >
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase"
          }}
        >
          Requisitions
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color="primary.main"
          mt={0.25}
        >
          Requisition Lifecycle
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1, py: 0.5 }}>
        {REQUISITION_QUEUE_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = location.pathname.startsWith(section.path);
          const badgeCount = queueCounts[section.countKey] || 0;

          return (
            <ListItemButton
              key={section.key}
              selected={active}
              onClick={() => navigate(section.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.25,
                py: 0.75,
                minHeight: 40,
                "&.Mui-selected": {
                  bgcolor: "rgba(31, 59, 99, 0.08)",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main"
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary={section.label}
                primaryTypographyProps={{
                  fontWeight: active ? 700 : 500,
                  fontSize: 13
                }}
              />

              {badgeCount > 0 ? (
                <Chip
                  label={badgeCount}
                  size="small"
                  color={section.countKey === "clarification" ? "warning" : "default"}
                  sx={{
                    height: 20,
                    minWidth: 20,
                    fontWeight: 700,
                    fontSize: 10,
                    "& .MuiChip-label": { px: 0.5 }
                  }}
                />
              ) : null}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default RequisitionsSidebar;

export { REQUISITION_QUEUE_SECTIONS };
