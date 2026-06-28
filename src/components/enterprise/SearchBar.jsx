import { TextField, InputAdornment } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useTheme } from "@mui/material/styles";

function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  width = 280,
  size = "small",
  ...props
}) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: `${radius.sm}px`,
            fontSize: theme.tokens.typography.secondary.fontSize,
            height: 32
          }
        }
      }}
      sx={{ width: { xs: "100%", sm: width } }}
      {...props}
    />
  );
}

export default SearchBar;
