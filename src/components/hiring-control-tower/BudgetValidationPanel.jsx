import {
  Box,
  Typography,
  Chip,
  Stack,
  LinearProgress
} from "@mui/material";

import { MdArrowDownward } from "react-icons/md";

function BudgetGauge({ value, threshold, max = 30 }) {

  const pct = Math.min(100, (value / max) * 100);
  const thresholdPct = Math.min(100, (threshold / max) * 100);

  return (

    <Box sx={{ position: "relative", pt: 1.5, pb: 0.5 }}>

      <LinearProgress
        variant="determinate"
        value={pct}
        color={value > threshold ? "error" : "success"}
        sx={{ height: 10, borderRadius: 1 }}
      />

      <Box
        sx={{
          position: "absolute",
          left: `${thresholdPct}%`,
          top: 12,
          width: 3,
          height: 18,
          bgcolor: "warning.main",
          borderRadius: 0.5,
          transform: "translateX(-1px)"
        }}
      />

      <Stack direction="row" justifyContent="space-between" mt={1}>
        <Typography variant="caption" color="text.secondary">
          0%
        </Typography>
        <Typography variant="caption" color="warning.main" fontWeight={700}>
          Threshold {threshold}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {value}% variance
        </Typography>
      </Stack>

    </Box>

  );

}

function ApprovalPathStep({ step, isLast }) {

  const statusColor =
    step.status === "Running"
      ? "primary"
      : step.status === "Completed"
        ? "success"
        : "default";

  return (

    <Stack alignItems="center" spacing={0.5} py={0.25}>

      <Chip
        label={step.step}
        size="small"
        color={statusColor}
        variant={step.status === "Waiting" ? "outlined" : "filled"}
        sx={{ height: 26, fontWeight: 700, fontSize: 12 }}
      />

      <Typography variant="caption" color="text.secondary">
        {step.owner}
      </Typography>

      <Typography variant="caption" fontWeight={700} color={`${statusColor}.main`}>
        {step.status}
      </Typography>

      {!isLast && (
        <Box sx={{ color: "text.disabled", my: 0.5 }}>
          <MdArrowDownward size={18} />
        </Box>
      )}

    </Stack>

  );

}

function BudgetValidationPanel({ budget, approvalPath }) {

  const exceedsThreshold =
    budget.variance_pct > budget.variance_threshold_pct;

  return (

    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        px: 2,
        py: 2
      }}
    >

      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Budget Validation
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
          gap: 3,
          alignItems: "start"
        }}
      >

        <Box>

          <Stack direction="row" spacing={3} mb={2} flexWrap="wrap" useFlexGap>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                Approved Budget
              </Typography>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {budget.approved_budget_lpa} LPA
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                Offered Budget
              </Typography>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {budget.offered_ctc_lpa} LPA
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                Variance
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                lineHeight={1.2}
                color={exceedsThreshold ? "error.main" : "success.main"}
              >
                +{budget.variance_pct}%
              </Typography>
            </Box>

          </Stack>

          <Typography variant="caption" fontWeight={700} mb={0.75} display="block">
            Variance Gauge
          </Typography>

          <BudgetGauge
            value={budget.variance_pct}
            threshold={budget.variance_threshold_pct}
          />

          {exceedsThreshold && (
            <Chip
              label="Budget Exception Workflow Triggered"
              size="small"
              color="error"
              variant="outlined"
              sx={{ mt: 1.5, fontWeight: 600 }}
            />
          )}

        </Box>

        <Box sx={{ minWidth: 140 }}>

          <Typography variant="caption" fontWeight={700} mb={1} display="block">
            Approval Path
          </Typography>

          <Stack alignItems="center">
            {approvalPath.map((step, index) => (
              <ApprovalPathStep
                key={step.step}
                step={step}
                isLast={index === approvalPath.length - 1}
              />
            ))}
          </Stack>

        </Box>

      </Box>

    </Box>

  );

}

export default BudgetValidationPanel;
