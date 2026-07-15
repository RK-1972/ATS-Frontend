import { Box, Typography, Link } from "@mui/material";
import { DESIGN, PANEL_SHELL, PIPELINE_HEIGHT, TRANSITION_MS } from "./recruiterHomeTokens";

const STAGE_LABELS = {
  Applied: "Applied",
  Screening: "Screening",
  "L1 Interview": "L1 Interview",
  "L2 Interview": "L2 Interview",
  "Client Interview": "Client Interview",
  Offer: "Offer",
  Joined: "Joined"
};

function stageStyle(key, count, selected) {
  if (selected) {
    return {
      bg: DESIGN.blueBg,
      border: DESIGN.blue,
      color: DESIGN.blue,
      countBg: DESIGN.blue,
      countColor: "#fff",
      shadow: "0 0 0 2px #B2DDFF, 0 2px 6px rgba(23, 92, 211, 0.18)"
    };
  }
  if (key === "Applied" && count > 0) {
    return { bg: "#EFF8FF", border: "#84CAFF", color: DESIGN.blue, countBg: DESIGN.pipelineApplied, countColor: "#fff", shadow: "none" };
  }
  if (key === "L1 Interview" && count > 0) {
    return { bg: DESIGN.yellowBg, border: DESIGN.yellowBorder, color: "#B54708", countBg: "#F79009", countColor: "#fff", shadow: "none" };
  }
  if (key === "Joined" && count > 0) {
    return { bg: DESIGN.greenBg, border: "#6CE9A6", color: DESIGN.green, countBg: DESIGN.pipelineJoined, countColor: "#fff", shadow: "none" };
  }
  if (count > 0) {
    return { bg: "#F9FAFB", border: DESIGN.border, color: DESIGN.textPrimary, countBg: "#667085", countColor: "#fff", shadow: "none" };
  }
  return { bg: "#F9FAFB", border: DESIGN.border, color: DESIGN.textMuted, countBg: "#EAECF0", countColor: DESIGN.textSecondary, shadow: "none" };
}

function PipelineConnector() {
  return (
    <Box
      sx={{
        flex: "0 0 16px",
        height: 2,
        bgcolor: "#D0D5DD",
        borderRadius: 1,
        mx: 0.25,
        alignSelf: "center"
      }}
    />
  );
}

function PipelineStageBox({ stageKey, label, count, selected, onClick }) {
  const style = stageStyle(stageKey, count, selected);
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        m: 0,
        p: 0,
        border: `1.5px solid ${style.border}`,
        borderRadius: 1.5,
        bgcolor: style.bg,
        cursor: "pointer",
        font: "inherit",
        minWidth: 108,
        flex: "1 1 0",
        maxWidth: 140,
        overflow: "hidden",
        textAlign: "left",
        boxShadow: style.shadow,
        transition: `border-color ${TRANSITION_MS}, box-shadow ${TRANSITION_MS}, transform ${TRANSITION_MS}`,
        transform: selected ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          filter: "brightness(0.98)",
          boxShadow: selected ? style.shadow : "0 1px 4px rgba(16, 24, 40, 0.08)"
        }
      }}
    >
      <Box sx={{ px: 1.25, py: 0.55, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: style.color, lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Box
          sx={{
            minWidth: 22,
            height: 22,
            px: 0.5,
            borderRadius: 1,
            bgcolor: style.countBg,
            color: style.countColor,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {count}
        </Box>
      </Box>
    </Box>
  );
}

function AtsPipelineTrace({ stages = [], selectedKey, onSelect, onClearFilter, onViewFull }) {
  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        px: 1.25,
        py: 0.45,
        height: PIPELINE_HEIGHT,
        maxHeight: PIPELINE_HEIGHT,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.35, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: DESIGN.textPrimary }}>
          ATS Stage
        </Typography>
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onViewFull || onClearFilter}
          sx={{ fontSize: 12, fontWeight: 600, color: DESIGN.blue, border: 0, bgcolor: "transparent", cursor: "pointer" }}
        >
          View full pipeline
        </Link>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flex: 1, minHeight: 0, overflowX: "auto" }}>
        {stages.map((stage, index) => (
          <Box key={stage.key} sx={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 118 }}>
            <PipelineStageBox
              stageKey={stage.key}
              label={STAGE_LABELS[stage.key] || stage.label}
              count={stage.count}
              selected={selectedKey === stage.key}
              onClick={() => onSelect?.(stage.key)}
            />
            {index < stages.length - 1 && <PipelineConnector />}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default AtsPipelineTrace;
