import { TextField, InputAdornment } from "@mui/material";
import { MdSearch } from "react-icons/md";

function RecruiterWorkbenchSearch({ value = "", onChange, placeholder = "Search candidates or requisitions…" }) {
  return (
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <MdSearch size={14} />
          </InputAdornment>
        ),
        sx: { fontSize: 11, height: 26, py: 0 }
      }}
      sx={{
        "& .MuiOutlinedInput-root": { py: 0 },
        "& .MuiInputAdornment-root": { mr: 0.5 }
      }}
    />
  );
}

export default RecruiterWorkbenchSearch;
