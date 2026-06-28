import { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  WorkspaceHeader,
  MetricSlab,
  SplitView,
  EnterpriseDataGrid,
  TaskSummary,
  AIInsightCard,
  ActivityTimeline,
  EnterpriseSurface,
  StatusChip,
  LoadingState,
  EmptyState,
  CommandBar
} from "@/components/enterprise";
import RecruiterContextToolbar from "@/components/workspaces/recruiter/RecruiterContextToolbar";
import RecruiterInspector from "@/components/workspaces/recruiter/RecruiterInspector";

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

function exportRowsToCsv(rows, filename) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]).filter((key) => key !== "id");
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => {
      const value = row[header] ?? "";
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function RecruiterWorkspacePage() {
  const workspace = useOutletContext();
  const {
    user,
    executiveMetrics,
    pipelineMetrics,
    requisitions,
    pipeline,
    tasks,
    activityEvents,
    aiInsights,
    statusOptions,
    pipelineStages,
    selectedRequisition,
    selectedCandidate,
    entityTasks,
    entityAuditEvents,
    recruiterUi,
    setRecruiterUi,
    completeTask,
    refreshRecruitment,
    handleKpiClick,
    handleAdvanceStage,
    rawRequisitionCount,
    rawPipelineCount,
    isLoading
  } = workspace;

  const selectedRowIds = recruiterUi.selectedRowIds ?? [];

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
        inspectorOpen: true,
        inspectorTab: "details"
      });
      return;
    }

    setRecruiterUi({
      selectedRequisitionCode: params.row.requisition_code,
      selectedCandidateMapId: null,
      inspectorOpen: true,
      inspectorTab: "details"
    });
  };

  const handleCompleteTask = (task) => {
    completeTask(task.task_id || task.id, "Completed from Recruiter Workspace");
    setRecruiterUi({
      toastMessage: "Task marked complete.",
      toastSeverity: "success"
    });
  };

  const handleBulkExport = () => {
    const selected = gridRows.filter((row) =>
      selectedRowIds.includes(String(row.id))
    );
    exportRowsToCsv(
      selected.length ? selected : gridRows,
      recruiterUi.activeTab === "pipeline"
        ? "recruiter-pipeline.csv"
        : "recruiter-requisitions.csv"
    );
  };

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
          onMetricClick={handleKpiClick}
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
        <MetricSlab
          metrics={pipelineMetrics}
          onMetricClick={handleKpiClick}
        />
      </Box>

      <RecruiterContextToolbar
        recruiterUi={recruiterUi}
        setRecruiterUi={setRecruiterUi}
        requisitionCount={rawRequisitionCount}
        pipelineCount={rawPipelineCount}
        statusOptions={statusOptions}
        pipelineStages={pipelineStages}
      />

      {selectedRowIds.length > 0 && (
        <CommandBar
          sx={{ mb: 2, bgcolor: "action.hover" }}
          left={(
            <Typography fontSize={13} fontWeight={600}>
              {selectedRowIds.length} selected
            </Typography>
          )}
          right={(
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleBulkExport}
              >
                Export
              </Button>
              <Button
                size="small"
                onClick={() => setRecruiterUi({ selectedRowIds: [] })}
              >
                Clear selection
              </Button>
            </Stack>
          )}
        />
      )}

      <SplitView
        primary={(
          isLoading ? (
            <LoadingState message="Loading workspace data from Enterprise Store…" />
          ) : gridRows.length === 0 ? (
            <EnterpriseSurface>
              <EmptyState
                title="No records match your view"
                description="Adjust filters, clear KPI drill-down, or refresh to load assigned requisitions and pipeline entries."
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
              checkboxSelection
              rowSelectionModel={selectedRowIds}
              onRowSelectionModelChange={(model) => setRecruiterUi({
                selectedRowIds: model.map(String)
              })}
              onRowClick={handleRowClick}
            />
          )
        )}
        secondary={(
          <Stack spacing={2}>
            <TaskSummary
              tasks={tasks}
              onComplete={handleCompleteTask}
              maxItems={5}
            />
            <AIInsightCard insights={aiInsights} />
          </Stack>
        )}
        primaryFlex={1.6}
        secondaryFlex={1}
        minSecondaryWidth={300}
      />

      <Box mt={2}>
        <EnterpriseSurface>
          <Typography fontWeight={600} fontSize={16} mb={1.5}>
            Workspace Activity
          </Typography>
          <ActivityTimeline
            events={activityEvents}
            emptyMessage="Recruitment and interview audit events will appear here."
          />
        </EnterpriseSurface>
      </Box>

      <RecruiterInspector
        open={recruiterUi.inspectorOpen}
        onClose={() => setRecruiterUi({ inspectorOpen: false })}
        recruiterUi={recruiterUi}
        setRecruiterUi={setRecruiterUi}
        selectedRequisition={selectedRequisition}
        selectedCandidate={selectedCandidate}
        entityTasks={entityTasks}
        entityAuditEvents={entityAuditEvents}
        onCompleteTask={handleCompleteTask}
        onAdvanceStage={handleAdvanceStage}
      />
    </>
  );
}

export default RecruiterWorkspacePage;
