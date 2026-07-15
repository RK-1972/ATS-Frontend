import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton
} from "@mui/material";
import {
  MdWorkOutline,
  MdEdit,
  MdShare,
  MdMoreHoriz,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdMailOutline,
  MdChevronRight
} from "react-icons/md";
import { DESIGN, PANEL_SHELL, ROW_INTERACTIVE } from "./recruiterHomeTokens";
import { candidateInitials } from "./recruiterHomeUiHelpers";

function LifecycleStepper({ stages = [], currentStage }) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5, py: 1 }}>
      {stages.map((stage, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <Box key={stage} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, minWidth: 0 }}>
            {done ? (
              <MdCheckCircle size={20} color={DESIGN.green} />
            ) : active ? (
              <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${DESIGN.blue}`, bgcolor: DESIGN.blueBg }} />
            ) : (
              <MdRadioButtonUnchecked size={20} color={DESIGN.textMuted} />
            )}
            <Typography sx={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? DESIGN.blue : DESIGN.textMuted, textAlign: "center" }} noWrap>
              {stage}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function CockpitRequisitionSidebar({ requisition, onNavigate, onSelectCandidate }) {
  if (!requisition) return null;

  const priorityStyle = requisition.priority === "High"
    ? { bg: DESIGN.redBg, color: DESIGN.red }
    : { bg: "#F2F4F7", color: "#344054" };

  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        width: { xs: "100%", lg: 300 },
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        overflow: "hidden"
      }}
    >
      <Box sx={{ bgcolor: "#0B3D7A", color: "#fff", px: 1.5, py: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <MdWorkOutline size={20} />
          <Stack direction="row" spacing={0.25}>
            <IconButton size="small" sx={{ color: "#fff", p: 0.5 }} aria-label="Edit"><MdEdit size={16} /></IconButton>
            <IconButton size="small" sx={{ color: "#fff", p: 0.5 }} aria-label="Share"><MdShare size={16} /></IconButton>
            <IconButton size="small" sx={{ color: "#fff", p: 0.5 }} aria-label="More"><MdMoreHoriz size={16} /></IconButton>
          </Stack>
        </Stack>
        <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{requisition.title}</Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.85, mt: 0.25 }}>
          {requisition.code} · {requisition.department || "—"}
        </Typography>
        <Stack direction="row" spacing={0.5} mt={1}>
          <Chip label={requisition.displayStatus} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", color: "#fff" }} />
          {requisition.priority === "High" && (
            <Chip label="HIGH PRIORITY" size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: priorityStyle.bg, color: priorityStyle.color }} />
          )}
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
        <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${DESIGN.border}` }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em", mb: 0.75 }}>
            BRIEFING NOTE
          </Typography>
          {requisition.briefingNote ? (
            <>
              <Typography sx={{ fontSize: 12, color: DESIGN.textPrimary, fontStyle: "italic", lineHeight: 1.5, mb: 1 }}>
                &ldquo;{requisition.briefingNote}&rdquo;
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: DESIGN.blueBg, color: DESIGN.blue }}>
                  {candidateInitials(requisition.hiringManager)}
                </Avatar>
                <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary }}>
                  {requisition.hiringManager} · Hiring Manager
                </Typography>
              </Stack>
            </>
          ) : (
            <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary }}>No briefing note available.</Typography>
          )}
        </Box>

        <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${DESIGN.border}` }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em", mb: 0.5 }}>
            HIRING LIFECYCLE
          </Typography>
          <LifecycleStepper stages={requisition.lifecycleStages} currentStage={requisition.lifecycleStage} />
        </Box>

        <Box sx={{ px: 1.5, py: 1.25 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: DESIGN.textSecondary, letterSpacing: "0.04em", mb: 0.75 }}>
            TOP CANDIDATES IN FUNNEL
          </Typography>
          {requisition.topCandidates?.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary }}>No candidates in funnel.</Typography>
          ) : (
            requisition.topCandidates.map((c) => (
              <Box
                key={c.id}
                component="button"
                type="button"
                onClick={() => onSelectCandidate?.(c)}
                sx={{
                  ...ROW_INTERACTIVE,
                  display: "flex",
                  width: "100%",
                  m: 0,
                  mb: 0.5,
                  p: 1,
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 1.5,
                  bgcolor: "#fff",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Avatar sx={{ width: 32, height: 32, fontSize: 11, bgcolor: DESIGN.blueBg, color: DESIGN.blue }}>
                  {candidateInitials(c.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>{c.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary }} noWrap>{c.stageLabel}</Typography>
                </Box>
                <MdChevronRight size={18} color={DESIGN.textMuted} />
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ px: 1.5, py: 1.25, borderTop: `1px solid ${DESIGN.border}`, display: "flex", gap: 0.75 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onNavigate?.("/candidates")}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, py: 0.85, bgcolor: "#0B3D7A", boxShadow: "none", "&:hover": { bgcolor: "#092F5E", boxShadow: "none" } }}
        >
          View All Candidates
        </Button>
        <IconButton sx={{ border: `1px solid ${DESIGN.border}`, borderRadius: 1.5 }} aria-label="Email hiring manager">
          <MdMailOutline size={20} />
        </IconButton>
      </Box>
    </Box>
  );
}

export default CockpitRequisitionSidebar;
