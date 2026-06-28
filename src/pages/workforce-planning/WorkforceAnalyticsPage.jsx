import { useOutletContext } from "react-router-dom";

import { Grid, Stack, Typography, Box } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import ConfigMetricSlab from "../../components/platform-config/ConfigMetricSlab";
import DepartmentUtilizationChart from "../../components/workforce-planning/DepartmentUtilizationChart";
import BudgetTrendChart from "../../components/workforce-planning/BudgetTrendChart";
import { formatCurrency } from "@/utils/formatCurrency";

function WorkforceAnalyticsPage() {

  const { data } = useOutletContext();
  const { analytics } = data;

  const summaryMetrics = [
    {
      key: "approved",
      label: "Total approved",
      value: formatCurrency(analytics.budget_vs_actual.approved)
    },
    {
      key: "actual",
      label: "Actual spend",
      value: formatCurrency(analytics.budget_vs_actual.actual)
    },
    {
      key: "savings",
      label: "Savings",
      value: formatCurrency(analytics.savings)
    },
    {
      key: "sla",
      label: "Approval SLA",
      value: `${analytics.approval_sla_days} days`
    }
  ];

  return (

    <>

      <ConfigPageHeader
        title="Workforce analytics"
        subtitle="Budget vs actual, savings, overspend, and department-wise utilization."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Analytics" }
        ]}
      />

      <Stack spacing={1.5}>

        <ConfigMetricSlab metrics={summaryMetrics} highlightKey="actual" />

        <Grid container spacing={1.5} alignItems="stretch">

          <Grid size={{ xs: 12, lg: 8 }}>
            <BudgetTrendChart monthlyTrend={analytics.monthly_trend} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>

            <ConfigSurface sx={{ height: "100%" }}>

              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 14 }}>
                Forecast vs actual
              </Typography>

              <Stack
                direction={{ xs: "row", sm: "column" }}
                spacing={{ xs: 2, sm: 1.5 }}
                mt={1.5}
              >

                <Box flex={1}>

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    Year-end forecast
                  </Typography>

                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: 18 }}>
                    {formatCurrency(analytics.budget_vs_actual.forecast)}
                  </Typography>

                </Box>

                <Box flex={1}>

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    Overspend risk
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={700}
                    color="error.main"
                    sx={{ fontSize: 18 }}
                  >
                    {formatCurrency(analytics.overspend)}
                  </Typography>

                </Box>

              </Stack>

            </ConfigSurface>

          </Grid>

        </Grid>

        <DepartmentUtilizationChart
          departments={analytics.department_utilization}
        />

      </Stack>

    </>

  );

}

export default WorkforceAnalyticsPage;
