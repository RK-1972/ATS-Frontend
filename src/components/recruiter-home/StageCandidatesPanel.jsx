import { Box, Typography, Chip } from "@mui/material";
import { DESIGN, PANEL_SHELL, ROW_INTERACTIVE, TRANSITION_MS } from "./recruiterHomeTokens";

/** Compact candidate list shown directly below pipeline when a stage is selected. */
function StageCandidatesPanel({
  candidates = [],
  selectedStage,
  selectedId,
  onSelect
}) {
  if (!selectedStage) return null;

  const visible = candidates.slice(0, 8);

  return (
    <Box
      sx={{
        ...PANEL_SHELL,
        borderTop: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.45,
          borderBottom: `1px solid ${DESIGN.border}`,
          bgcolor: "#F9FAFB"
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: DESIGN.textSecondary }}>
          {selectedStage} · {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
        </Typography>
      </Box>

      {visible.length === 0 ? (
        <Box sx={{ px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: 12, color: DESIGN.textSecondary }}>
            No candidates at this stage.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: visible.length > 4 ? 120 : "none", overflowY: visible.length > 4 ? "auto" : "visible" }}>
          {visible.map((candidate, index) => {
            const isSelected = selectedId === candidate.id;
            return (
              <Box
                key={candidate.id}
                component="button"
                type="button"
                onClick={() => onSelect?.(candidate)}
                sx={{
                  ...ROW_INTERACTIVE,
                  display: "flex",
                  width: "100%",
                  m: 0,
                  px: 1.5,
                  py: 0.45,
                  border: 0,
                  borderBottom: index < visible.length - 1 ? `1px solid ${DESIGN.border}` : 0,
                  bgcolor: isSelected ? "#EFF8FF" : "transparent",
                  textAlign: "left",
                  font: "inherit",
                  color: "inherit",
                  alignItems: "center",
                  gap: 0.75,
                  transition: `background-color ${TRANSITION_MS}`,
                  "&:hover": { bgcolor: isSelected ? "#EFF8FF" : "#F9FAFB" }
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                  {candidate.name}
                </Typography>
                <Chip
                  label={candidate.stage}
                  size="small"
                  sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
                />
                <Typography sx={{ fontSize: 11, color: DESIGN.textSecondary, flexShrink: 0 }} noWrap>
                  {candidate.requisition}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default StageCandidatesPanel;
