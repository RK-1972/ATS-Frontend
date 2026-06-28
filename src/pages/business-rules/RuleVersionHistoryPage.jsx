import { useOutletContext } from "react-router-dom";

import { Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import RuleVersionHistoryTable from "../../components/business-rules/RuleVersionHistoryTable";

function RuleVersionHistoryPage() {

  const {
    config,
    rollbackVersion,
    compareVersion
  } = useOutletContext();

  const handleRollback = (versionId) => {
    rollbackVersion(versionId);
    window.alert(
      "Rollback queued. Publish changes to apply this version."
    );
  };

  const handleCompare = (versionId) => {

    const entry = compareVersion(versionId);

    if (entry) {
      window.alert(
        `Compare v${entry.version} with current:\n\n${entry.description}\n\nFull diff view will be available when the Rules Engine is connected.`
      );
    }

  };

  return (

    <>

      <ConfigPageHeader
        title="Rule Version History"
        subtitle="Published versions, change descriptions, rollback, and compare against current configuration."
        breadcrumbs={[
          { label: "Business Rules" },
          { label: "Version History" }
        ]}
        statusChip={
          <Chip
            label={`Current v${config.version_history[0]?.version}`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <ConfigSurface sx={{ p: 0, overflow: "hidden" }}>

        <RuleVersionHistoryTable
          versions={config.version_history}
          onRollback={handleRollback}
          onCompare={handleCompare}
        />

      </ConfigSurface>

    </>

  );

}

export default RuleVersionHistoryPage;
