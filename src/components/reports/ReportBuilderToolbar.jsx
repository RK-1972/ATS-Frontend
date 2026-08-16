import { Button, Stack } from "@mui/material";

import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

function ReportBuilderToolbar({ onGenerate, onReset, generating, disableGenerate }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      justifyContent="flex-end"
      alignItems={{ xs: "stretch", sm: "center" }}
    >
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<RestartAltOutlinedIcon />}
        onClick={onReset}
        disabled={generating}
      >
        Reset
      </Button>
      <Button
        variant="contained"
        startIcon={<PlayArrowOutlinedIcon />}
        onClick={onGenerate}
        disabled={disableGenerate || generating}
        aria-label="Generate report"
      >
        {generating ? "Generating…" : "Generate Report"}
      </Button>
    </Stack>
  );
}

export default ReportBuilderToolbar;
