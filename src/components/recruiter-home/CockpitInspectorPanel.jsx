import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar
} from "@mui/material";
import { MdPerson, MdOpenInNew } from "react-icons/md";
import EnterpriseModuleIcon from "@/components/enterprise/EnterpriseModuleIcon";
import { DESIGN, PANEL_HEADER, PANEL_SHELL } from "./recruiterHomeTokens";
import { candidateInitials, resolveTodaysNextAction } from "./recruiterHomeUiHelpers";

function PropertyRow({ label, value, valueSx = {} }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.55, borderBottom: `1px solid ${DESIGN.border}` }}>
      <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DESIGN.textPrimary, textAlign: "right", ...valueSx }}>
        {value}
      </Typography>
    </Box>
  );
}

function resolveContext({ requisition, actionItem, selectedCandidate, enrichedPriority, priorityCandidate }) {
  const candidateCtx = selectedCandidate
    || (!requisition && !actionItem ? enrichedPriority || priorityCandidate : null);

  if (requisition) {
    return {
      mode: "requisition",
      name: requisition.title,
      subtitle: requisition.roleSubtitle || requisition.department,
      initials: requisition.code?.slice(-2) || "RQ",
      stageLabel: requisition.displayStatus,
      properties: [
        { label: "Requisition", value: requisition.code },
        { label: "Hiring Manager", value: requisition.hiringManager },
        { label: "Open / Target", value: `${requisition.funnelCurrent} / ${requisition.funnelTarget}` },
        { label: "Status", value: requisition.displayStatus },
        { label: "Next Action", value: requisition.nextAction }
      ],
      primaryRoute: "/requisitions",
      primaryLabel: "Open Requisition",
      todaysNextAction: requisition.nextAction
    };
  }

  if (actionItem) {
    return {
      mode: "action",
      name: actionItem.title,
      subtitle: actionItem.roleLine || actionItem.type,
      initials: candidateInitials(actionItem.title),
      stageLabel: "Active",
      properties: [
        { label: "Type", value: actionItem.displayType || actionItem.type },
        { label: "Priority", value: actionItem.slaBadge || actionItem.priorityLabel },
        { label: "Detail", value: actionItem.slaDetail || "—" }
      ],
      primaryRoute: actionItem.route || "/candidates",
      primaryLabel: "Take Action",
      todaysNextAction: resolveTodaysNextAction({ mode: "action", actionItem }),
      slaStatus: actionItem.slaBadge,
      slaTone: actionItem.slaTone
    };
  }

  if (candidateCtx) {
    const stage = candidateCtx.stage || candidateCtx.context || "—";
    return {
      mode: "candidate",
      name: candidateCtx.name,
      subtitle: candidateCtx.inspectorSubtitle,
      initials: candidateInitials(candidateCtx.name),
      stageLabel: stage,
      properties: [
        { label: "Requisition", value: candidateCtx.requisitionLabel || candidateCtx.requisition || "—" },
        { label: "Hiring Manager", value: candidateCtx.hiringManager || "—" },
        { label: "Interviewer", value: candidateCtx.interviewer || "—" },
        { label: "Interview Date", value: candidateCtx.interviewDateLabel || "—" },
        {
          label: "Current SLA",
          value: candidateCtx.slaStatus || "—",
          valueSx: candidateCtx.slaTone === "error" ? { color: DESIGN.red, fontWeight: 700 } : {}
        },
        { label: "Next Action", value: resolveTodaysNextAction({ mode: "candidate", candidate: candidateCtx }) || "—" }
      ],
      primaryRoute: "/candidates",
      primaryLabel: "Open Candidate Profile",
      todaysNextAction: resolveTodaysNextAction({ mode: "candidate", candidate: candidateCtx })
    };
  }

  return {
    mode: "empty",
    name: "No selection",
    subtitle: "Select an action, candidate, or requisition",
    initials: "—",
    stageLabel: null,
    properties: [],
    primaryRoute: "/candidates",
    primaryLabel: "Open Candidates",
    todaysNextAction: null
  };
}

function CockpitInspectorPanel({
  requisition,
  actionItem,
  selectedCandidate,
  priorityCandidate,
  enrichedPriority,
  onNavigate
}) {
  const ctx = resolveContext({ requisition, actionItem, selectedCandidate, enrichedPriority, priorityCandidate });

  return (
    <Box sx={{ ...PANEL_SHELL, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box sx={{ ...PANEL_HEADER, display: "flex", alignItems: "center", gap: 0.75 }}>
        <EnterpriseModuleIcon
          icon={MdPerson}
          module="candidates"
          density="sm"
          size={24}
          iconSize={14}
        />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em" }}>
          INSPECTOR
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${DESIGN.border}` }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Avatar sx={{ width: 40, height: 40, bgcolor: DESIGN.blueBg, color: DESIGN.blue, fontSize: 13, fontWeight: 700 }}>
            {ctx.initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN.textPrimary }} noWrap>
                {ctx.name}
              </Typography>
              {ctx.stageLabel && (
                <Chip
                  label={ctx.stageLabel}
                  size="small"
                  sx={{ height: 22, fontSize: 10, fontWeight: 600, bgcolor: DESIGN.greenBg, color: DESIGN.green, flexShrink: 0 }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary, mt: 0.25 }} noWrap>
              {ctx.subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 1.5, py: 1, flex: 1, minHeight: 0, overflow: "auto" }}>
        {ctx.properties.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary }}>Select an item to inspect details.</Typography>
        ) : (
          ctx.properties.map((row) => (
            <PropertyRow key={row.label} label={row.label} value={row.value} valueSx={row.valueSx} />
          ))
        )}

        {ctx.todaysNextAction && (
          <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${DESIGN.border}` }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: DESIGN.textSecondary, mb: 0.35 }}>
              Today&apos;s Next Action
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: DESIGN.blue }}>
              {ctx.todaysNextAction}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
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
            bgcolor: "#0B3D7A",
            "&:hover": { bgcolor: "#092F5E", boxShadow: "none" }
          }}
        >
          {ctx.primaryLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default CockpitInspectorPanel;
