import { useState } from "react";

import {
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from "@mui/material";

import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";

const EXPORT_OPTIONS = [
  {
    format: "xlsx",
    label: "Excel (.xlsx)",
    icon: TableChartOutlinedIcon
  },
  {
    format: "csv",
    label: "CSV (.csv)",
    icon: TextSnippetOutlinedIcon
  },
  {
    format: "pdf",
    label: "PDF (.pdf)",
    icon: PictureAsPdfOutlinedIcon
  }
];

function ReportExportMenu({ disabled = false, exporting = false, onExport }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format) => {
    handleClose();
    await onExport?.(format);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        disabled={disabled || exporting}
        onClick={handleOpen}
        startIcon={
          exporting ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <DownloadOutlinedIcon fontSize="small" />
          )
        }
        endIcon={!exporting ? <ArrowDropDownOutlinedIcon fontSize="small" /> : null}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-controls={open ? "report-export-menu" : undefined}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        {exporting ? "Exporting…" : "Download"}
      </Button>

      <Menu
        id="report-export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {EXPORT_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <MenuItem key={option.format} onClick={() => handleExport(option.format)}>
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export default ReportExportMenu;
