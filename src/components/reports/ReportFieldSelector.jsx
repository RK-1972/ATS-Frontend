import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

function dataTypeLabel(dataType) {
  if (!dataType) {
    return "";
  }

  return dataType.replace("_", " ");
}

function ReportFieldSelector({ fields, selectedFieldCodes, onAddField }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const availableFields = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (fields || []).filter((field) => {
      if (selectedFieldCodes.includes(field.code)) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        field.label.toLowerCase().includes(query) ||
        field.code.toLowerCase().includes(query)
      );
    });
  }, [fields, selectedFieldCodes, search]);

  const handleOpen = () => {
    setSearch("");
    setOpen(true);
  };

  const handleSelect = (fieldCode) => {
    onAddField(fieldCode);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<AddOutlinedIcon />}
        onClick={handleOpen}
        aria-label="Add report field"
      >
        Add Field
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>Add Report Field</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search fields"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 1.5 }}
            aria-label="Search report fields"
          />

          <List dense sx={{ maxHeight: 320, overflowY: "auto" }}>
            {availableFields.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No additional fields available.
                </Typography>
              </Box>
            ) : (
              availableFields.map((field) => (
                <ListItemButton key={field.code} onClick={() => handleSelect(field.code)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox edge="start" tabIndex={-1} disableRipple checked={false} />
                  </ListItemIcon>
                  <ListItemText
                    primary={field.label}
                    secondary={`${field.code} · ${dataTypeLabel(field.data_type)}`}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportFieldSelector;
