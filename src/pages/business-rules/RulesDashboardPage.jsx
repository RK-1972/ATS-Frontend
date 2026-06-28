import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

import { Chip, Typography, Box } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigMetricSlab from "../../components/platform-config/ConfigMetricSlab";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import CategoryGrid from "../../components/business-rules/CategoryGrid";

function RulesDashboardPage() {

  const navigate = useNavigate();
  const { config } = useOutletContext();

  const { kpis, meta } = config;

  const handleCategoryClick = (categoryLabel) => {
    navigate(
      `/business-rules/library?category=${encodeURIComponent(categoryLabel)}`
    );
  };

  return (

    <>

      <ConfigPageHeader
        title="Rules Dashboard"
        subtitle="Overview of business rules, approval policies, and publish status across the platform."
        breadcrumbs={[
          { label: "Business Rules" }
        ]}
        statusChip={
          <Chip
            label={meta.environment}
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
            key: "total",
            value: String(kpis.total_rules),
            label: "Total Rules"
          },
          {
            key: "active",
            value: String(kpis.active_rules),
            label: "Active Rules"
          },
          {
            key: "draft",
            value: String(kpis.draft_rules),
            label: "Draft Rules"
          },
          {
            key: "pending",
            value: String(kpis.pending_approval_rules),
            label: "Pending Approval"
          },
          {
            key: "published",
            value: new Date(meta.last_published).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" }
            ),
            label: "Last Published"
          }
        ]}
        highlightKey="active"
      />

      <Typography
        variant="subtitle2"
        fontWeight={700}
        mt={2}
        mb={1}
      >
        Rule Categories
      </Typography>

      <CategoryGrid
        categories={config.categories}
        onCategoryClick={handleCategoryClick}
      />

      <Box mt={2}>
        <ConfigSurface>
          <Typography variant="body2" color="text.secondary">
            {config.rules.filter((r) => r.status === "Active").length} active
            rules governing recruitment, offers, interviews, and budget
            exceptions. Use the Rule Library to manage individual rules or
            the Execution Preview to simulate approval outcomes.
          </Typography>
        </ConfigSurface>
      </Box>

    </>

  );

}

export default RulesDashboardPage;
