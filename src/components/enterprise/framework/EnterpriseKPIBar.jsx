import { Box, Paper, Typography } from "@mui/material";

function EnterpriseKPIBar({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: `repeat(${Math.min(items.length, 3)}, minmax(0, 1fr))`,
          md: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
          lg: `repeat(${Math.min(items.length, 6)}, minmax(0, 1fr))`
        },
        gap: 1.5
      }}
    >
      {items.map((item, index) => (
        <Paper
          key={`${item.label}-${index}`}
          elevation={0}
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            minWidth: 0
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            color={item.color || "text.primary"}
            sx={{
              lineHeight: 1.2,
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {item.value ?? "—"}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            display="block"
            sx={{ mt: 0.25 }}
          >
            {item.label}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

export default EnterpriseKPIBar;
