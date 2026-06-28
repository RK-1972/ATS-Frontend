import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import AiGovernanceConsole from "../../components/platform-config/AiGovernanceConsole";

function AiConfigSection() {

  const {
    config,
    toggleAiFeature,
    updateAiGovernance
  } = useOutletContext();

  const aiModuleEnabled = config.modules.find(
    (m) => m.key === "ai"
  )?.enabled;

  return (

    <>

      <ConfigPageHeader
        title="AI governance"
        subtitle="Provider, model, confidence thresholds, token usage, audit logging, and cost controls. AI is advisory only."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "AI" }
        ]}
        statusChip={
          <Chip
            label="Advisory only"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <AiGovernanceConsole
        governance={config.ai_governance}
        features={config.ai_features}
        aiModuleEnabled={aiModuleEnabled}
        onUpdateGovernance={updateAiGovernance}
        onToggleFeature={toggleAiFeature}
      />

    </>

  );

}

export default AiConfigSection;
