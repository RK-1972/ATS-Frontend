import {
  Box,
  Typography,
  Tab,
  Button,
  Stack,
  Chip,
  Avatar,
  IconButton
} from "@mui/material";
import { useState } from "react";
import { MdMoreHoriz, MdOpenInNew, MdStarOutline } from "react-icons/md";
import EnterpriseTabs from "@/components/enterprise/EnterpriseTabs";
import { DESIGN, PANEL_SHELL } from "./recruiterHomeTokens";
import { candidateInitials, resolveTodaysNextAction } from "./recruiterHomeUiHelpers";

function PropertyRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 1,
        py: 0.65,
        borderBottom: `1px solid ${DESIGN.border}`,
        "&:last-of-type": { borderBottom: 0 }
      }}
    >
      <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DESIGN.textPrimary, textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
}

function resolveInspectorContext({
  requisition,
  actionItem,
  selectedCandidate,
  priorityCandidate,
  selectedStage,
  selectedStageCount,
  stageCandidates,
  enrichedPriority
}) {
  const candidateCtx = selectedCandidate
    || (!requisition && !actionItem && !selectedStage ? enrichedPriority || priorityCandidate : null);

  if (requisition) {
    return {
      mode: "requisition",
      name: requisition.title,
      subtitle: `Req ${requisition.code}${requisition.department ? ` · ${requisition.department}` : ""}`,
      badge: "Requisition",
      showActive: false,
      initials: requisition.code?.slice(-2) || "RQ",
      todaysNextAction: resolveTodaysNextAction({ mode: "requisition", requisition }),
      properties: [
        { label: "Req ID", value: requisition.code },
        { label: "Status", value: requisition.status },
        { label: "Risk", value: requisition.risk },
        { label: "Open / Filled", value: `${requisition.openPositions} / ${requisition.filled}` },
        { label: "Pending interviews", value: requisition.pendingInterviews },
        { label: "Progress", value: `${requisition.progress}%` },
        { label: "Next Step", value: requisition.nextAction }
      ],
      primaryRoute: "/requisitions",
      primaryLabel: "View Requisition"
    };
  }

  if (actionItem) {
    return {
      mode: "action",
      name: actionItem.title,
      subtitle: actionItem.type,
      badge: "Attention",
      showActive: true,
      initials: candidateInitials(actionItem.title),
      todaysNextAction: resolveTodaysNextAction({ mode: "action", actionItem }),
      properties: [
        { label: "Type", value: actionItem.displayType || actionItem.type },
        { label: "Subject", value: actionItem.title },
        { label: "Detail", value: actionItem.detail || "—" },
        { label: "Priority", value: actionItem.priorityLabel || "Medium" }
      ],
      primaryRoute: actionItem.route,
      primaryLabel: "Take Action"
    };
  }

  if (candidateCtx) {
    return {
      mode: "candidate",
      name: candidateCtx.name,
      subtitle: candidateCtx.inspectorSubtitle || `${candidateCtx.stage || candidateCtx.context} · Req ${candidateCtx.requisition || candidateCtx.detail || "—"}`,
      badge: "Priority",
      showActive: true,
      initials: candidateInitials(candidateCtx.name),
      todaysNextAction: resolveTodaysNextAction({ mode: "candidate", candidate: candidateCtx, actionItem }),
      properties: [
        { label: "Candidate ID", value: candidateCtx.code || candidateCtx.id || "—" },
        { label: "Stage", value: candidateCtx.stage || candidateCtx.context || "—" },
        { label: "Requisition", value: candidateCtx.requisitionLabel || candidateCtx.requisition || candidateCtx.detail || "—" },
        { label: "Interviewer", value: candidateCtx.interviewer || "—" },
        { label: "Interview Date", value: candidateCtx.interviewDateLabel || "—" },
        { label: "Next Step", value: candidateCtx.nextStep || "Review and advance or schedule next step" }
      ],
      primaryRoute: "/candidates",
      primaryLabel: "View Candidate Profile"
    };
  }

  if (selectedStage) {
    return {
      mode: "stage",
      name: selectedStage,
      subtitle: `${selectedStageCount ?? 0} candidate${selectedStageCount === 1 ? "" : "s"} at stage`,
      badge: "Pipeline",
      showActive: false,
      initials: "PL",
      properties: stageCandidates.length > 0
        ? stageCandidates.slice(0, 5).flatMap((c) => [
            { label: c.name, value: c.requisition }
          ])
        : [{ label: "Candidates", value: "None at this stage" }],
      primaryRoute: "/candidates",
      primaryLabel: "View Candidates"
    };
  }

  return {
    mode: "standby",
    name: "Awaiting data",
    subtitle: "Select an item or load pipeline",
    badge: "Standby",
    showActive: false,
    initials: "—",
    properties: [{ label: "Status", value: "No selection" }],
    primaryRoute: "/candidates",
    primaryLabel: "Open Candidates"
  };
}

