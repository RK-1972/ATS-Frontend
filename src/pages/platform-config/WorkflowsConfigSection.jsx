import { useOutletContext } from "react-router-dom";

import { Grid, Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import WorkflowPipelineCard from "../../components/platform-config/WorkflowPipelineCard";

function WorkflowsConfigSection() {

  const { config, toggleWorkflow, insertWorkflowStage } = useOutletContext();

  const handleConfigure = (workflow) => {

    if (workflow.key === "candidate") {
      const inserted = insertWorkflowStage(
        "candidate",
        "Technical Assessment",
        "L1"
      );

      if (inserted) {
        window.alert(
          'Stage "Technical Assessment" inserted after "L1" in Candidate Workflow. Hiring Control Tower and workflow previews will update immediately.'
        );
        return;
      }
    }

    window.alert(
      `Workflow designer for "${workflow.title}" will be available when the Workflow Engine is connected.`
    );

  };

  return (

    <>

      <ConfigPageHeader
        title="Workflow configuration"
        subtitle="Approval chains, stage pipelines, SLA rules, and publish status for each business process."
        breadcrumbs={[
          { label: "Platform Configuration" },
          { label: "Workflows" }
        ]}
        statusChip={
          <Chip
            label="Workflow Engine · Preview"
            color="secondary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      <Grid container spacing={1.5}>

        {config.workflows.map((workflow) => (

          <Grid
            key={workflow.key}
            size={{ xs: 12, lg: 6 }}
          >

            <WorkflowPipelineCard
              title={workflow.title}
              description={workflow.description}
              enabled={workflow.enabled}
              steps={workflow.steps}
              approvals={workflow.approvals}
              status={workflow.status}
              version={workflow.version}
              sla_hours={workflow.sla_hours}
              stages={workflow.stages}
              approval_stages={workflow.approval_stages}
              onToggle={() => toggleWorkflow(workflow.key)}
              onConfigure={() => handleConfigure(workflow)}
            />

          </Grid>

        ))}

      </Grid>

    </>

  );

}

export default WorkflowsConfigSection;
