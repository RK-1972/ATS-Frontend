import {
  Paper,
  Stack,
  Button,
  Typography,
  Chip
} from "@mui/material";

import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

function ConfigSaveBar({

  isDirty,
  onSave,
  onDiscard,
  environment = "Production"

}) {

  return (

    <Paper
      elevation={4}
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        px: { xs: 2, sm: 2.5 },
        py: 1.5,
        borderRadius: 0,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
      >

        <Stack direction="row" spacing={1} alignItems="center">

          <Chip
            label={environment}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />

          <Typography variant="body2" color="text.secondary">
            {isDirty
              ? "Unsaved configuration changes"
              : "All changes published"}
          </Typography>

        </Stack>

        <Stack direction="row" spacing={1}>

          <Button
            variant="outlined"
            startIcon={<RestartAltOutlinedIcon />}
            onClick={onDiscard}
            disabled={!isDirty}
          >
            Discard
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={onSave}
            disabled={!isDirty}
          >
            Publish changes
          </Button>

        </Stack>

      </Stack>

    </Paper>

  );

}

export default ConfigSaveBar;
