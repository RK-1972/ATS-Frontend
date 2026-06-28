import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

import {
  Grid,
  Typography,
  Stack,
  Chip,
  Box
} from "@mui/material";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigMetricSlab from "../../components/platform-config/ConfigMetricSlab";
import { CONFIG_SECTIONS } from "../../components/platform-config/PlatformConfigSidebar";

function PlatformConfigurationOverview() {

  const navigate = useNavigate();
  const { config } = useOutletContext();

  const activeModules = config.modules.filter(
    (m) => m.enabled
  ).length;

  const activeWorkflows = config.workflows.filter(
    (w) => w.enabled
  ).length;

  const activeChannels = config.notification_channels.filter(
    (c) => c.enabled
  ).length;

  const sectionStats = {
    overview: `${activeModules} modules configured`,
    modules: `${activeModules} of ${config.modules.length} active`,
    workflows: `${activeWorkflows} published`,
    budget: config.budget.budget_approval_required
      ? "Approval enforced"
      : "Approval optional",
    notifications: `${activeChannels} channels`,
    ai: config.modules.find((m) => m.key === "ai")?.enabled
      ? "Governance active"
      : "Module off",
    roles: `${config.role_visibility.roles.length} roles`
  };

  return (

    <>

      <ConfigPageHeader
        title="Platform Configuration Center"
        subtitle="Configure modules, workflows, notifications, AI governance, and role visibility — without code changes."
        breadcrumbs={[
          { label: "Platform Configuration" }
        ]}
        statusChip={
          <Chip
            label={config.meta.environment}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <ConfigMetricSlab
        metrics={[
          {
            key: "org",
            value: config.meta.org_name.split(" ")[0],
            label: "Organization"
          },
          {
            key: "modules",
            value: `${activeModules}/${config.modules.length}`,
            label: "Active modules"
          },
          {
            key: "workflows",
            value: String(activeWorkflows),
            label: "Published workflows"
          },
          {
            key: "published",
            value: new Date(config.meta.last_published).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" }
            ),
            label: "Last published"
          }
        ]}
        highlightKey="modules"
      />

      <Typography
        variant="subtitle2"
        fontWeight={700}
        mt={2}
        mb={1}
      >
        Configuration areas
      </Typography>

      <Grid container spacing={1.5}>

        {CONFIG_SECTIONS.filter((s) => s.key !== "overview").map((section) => {

          const Icon = section.icon;

          return (

            <Grid
              key={section.key}
              size={{ xs: 12, sm: 6, lg: 4 }}
            >

              <Box
                onClick={() => navigate(section.path)}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  height: "100%",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: 1
                  }
                }}
              >

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >

                  <Stack direction="row" spacing={1.5} alignItems="center">

                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: "rgba(31, 59, 99, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.main"
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>

                    <Box>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {section.label}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {sectionStats[section.key]}
                      </Typography>

                    </Box>

                  </Stack>

                  <ChevronRightIcon
                    sx={{ fontSize: 20 }}
                    color="action"
                  />

                </Stack>

              </Box>

            </Grid>

          );

        })}

      </Grid>

    </>

  );

}

export default PlatformConfigurationOverview;
