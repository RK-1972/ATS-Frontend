import {
  Box,
  Typography,
  LinearProgress,
  Stack
} from "@mui/material";

function BudgetUtilizationBar({ utilized, total, label = "Budget utilization" }) {

  const pct = total > 0 ? Math.round((utilized / total) * 100) : 0;

  const color =
    pct > 90 ? "error" : pct > 75 ? "warning" : "primary";

  return (

    <Box>

      <Stack direction="row" justifyContent="space-between" mb={0.75}>

        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14 }}>
          {label}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={700}
          color={`${color}.main`}
          sx={{ fontSize: 14 }}
        >
          {pct}%
        </Typography>

      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        color={color}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "action.hover"
        }}
      />

    </Box>

  );

}

export default BudgetUtilizationBar;
