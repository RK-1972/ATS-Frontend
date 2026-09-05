import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

import { useCopilotContext } from "../../components/copilot/CopilotContext";
import {
  EnterpriseSurface,
  ErrorState,
  LoadingState,
  WorkspaceHeader
} from "../../components/enterprise";
import ReportResults from "../../components/reports/ReportResults";
import StandardReportParameterPanel from "../../components/reports/StandardReportParameterPanel";
import ReportViewToggle from "../../components/reports/ReportViewToggle";
import ReportVisualization from "../../components/reports/ReportVisualization";
import ReportExportMenu from "../../components/reports/ReportExportMenu";
import useStandardReport from "../../hooks/useStandardReport";

function StandardReportPage() {
  const { reportCode } = useParams();
  const navigate = useNavigate();
  const { setCurrentPage } = useCopilotContext();
  const [viewMode, setViewMode] = useState("visual");

  const report = useStandardReport(reportCode);
  const defaultView = report.definition?.visualization?.default_view || "visual";
  const activeViewMode = report.loading ? viewMode : viewMode || defaultView;

  useEffect(() => {
    setCurrentPage(report.definition?.name || "Standard Report");
  }, [setCurrentPage, report.definition?.name]);

  const handleCustomize = () => {
    const prefill = report.buildBuilderPrefill();

    navigate("/reports/builder", {
      state: prefill ? { prefill } : undefined
    });
  };

  if (report.loading) {
    return <LoadingState message="Loading standard report…" />;
  }

  if (report.error) {
    return (
      <ErrorState
        title="Unable to load standard report"
        message={report.error}
        onRetry={report.loadDefinition}
      />
    );
  }

  const visualization = report.definition?.visualization;
  const totalCount = report.pagination.totalCount || 0;

  return (
    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate("/reports")}
          size="small"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Back to Report Center
        </Button>

        <Button
          variant="outlined"
          startIcon={<TuneOutlinedIcon />}
          onClick={handleCustomize}
          size="small"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Customize Report
        </Button>
      </Stack>

      <WorkspaceHeader
        title={report.definition?.name || "Standard Report"}
        subtitle={report.definition?.description || ""}
        dense
      />

      <Stack spacing={2} sx={{ minWidth: 0, maxWidth: "100%" }}>
        <StandardReportParameterPanel
          definition={report.definition}
          parameterFilters={report.parameterFilters}
          fieldMap={report.fieldMap}
          filterMetaMap={report.filterMetaMap}
          onUpdateParameter={report.handleUpdateParameter}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="text"
            onClick={report.clearParameterFilters}
            sx={{ textTransform: "none" }}
          >
            Clear Parameters
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={report.handleApplyParameters}
            disabled={report.generating}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Apply Parameters
          </Button>
        </Stack>

        {report.generateError ? <Alert severity="error">{report.generateError}</Alert> : null}
        {report.exportError ? <Alert severity="error">{report.exportError}</Alert> : null}

        <EnterpriseSurface sx={{ p: 2, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {totalCount.toLocaleString()} aggregate row{totalCount === 1 ? "" : "s"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {visualization ? (
                <ReportViewToggle value={activeViewMode} onChange={setViewMode} />
              ) : null}
              <ReportExportMenu
                disabled={!report.hasGenerated || report.generating}
                exporting={report.exporting}
                onExport={report.handleExport}
              />
            </Stack>
          </Stack>

          {activeViewMode === "visual" && visualization ? (
            <ReportVisualization
              config={visualization}
              results={report.results}
              loading={report.generating}
            />
          ) : (
            <ReportResults
              results={report.results}
              loading={report.generating}
              hasGenerated={report.hasGenerated}
              pagination={report.pagination}
              exporting={report.exporting}
              onExport={report.handleExport}
              onPageChange={report.handlePageChange}
              onAdjustFilters={report.handleApplyParameters}
              onClearFilters={report.clearParameterFilters}
            />
          )}
        </EnterpriseSurface>
      </Stack>
    </Box>
  );
}

export default StandardReportPage;
