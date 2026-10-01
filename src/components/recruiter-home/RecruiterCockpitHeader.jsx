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
    "& .MuiInputBase-root": {
      fontSize: 12,
      height: { xs: 44, md: 32 }
    },
    "& .MuiInputLabel-root": { fontSize: 11 },
    "& input": { py: 0.5, px: 1 }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "flex-start" },
        justifyContent: "space-between",
        mb: 1,
        flexShrink: 0,
        gap: { xs: 1.5, md: 2 },
        width: "100%",
        minWidth: 0
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 24, lineHeight: 1.2, color: DESIGN.textPrimary, letterSpacing: "-0.02em" }}>
          Recruiter Cockpit
        </Typography>
        <Typography sx={{ fontSize: 13, color: DESIGN.textSecondary, mt: 0.25 }}>
          Your daily operations at a glance
        </Typography>
      </Box>

      <Stack
        spacing={0.75}
        alignItems={{ xs: "stretch", md: "flex-end" }}
        flexShrink={0}
        sx={{ width: { xs: "100%", md: "auto" }, minWidth: 0, maxWidth: "100%" }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={activePreset}
          onChange={(_, value) => value && onPresetChange?.(value)}
          sx={{
            bgcolor: "#F2F4F7",
            borderRadius: 2,
            p: 0.25,
            flexWrap: { xs: "wrap", md: "nowrap" },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "stretch", md: "flex-start" },
            "& .MuiToggleButtonGroup-grouped": {
              flex: { xs: "1 1 calc(33.33% - 4px)", md: "0 1 auto" },
              minWidth: { xs: 0, md: "auto" }
            },
            "& .MuiToggleButton-root": {
              ...presetButtonSx,
              minHeight: { xs: 44, md: "auto" },
              py: { xs: 1, md: 0.5 }
            }
          }}
        >
          <ToggleButton value={DATE_PRESETS.today}>Today</ToggleButton>
          <ToggleButton value={DATE_PRESETS.last7}>Last 7 Days</ToggleButton>
          <ToggleButton value={DATE_PRESETS.last30}>Last 30 Days</ToggleButton>
        </ToggleButtonGroup>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: DESIGN.textSecondary,
            letterSpacing: "0.06em",
            textAlign: { xs: "center", md: "right" }
          }}
        >
          OR
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <TextField
            label="From Date"
            type="date"
            size="small"
            value={draftFromDate || ""}
            onChange={(e) => onDraftFromChange?.(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", md: 150 }, flex: { sm: "1 1 140px" }, ...dateFieldSx }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            value={draftToDate || ""}
            onChange={(e) => onDraftToChange?.(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", md: 150 }, flex: { sm: "1 1 140px" }, ...dateFieldSx }}
          />
          <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="contained"
              size="small"
              onClick={onApply}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                px: 2,
                minHeight: { xs: 44, md: 32 },
                flex: { xs: 1, md: "0 0 auto" },
                boxShadow: "none"
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onReset}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                px: 2,
                minHeight: { xs: 44, md: 32 },
                flex: { xs: 1, md: "0 0 auto" }
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default RecruiterCockpitHeader;
