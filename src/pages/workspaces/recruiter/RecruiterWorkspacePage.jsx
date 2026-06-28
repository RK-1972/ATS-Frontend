/**
 * Recruiter Workspace — Wave 1 recovery baseline.
 * Wave 2 enhancements are preserved in RecruiterWorkspacePage.wave2.jsx and disabled components.
 */
import { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  WorkspaceHeader,
  MetricSlab,
  SplitView,
  EnterpriseDataGrid,
  TaskSummary,
  InspectorDrawer,
  EntityHeader,
  EnterpriseSurface,
  StatusChip,
  LoadingState,
  EmptyState,
  SearchBar,
  EnterpriseToolbar
} from "@/components/enterprise";

const REQUISITION_COLUMNS = [
  {
    field: "requisition_code",
    headerName: "Requisition",
    flex: 1,
    minWidth: 140
  },
  {
    field: "position_title",
    headerName: "Position",
    flex: 1.4,
    minWidth: 180
  },
  {
    field: "department",
    headerName: "Department",
    flex: 1,
    minWidth: 120
  },
  {
    field: "location",
    headerName: "Location",
    flex: 0.8,
    minWidth: 100
  },
  {
    field: "req_status",
    headerName: "Status",
    flex: 0.8,
    minWidth: 110,
    renderCell: ({ value }) => <StatusChip status={value} variant="soft" />
  },
  {
    field: "headcount",
    headerName: "HC",
    width: 70,
    type: "number"
  }
];

const PIPELINE_COLUMNS = [
  {
    field: "candidate_code",
    headerName: "Candidate",
    flex: 1,
    minWidth: 120,
    valueGetter: (_, row) => row.candidate_code || `ID ${row.candidate_id}`
  },
  {
    field: "requisition_code",
    headerName: "Requisition",
    flex: 1,
    minWidth: 130
  },
  {
    field: "stage_name",
    headerName: "Stage",
    flex: 1,
    minWidth: 130,
    renderCell: ({ value }) => <StatusChip status={value} variant="soft" />
  },
  {
    field: "source_type",
    headerName: "Source",
    flex: 0.8,
    minWidth: 100
  }
];

