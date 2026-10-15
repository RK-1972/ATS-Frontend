import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, TextField } from "@mui/material";

function WorkforcePlanningSectionSearch({
  label,
  placeholder,
  value,
  onChange,
  onClear
}) {
  const handleClear = () => {
    if (typeof onClear === "function") {
      onClear();
    }
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      size="small"
      fullWidth
      sx={{ flex: 1, minWidth: 0 }}
      slotProps={{
        input: {
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="Clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      }}
    />
  );
}

export default WorkforcePlanningSectionSearch;
