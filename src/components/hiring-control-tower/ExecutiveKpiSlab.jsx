import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import DenseM3MotionCard from "../enterprise/DenseM3MotionCard";

import {
  MdAccountBalanceWallet,
  MdGroups,
  MdHelpOutline,
  MdHourglassTop,
  MdLoop,
  MdTimer,
  MdTrendingUp
} from "react-icons/md";

import { buildExecutiveKpiCards } from "./executiveKpiPresentation";

const KPI_ICONS = {
  activeProcesses: MdLoop,
  pendingApprovals: MdHourglassTop,
  clarifications: MdHelpOutline,
  budgetExceptions: MdAccountBalanceWallet,
  avgApprovalTimeHours: MdTimer,
  avgTimeToHireDays: MdTrendingUp,
  recruiterWorkload: MdGroups
};

function ExecutiveKpiSlab({
  kpiData,
  loading = false,
  error = "",
  liveModeEnabled = false
}) {

  const theme = useTheme();
  const { denseMotionCard } = theme.tokens;

  if (!liveModeEnabled) {
    return (
      <DenseM3MotionCard
        value="—"
        label="Executive KPIs"
        subtitle="Live API required"
        unavailable
        sx={{ maxWidth: 360 }}
      />
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: denseMotionCard.minHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          border: 1,
          borderColor: "error.light",
          borderRadius: `${theme.tokens.radius.md}px`,
          bgcolor: "background.paper",
          px: 2,
          py: 1.5,
          minHeight: denseMotionCard.minHeight
        }}
      >
        <Typography variant="body2" color="error.main">
          {error}
        </Typography>
      </Box>
    );
  }

  const metrics = buildExecutiveKpiCards(kpiData);

  return (

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(4, minmax(0, 1fr))",
          xl: "repeat(7, minmax(0, 1fr))"
        },
        gap: denseMotionCard.gap,
        width: "100%",
        minWidth: 0,
        maxWidth: "100%"
      }}
    >
      {metrics.map((metric) => (
        <DenseM3MotionCard
          key={metric.key}
          icon={KPI_ICONS[metric.key] ?? MdTrendingUp}
          value={metric.value}
          label={metric.label}
          subtitle={metric.subtitle}
          highlight={metric.highlight}
          unavailable={metric.value === "Not available"}
          descriptionId={`kpi-detail-${metric.key}`}
          detail={{
            title: metric.label,
            value: metric.value,
            rows: metric.detailRows
          }}
        />
      ))}
    </Box>

  );

}

export default ExecutiveKpiSlab;
