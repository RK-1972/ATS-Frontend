import { useOutletContext } from "react-router-dom";

import {
  Grid,
  Stack,
  Typography,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import ConfigMetricSlab from "../../components/platform-config/ConfigMetricSlab";
import BudgetUtilizationBar from "../../components/workforce-planning/BudgetUtilizationBar";
import { formatCurrency } from "@/utils/formatCurrency";
import WorkforceStatusChip from "../../components/workforce-planning/WorkforceStatusChip";

function SectionTitle({ children }) {

  return (
    <Typography
      variant="body2"
      fontWeight={700}
      sx={{ fontSize: 14, mb: 1 }}
    >
      {children}
    </Typography>
  );

}

function WorkforceDashboardPage() {

  const { data } = useOutletContext();
  const { dashboard, meta } = data;

  const metrics = [
    {
      key: "headcount",
      label: "Approved headcount",
      value: dashboard.approved_headcount
    },
    {
      key: "filled",
      label: "Filled positions",
      value: dashboard.filled_positions,
      subtitle: `${Math.round((dashboard.filled_positions / dashboard.approved_headcount) * 100)}% filled`
    },
    {
      key: "vacant",
      label: "Vacant positions",
      value: dashboard.vacant_positions,
      subtitle: "Ready to hire"
    },
    {
      key: "utilization",
      label: "Budget utilization",
      value: `${dashboard.budget_utilization_pct}%`,
      subtitle: formatCurrency(dashboard.budget_consumed)
    }
  ];

  return (

    <>

      <ConfigPageHeader
        title="Workforce Dashboard"
        subtitle="Manpower budget and headcount governance — every requisition starts with an approved position."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Dashboard" }
        ]}
        statusChip={
          <Chip
            label={meta.fiscal_year}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      <Stack spacing={1.5}>

        <ConfigMetricSlab
          metrics={metrics}
          highlightKey="vacant"
        />

        <Grid container spacing={1.5}>

          <Grid size={{ xs: 12, lg: 7 }}>

            <ConfigSurface>

              <BudgetUtilizationBar
                utilized={dashboard.budget_consumed}
                total={dashboard.total_approved_budget}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                mt={1.5}
                pt={1.5}
                borderTop={1}
                borderColor="divider"
              >

                <Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    Total approved budget
                  </Typography>

                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: 18 }}>
                    {formatCurrency(dashboard.total_approved_budget)}
                  </Typography>

                </Box>

                <Box textAlign="right">

                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                    Remaining
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={700}
                    color="primary.main"
                    sx={{ fontSize: 18 }}
                  >
                    {formatCurrency(
                      dashboard.total_approved_budget -
                        dashboard.budget_consumed
                    )}
                  </Typography>

                </Box>

              </Stack>

            </ConfigSurface>

          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>

            <ConfigSurface sx={{ height: "100%" }}>

              <SectionTitle>Budget exceptions</SectionTitle>

              <List disablePadding dense>

                {dashboard.budget_exceptions_summary.map((ex, i) => (

                  <Box key={ex.id}>

                    {i > 0 && <Divider />}

                    <ListItem
                      disableGutters
                      sx={{ py: 0.75 }}
                      secondaryAction={<WorkforceStatusChip status={ex.status} />}
                    >

                      <ListItemText
                        primary={`${ex.position} · +${ex.variance_pct}%`}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: 13,
                          noWrap: true
                        }}
                      />

                    </ListItem>

                  </Box>

                ))}

              </List>

            </ConfigSurface>

          </Grid>

        </Grid>

        <ConfigSurface>

          <SectionTitle>Upcoming hiring</SectionTitle>

          <List disablePadding dense>

            {dashboard.upcoming_hiring.map((item, i) => (

              <Box key={item.id}>

                {i > 0 && <Divider />}

                <ListItem disableGutters sx={{ py: 0.75 }}>

                  <ListItemText
                    primary={`${item.position} · ${item.department}`}
                    secondary={`${item.headcount} HC · Target ${new Date(item.target_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />

                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                    sx={{ fontSize: 13, flexShrink: 0, ml: 1 }}
                  >
                    {formatCurrency(item.budget)}
                  </Typography>

                </ListItem>

              </Box>

            ))}

          </List>

        </ConfigSurface>

      </Stack>

    </>

  );

}

export default WorkforceDashboardPage;