function RecruiterWorkspacePage() {
  const workspace = useOutletContext();
  const {
    user,
    executiveMetrics,
    pipelineMetrics,
    requisitions,
    pipeline,
    tasks,
    selectedRequisition,
    selectedCandidate,
    recruiterUi,
    setRecruiterUi,
    completeTask,
    refreshRecruitment,
    isLoading
  } = workspace;

  useEffect(() => {
    refreshRecruitment();
  }, [refreshRecruitment]);

  const gridRows = useMemo(() => {
    if (recruiterUi.activeTab === "pipeline") {
      return pipeline.map((row) => ({
        ...row,
        id: row.mapping_id || row.map_id || `${row.requisition_code}-${row.candidate_id}`
      }));
    }

    return requisitions.map((row) => ({
      ...row,
      id: row.requisition_code
    }));
  }, [recruiterUi.activeTab, pipeline, requisitions]);

  const handleRowClick = (params) => {
    if (recruiterUi.activeTab === "pipeline") {
      setRecruiterUi({
        selectedCandidateMapId: params.row.mapping_id || params.row.map_id,
        selectedRequisitionCode: params.row.requisition_code,
        inspectorOpen: true
      });
      return;
    }

    setRecruiterUi({
      selectedRequisitionCode: params.row.requisition_code,
      selectedCandidateMapId: null,
      inspectorOpen: true
    });
  };

  const handleCompleteTask = (task) => {
    completeTask(task.task_id || task.id, "Completed from Recruiter Workspace");
    setRecruiterUi({
      toastMessage: "Task marked complete.",
      toastSeverity: "success"
    });
  };

  const inspectorTitle = selectedCandidate
    ? (selectedCandidate.candidate_code || `Candidate ${selectedCandidate.candidate_id}`)
    : (selectedRequisition?.position_title || selectedRequisition?.requisition_code || "Details");

  const inspectorSubtitle = selectedCandidate
    ? `${selectedRequisition?.requisition_code || selectedCandidate.requisition_code || ""} · ${selectedCandidate.stage_name || ""}`.trim()
    : (selectedRequisition?.requisition_code || "");

  return (
    <>
      <WorkspaceHeader
        title="Recruiter Workspace"
        subtitle={`${user?.full_name || "Recruiter"} · What requires my attention today?`}
        breadcrumbs={[
          { label: "Workspaces" },
          { label: "Recruiter" }
        ]}
        actions={(
          <Button
            size="small"
            startIcon={<RefreshOutlinedIcon />}
            onClick={refreshRecruitment}
          >
            Refresh
          </Button>
        )}
      />

      <Box mb={2}>
        <MetricSlab
          metrics={executiveMetrics}
          highlightKey="candidates"
        />
      </Box>

      <Box mb={2}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          display="block"
          mb={1}
        >
          Recruitment Pipeline
        </Typography>
        <MetricSlab metrics={pipelineMetrics} />
      </Box>

      <Box mb={2}>
        <EnterpriseToolbar
          left={(
            <ToggleButtonGroup
              exclusive
              size="small"
              value={recruiterUi.activeTab}
              onChange={(_, value) => {
                if (value) {
                  setRecruiterUi({ activeTab: value });
                }
              }}
            >
              <ToggleButton value="requisitions">
                Requisitions ({requisitions.length})
              </ToggleButton>
              <ToggleButton value="pipeline">
                Pipeline ({pipeline.length})
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          right={(
            <SearchBar
              value={recruiterUi.searchQuery}
              onChange={(event) => setRecruiterUi({ searchQuery: event.target.value })}
              placeholder="Search requisitions or candidates…"
            />
          )}
        />
      </Box>

      <SplitView
        primary={(
          isLoading ? (
            <LoadingState message="Loading workspace data from Enterprise Store…" />
          ) : gridRows.length === 0 ? (
            <EnterpriseSurface>
              <EmptyState
                title="No records match your view"
                description="Adjust search or refresh to load assigned requisitions and pipeline entries."
                actionLabel="Refresh data"
                onAction={refreshRecruitment}
              />
            </EnterpriseSurface>
          ) : (
            <EnterpriseDataGrid
              rows={gridRows}
              columns={
                recruiterUi.activeTab === "pipeline"
                  ? PIPELINE_COLUMNS
                  : REQUISITION_COLUMNS
              }
              height={420}
              onRowClick={handleRowClick}
            />
          )
        )}
        secondary={(
          <TaskSummary
            tasks={tasks}
            onComplete={handleCompleteTask}
            maxItems={5}
          />
        )}
        primaryFlex={1.6}
        secondaryFlex={1}
        minSecondaryWidth={300}
      />

      <InspectorDrawer
        open={recruiterUi.inspectorOpen}
        onClose={() => setRecruiterUi({ inspectorOpen: false })}
        title={inspectorTitle}
        subtitle={inspectorSubtitle}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          {selectedRequisition && (
            <EntityHeader
              title={selectedRequisition.position_title || selectedRequisition.requisition_code}
              subtitle={selectedRequisition.requisition_code}
              statusChip={<StatusChip status={selectedRequisition.req_status} variant="soft" />}
            />
          )}

          {selectedRequisition && (
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Department:</strong> {selectedRequisition.department || "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {selectedRequisition.location || "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Headcount:</strong> {selectedRequisition.headcount ?? "—"}
              </Typography>
            </Stack>
          )}

          {selectedCandidate && (
            <>
              <EntityHeader
                title={selectedCandidate.candidate_code || `Candidate ${selectedCandidate.candidate_id}`}
                subtitle={selectedCandidate.requisition_code}
                statusChip={<StatusChip status={selectedCandidate.stage_name} variant="soft" />}
              />
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Stage:</strong> {selectedCandidate.stage_name || "—"}
                </Typography>
                <Typography variant="body2">
                  <strong>Source:</strong> {selectedCandidate.source_type || "—"}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </InspectorDrawer>
    </>
  );
}

export default RecruiterWorkspacePage;
