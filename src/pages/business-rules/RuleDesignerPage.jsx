import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { Chip, Button } from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import RuleDesignerForm from "../../components/business-rules/RuleDesignerForm";

function RuleDesignerPage() {

  const {
    draftRule,
    startNewRule,
    loadRuleForEdit,
    updateDraftRule,
    updateDraftListField,
    addDraftListItem,
    saveDraftRule
  } = useOutletContext();

  useEffect(() => {

    if (!draftRule) {
      loadRuleForEdit("rule-001");
    }

  }, [draftRule, loadRuleForEdit]);

  return (

    <>

      <ConfigPageHeader
        title="Rule Designer"
        subtitle="Define trigger events, conditions, and actions for business rules. Advisory configuration — no code required."
        breadcrumbs={[
          { label: "Business Rules" },
          { label: "Rule Designer" }
        ]}
        statusChip={
          draftRule ? (
            <Chip
              label={draftRule.status}
              color={
                draftRule.status === "Active"
                  ? "success"
                  : draftRule.status === "Draft"
                    ? "warning"
                    : "info"
              }
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ) : null
        }
      />

      <ConfigSurface>

        {!draftRule && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddOutlinedIcon />}
            onClick={startNewRule}
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Create new rule
          </Button>
        )}

        <RuleDesignerForm
          rule={draftRule}
          onUpdate={updateDraftRule}
          onUpdateList={updateDraftListField}
          onAddListItem={addDraftListItem}
          onSave={saveDraftRule}
        />

      </ConfigSurface>

    </>

  );

}

export default RuleDesignerPage;
