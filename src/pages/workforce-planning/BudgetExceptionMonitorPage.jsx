import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import BudgetExceptionTable from "../../components/workforce-planning/BudgetExceptionTable";

function BudgetExceptionMonitorPage() {

  const { data } = useOutletContext();

  const pending = data.budget_exceptions.filter(
    (e) => e.workflow_status.includes("Pending")
  ).length;

  return (

    <>

      <ConfigPageHeader
        title="Budget exception monitor"
        subtitle="Offers exceeding approved budget trigger exception workflows before release."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Budget Exceptions" }
        ]}
        statusChip={
          <Chip
            label={`${pending} pending approval`}
            color="error"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      <BudgetExceptionTable exceptions={data.budget_exceptions} />

    </>

  );

}

export default BudgetExceptionMonitorPage;