function RecruiterHomeInspector({
  requisition = null,
  actionItem = null,
  selectedCandidate = null,
  priorityCandidate = null,
  enrichedPriority = null,
  selectedStage = null,
  selectedStageCount = null,
  stageCandidates = [],
  onNavigate
}) {
  const [tab, setTab] = useState(0);

  const ctx = resolveInspectorContext({
    requisition,
    actionItem,
    selectedCandidate,
    priorityCandidate,
    selectedStage,
    selectedStageCount,
    stageCandidates,
    enrichedPriority
  });

  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: DESIGN.border }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN.textPrimary }}>Inspector</Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              icon={<MdStarOutline size={14} />}
              label={ctx.badge}
              size="small"
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: DESIGN.blueBg,
                color: DESIGN.blue,
                border: "1px solid #B2DDFF"
              }}
            />
            <IconButton size="small" sx={{ p: 0.25 }} aria-label="More options">
              <MdMoreHoriz size={18} />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: DESIGN.blueBg,
              color: DESIGN.blue,
              fontSize: 14,
              fontWeight: 700
            }}
          >
            {ctx.initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: DESIGN.textPrimary }} noWrap>
                {ctx.name}
              </Typography>
              {ctx.showActive && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor: DESIGN.greenBg,
                    color: DESIGN.green
                  }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary, mt: 0.25 }} noWrap>
              {ctx.subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <EnterpriseTabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{
          minHeight: 36,
          px: 1.5,
          borderBottom: 1,
          borderColor: DESIGN.border,
          "& .MuiTab-root": {
            minHeight: 36,
            fontSize: 12,
            fontWeight: 600,
            textTransform: "none",
            px: 0,
            mr: 2,
            color: DESIGN.textSecondary,
            "&.Mui-selected": { color: DESIGN.blue }
          },
          "& .MuiTabs-indicator": { bgcolor: DESIGN.blue, height: 2 }
        }}
      >
        <Tab label="Details" />
        <Tab label="Actions" />
      </EnterpriseTabs>

      <Box sx={{ px: 1.5, py: 0.75, flex: 1, minHeight: 0, overflow: "auto" }}>
        {tab === 0 && ctx.properties.map((row) => (
          <PropertyRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
        ))}

        {tab === 0 && ctx.todaysNextAction && (
          <Box
            sx={{
              mt: 0.75,
              pt: 0.75,
              borderTop: `1px solid ${DESIGN.border}`
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: DESIGN.textSecondary,
                letterSpacing: "0.02em",
                mb: 0.35
              }}
            >
              Today&apos;s Next Action
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN.blue, lineHeight: 1.35 }}>
              {ctx.todaysNextAction}
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Stack spacing={0.75} pt={0.5}>
            <Button
              fullWidth
              variant="contained"
              endIcon={<MdOpenInNew size={16} />}
              onClick={() => onNavigate?.(ctx.primaryRoute)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                py: 0.85,
                boxShadow: "none",
                bgcolor: DESIGN.blue,
                "&:hover": { bgcolor: "#1849A9", boxShadow: "none" }
              }}
            >
              {ctx.primaryLabel}
            </Button>
            {(ctx.mode === "candidate" || ctx.mode === "action") && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => onNavigate?.("/interview-schedule")}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: 12 }}
              >
                Schedule Interview
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {tab === 0 && (
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
          <Button
            fullWidth
            variant="outlined"
            endIcon={<MdOpenInNew size={16} />}
            onClick={() => onNavigate?.(ctx.primaryRoute)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              py: 0.85,
              borderColor: DESIGN.border,
              color: DESIGN.textPrimary
            }}
          >
            {ctx.primaryLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default RecruiterHomeInspector;
