import { useState } from "react";

import {
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

import {
  CANDIDATE_MOBILE_CONTAINED_BUTTON_SX,
  CANDIDATE_MOBILE_ICON_BUTTON_SX
} from "@/components/candidate-workspace/candidateWorkspaceTokens";

function CandidateWorkspaceToolbar({
  profileCompletion = 0,
  onSave,
  isSaving = false,
  onOverflowAction
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (action) => {
    setAnchorEl(null);
    onOverflowAction?.(action);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
      <Chip
        size="small"
        label={`${profileCompletion}% complete`}
        color="primary"
        variant="outlined"
        sx={{ display: { xs: "none", sm: "inline-flex" } }}
      />

      <Button
        size="small"
        variant="contained"
        startIcon={<SaveOutlinedIcon />}
        onClick={onSave}
        disabled={isSaving}
        sx={CANDIDATE_MOBILE_CONTAINED_BUTTON_SX}
      >
        Save
      </Button>

      <IconButton
        size="small"
        aria-label="More actions"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={CANDIDATE_MOBILE_ICON_BUTTON_SX}
      >
        <MoreVertOutlinedIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleMenu("history")}>
          <ListItemIcon>
            <HistoryOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>History</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenu("audit")}>
          <ListItemIcon>
            <FactCheckOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Audit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenu("version")}>
          <ListItemIcon>
            <LayersOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Version</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}

export default CandidateWorkspaceToolbar;
