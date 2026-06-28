import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import BudgetGovernanceConsole from "../../components/platform-config/BudgetGovernanceConsole";

function BudgetConfigSection() {

  const { config, updateBudget } = useOutletContext();

  return (

    <>

      <ConfigPageHeader
        title="Budget & workforce governance"
        subtitle="Approval policies, variance thresholds, exception workflows, escalation rules, and organizational defaults."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Budget & Workforce" }
        ]}
        statusChip={
          <Chip
            label={
              config.budget.budget_approval_required
                ? "Approval enforced"
                : "Approval optional"
            }
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <BudgetGovernanceConsole
        budget={config.budget}
        onUpdate={updateBudget}
      />

    </>

  );

}

export default BudgetConfigSection;
