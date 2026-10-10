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

  const { slotProps: slotPropsFromProps, sx: sxFromProps, ...restProps } = props;

  return (
    <TextField
      {...restProps}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      slotProps={{
        ...slotPropsFromProps,
        input: {
          ...slotPropsFromProps?.input,
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: `${radius.sm}px`,
            fontSize: theme.tokens.typography.secondary.fontSize,
            height: 32,
            ...slotPropsFromProps?.input?.sx
          }
        }
      }}
      sx={{ width: { xs: "100%", sm: width }, ...sxFromProps }}
    />
  );
}

export default SearchBar;
