import { Box, Button, Stack, TextField, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DESIGN } from "./recruiterHomeTokens";
import { DATE_PRESETS } from "@/pages/recruiter-home/recruiterHomeDateFilter";

function RecruiterCockpitHeader({
  activePreset,
  draftFromDate,
  draftToDate,
  onPresetChange,
  onDraftFromChange,
  onDraftToChange,
  onApply,
  onReset
}) {
  const presetButtonSx = {
    border: 0,
    textTransform: "none",
    fontWeight: 600,
    fontSize: 12,
    px: 1.5,
    py: 0.5,
    borderRadius: "6px !important",
    color: DESIGN.textSecondary,
    "&.Mui-selected": {
      bgcolor: "#fff",
      color: DESIGN.textPrimary,
      boxShadow: "0 1px 2px rgba(16,24,40,0.08)"
    }
  };

  const dateFieldSx = {
    "& .MuiInputBase-root": { fontSize: 12, height: 32 },
    "& .MuiInputLabel-root": { fontSize: 11 },
    "& input": { py: 0.5, px: 1 }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1, flexShrink: 0, gap: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: DESIGN.textPrimary, letterSpacing: "-0.02em" }}>
          Recruiter Cockpit
        </Typography>
        <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary, mt: 0.25 }}>
          Your daily operations at a glance
        </Typography>
      </Box>

      <Stack spacing={0.75} alignItems="flex-end" flexShrink={0}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={activePreset}
          onChange={(_, value) => value && onPresetChange?.(value)}
          sx={{
            bgcolor: "#F2F4F7",
            borderRadius: 2,
            p: 0.25,
            "& .MuiToggleButton-root": presetButtonSx
          }}
        >
          <ToggleButton value={DATE_PRESETS.today}>Today</ToggleButton>
          <ToggleButton value={DATE_PRESETS.last7}>Last 7 Days</ToggleButton>
          <ToggleButton value={DATE_PRESETS.last30}>Last 30 Days</ToggleButton>
        </ToggleButtonGroup>

        <Typography sx={{ fontSize: 11, fontWeight: 600, color: DESIGN.textSecondary, letterSpacing: "0.06em" }}>
          OR
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={draftFromDate || ""}
            onChange={(e) => onDraftFromChange?.(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, ...dateFieldSx }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={draftToDate || ""}
            onChange={(e) => onDraftToChange?.(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150, ...dateFieldSx }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={onApply}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, px: 2, minHeight: 32, boxShadow: "none" }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onReset}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, px: 2, minHeight: 32 }}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default RecruiterCockpitHeader;
