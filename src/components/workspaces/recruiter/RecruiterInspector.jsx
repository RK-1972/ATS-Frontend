/**
 * WAVE 2 — DISABLED (Enterprise Recovery Sprint)
 * Preserved for future Wave 2 work. Not imported by the active workspace page.
 */
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  InspectorDrawer,
  EntityHeader,
  StatusChip,
  TaskSummary,
  ActivityTimeline,
  EmptyState
} from "@/components/enterprise";
import { PIPELINE_STAGES, normalizeStage } from "@/enterprise/recruiterSelectors";

function TabPanel({ active, value, children }) {
  if (active !== value) return null;
  return <Box pt={2}>{children}</Box>;
}

function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography fontSize={14}>{value || "—"}</Typography>
    </Box>
  );
}

function RecruiterInspector({
  open,
  onClose,
  recruiterUi,
  setRecruiterUi,
  selectedRequisition,
  selectedCandidate,
  entityTasks,
  entityAuditEvents,
  onCompleteTask,
  onAdvanceStage
}) {
  const activeTab = recruiterUi.inspectorTab || "details";

  const title = selectedCandidate
    ? `Candidate · ${selectedCandidate.candidate_code || selectedCandidate.candidate_id}`
    : selectedRequisition
      ? selectedRequisition.requisition_code
      : "Inspector";

  const subtitle = selectedCandidate
    ? `${selectedCandidate.requisition_code} · ${selectedCandidate.stage_name}`
    : selectedRequisition?.position_title;

  const statusValue = selectedCandidate?.stage_name || selectedRequisition?.req_status;

  const handleTabChange = (_, value) => {
    setRecruiterUi({ inspectorTab: value });
  };

  const normalizedStage = normalizeStage(selectedCandidate?.stage_name);
  const currentStageIndex = PIPELINE_STAGES.indexOf(normalizedStage);

  const nextStage = currentStageIndex >= 0 && currentStageIndex < PIPELINE_STAGES.length - 1
    ? PIPELINE_STAGES[currentStageIndex + 1]
    : null;

  return (
    <InspectorDrawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      {(selectedRequisition || selectedCandidate) && (
        <EntityHeader
          title={title}
          subtitle={subtitle}
          statusChip={statusValue ? <StatusChip status={statusValue} variant="soft" /> : null}
          meta={selectedRequisition ? [
            { label: "Department", value: selectedRequisition.department },
            { label: "Location", value: selectedRequisition.location }
          ] : [
            { label: "Requisition", value: selectedCandidate?.requisition_code },
            { label: "Source", value: selectedCandidate?.source_type }
          ]}
          actions={selectedCandidate && nextStage ? (
            <Button
              size="small"
              variant="contained"
              onClick={() => onAdvanceStage(
                selectedCandidate.mapping_id || selectedCandidate.map_id,
                nextStage
              )}
            >
              Advance to {nextStage}
            </Button>
          ) : null}
        />
      )}

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}
      >
        <Tab label="Details" value="details" />
        <Tab label={`Tasks (${entityTasks.length})`} value="tasks" />
        <Tab label="Activity" value="activity" />
        <Tab label="Audit" value="audit" />
      </Tabs>

      <TabPanel active={activeTab} value="details">
        {!selectedRequisition && !selectedCandidate && (
          <EmptyState
            title="Nothing selected"
            description="Select a row in the grid to inspect entity details."
          />
        )}

        {selectedRequisition && (
          <Stack spacing={1.5}>
            <DetailRow label="Position" value={selectedRequisition.position_title} />
            <DetailRow label="Department" value={selectedRequisition.department} />
            <DetailRow label="Location" value={selectedRequisition.location} />
            <DetailRow label="Grade" value={selectedRequisition.grade} />
            <DetailRow label="Hiring Manager" value={selectedRequisition.hiring_manager} />
            <DetailRow label="Status" value={selectedRequisition.req_status} />
            <DetailRow label="Headcount" value={selectedRequisition.headcount} />
          </Stack>
        )}

        {selectedCandidate && (
          <Stack spacing={1.5} mt={selectedRequisition ? 2 : 0}>
            <DetailRow label="Stage" value={selectedCandidate.stage_name} />
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel id="inspector-stage-select">Set stage</InputLabel>
              <Select
                labelId="inspector-stage-select"
                label="Set stage"
                value={selectedCandidate.stage_name || "Applied"}
                onChange={(event) => onAdvanceStage(
                  selectedCandidate.mapping_id || selectedCandidate.map_id,
                  event.target.value
                )}
              >
                {PIPELINE_STAGES.map((stage) => (
                  <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <DetailRow label="Requisition" value={selectedCandidate.requisition_code} />
            <DetailRow label="Source" value={selectedCandidate.source_type} />
            <DetailRow
              label="Applied"
              value={
                selectedCandidate.applied_on
                  ? new Date(selectedCandidate.applied_on).toLocaleDateString()
                  : "—"
              }
            />
          </Stack>
        )}
      </TabPanel>

      <TabPanel active={activeTab} value="tasks">
        {entityTasks.length === 0 ? (
          <EmptyState
            title="No related tasks"
            description="Tasks linked to this requisition or candidate will appear here."
          />
        ) : (
          <TaskSummary
            tasks={entityTasks}
            onComplete={onCompleteTask}
            maxItems={8}
          />
        )}
      </TabPanel>

      <TabPanel active={activeTab} value="activity">
        {entityAuditEvents.length === 0 ? (
          <EmptyState
            title="No entity activity"
            description="Session audit events for this entity will appear here."
          />
        ) : (
          <ActivityTimeline
            events={entityAuditEvents}
            emptyMessage="No activity recorded for this entity."
          />
        )}
      </TabPanel>

      <TabPanel active={activeTab} value="audit">
        {entityAuditEvents.length === 0 ? (
          <EmptyState
            title="No audit history"
            description="Enterprise audit entries scoped to this entity will appear here when recorded in-session."
          />
        ) : (
          <ActivityTimeline
            events={entityAuditEvents}
            emptyMessage="No audit history for this entity."
          />
        )}
      </TabPanel>
    </InspectorDrawer>
  );
}

export default RecruiterInspector;
