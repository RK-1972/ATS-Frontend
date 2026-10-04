import { useState } from "react";

import {
  Box,
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

      <Box
        role="group"
        aria-label="Workspace actions"
        sx={{
          display: "inline-flex",
          alignItems: "stretch",
          flexShrink: 0,
          height: { xs: 44, md: 36 },
          borderRadius: 1.75,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: 1,
          overflow: "hidden"
        }}
      >
        <Button
          size="small"
          variant="contained"
          disableElevation
          startIcon={<SaveOutlinedIcon />}
          onClick={onSave}
          disabled={isSaving}
          sx={{
            ...CANDIDATE_MOBILE_CONTAINED_BUTTON_SX,
            borderRadius: 0,
            boxShadow: "none",
            height: "100%",
            minHeight: "unset",
            px: { xs: 2, md: 1.75 },
            "&:hover": { boxShadow: "none" }
          }}
        >
          Save
        </Button>
        <Box
          sx={{
            width: "1px",
            alignSelf: "stretch",
            bgcolor: "divider",
            flexShrink: 0
          }}
        />
        <IconButton
          size="small"
          aria-label="More actions"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            ...CANDIDATE_MOBILE_ICON_BUTTON_SX,
            borderRadius: 0,
            height: "100%",
            width: { xs: 44, md: 36 },
            flexShrink: 0,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover"
            }
          }}
        >
          <MoreVertOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

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
      </Menu>
    </Stack>
  );
}

export default CandidateWorkspaceToolbar;
