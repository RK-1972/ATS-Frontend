import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import RuleSimulatorPanel from "../../components/business-rules/RuleSimulatorPanel";

function RuleSimulatorPage() {

  const {
    simulationInput,
    simulationResult,
    updateSimulationInput,
    runSimulation
  } = useOutletContext();

  return (

    <>

      <ConfigPageHeader
        title="Rule Execution Preview"
        subtitle="Simulate rule evaluation against offer parameters to preview triggered rules, approvers, and SLA."
        breadcrumbs={[
          { label: "Business Rules" },
          { label: "Execution Preview" }
        ]}
        statusChip={
          <Chip
            label="Simulator"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <RuleSimulatorPanel
        input={simulationInput}
        result={simulationResult}
        onUpdateInput={updateSimulationInput}
        onRun={runSimulation}
      />

    </>

  );

}

export default RuleSimulatorPage;
