import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function EnterpriseSurface({ children, sx = {}, elevation = 0, padding = true }) {
  const theme = useTheme();
  const { radius } = theme.tokens;

  return (
    <Paper
      elevation={elevation}
      sx={{
        p: padding ? { xs: 1.5, sm: 2 } : 0,
        borderRadius: `${radius.md}px`,
        border: elevation === 0 ? 1 : 0,
        borderColor: "divider",
        bgcolor: "background.paper",
        ...sx
      }}
    >
      {children}
    </Paper>
  );
}

export default EnterpriseSurface;
