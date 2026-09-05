import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, Skeleton, Stack } from "@mui/material";

import { useCopilotContext } from "../../components/copilot/CopilotContext";
import {
  EnterpriseSurface,
  ErrorState,
  LoadingState,
  WorkspaceHeader
} from "../../components/enterprise";
import useReportBuilder from "../../hooks/useReportBuilder";
import ReportDatasetSelector from "../../components/reports/ReportDatasetSelector";
import ReportSelectedFields from "../../components/reports/ReportSelectedFields";
import ReportFilterBuilder from "../../components/reports/ReportFilterBuilder";
import ReportSortBuilder from "../../components/reports/ReportSortBuilder";
import ReportGroupBuilder from "../../components/reports/ReportGroupBuilder";
import ReportSemanticBuilder from "../../components/reports/ReportSemanticBuilder";
import ReportBuilderToolbar from "../../components/reports/ReportBuilderToolbar";
import ReportResults from "../../components/reports/ReportResults";
import ReportVisualization from "../../components/reports/ReportVisualization";

function ReportBuilderPage() {
  const location = useLocation();
  const { setCurrentPage } = useCopilotContext();
  const configSectionRef = useRef(null);
  const prefill = location.state?.prefill || null;

  const builder = useReportBuilder({ initialPrefill: prefill });

  useEffect(() => {
    setCurrentPage("Report Builder");
  }, [setCurrentPage]);

  const handleGenerate = () => {
    builder.generateReport(1, builder.pagination.pageSize);
  };

  const handleAdjustFilters = () => {
    configSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (builder.datasetsLoading) {
    return <LoadingState message="Loading report builder…" />;
  }

  if (builder.datasetsError) {
    return (
      <ErrorState
        title="Unable to load report builder"
        message={builder.datasetsError}
        onRetry={builder.loadDatasets}
      />
    );
  }

  if (!builder.datasets.length) {
    return (
      <ErrorState
        title="No report datasets available"
        message="Your role does not have access to any report datasets."
      />
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
      <WorkspaceHeader
        title="Report Builder"
        subtitle="Create governed ad hoc reports from Optalynx workforce and hiring data."
        dense
      />

      <Stack spacing={2} sx={{ minWidth: 0, maxWidth: "100%", width: "100%", alignItems: "stretch" }}>
        <EnterpriseSurface
          sx={{
            p: 2,
            minWidth: 0,
            maxWidth: "100%",
            width: "100%",
            boxSizing: "border-box",
            display: "block"
          }}
        >
          <ReportDatasetSelector
            datasets={builder.datasets}
            selectedDatasetCode={builder.selectedDatasetCode}
            onChange={builder.handleDatasetChange}
            loading={builder.datasetsLoading}
            description={
              builder.selectedDataset?.description ||
              builder.metadata?.dataset?.description ||
              ""
            }
          />
        </EnterpriseSurface>

        <EnterpriseSurface
          sx={{
            p: 2,
            minWidth: 0,
            maxWidth: "100%",
            width: "100%",
            boxSizing: "border-box",
            display: "block"
          }}
          ref={configSectionRef}
        >
          <Stack spacing={2} sx={{ minWidth: 0, maxWidth: "100%", width: "100%", alignItems: "stretch" }}>
            <Box sx={{ minWidth: 0, maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  fontSize: 12,
                  display: "block",
                  mb: 1.5
                }}
              >
                Report Configuration
              </Box>

              {builder.metadataLoading ? (
                <Stack spacing={1.5}>
                  <Skeleton variant="rounded" height={36} />
                  <Skeleton variant="rounded" height={72} />
                  <Skeleton variant="rounded" height={96} />
                </Stack>
              ) : builder.metadataError ? (
                <ErrorState
                  title="Unable to load dataset metadata"
                  message={builder.metadataError}
                  onRetry={() => builder.handleDatasetChange(builder.selectedDatasetCode)}
                />
              ) : (
                <Stack spacing={2} sx={{ minWidth: 0, maxWidth: "100%", width: "100%", alignItems: "stretch" }}>
                  <ReportSemanticBuilder
                    resultMode={builder.resultMode}
                    onResultModeChange={builder.setResultMode}
                    dimensions={builder.dimensions}
                    measures={builder.measures}
                    dimensionFields={builder.dimensionFields}
                    measureFields={builder.measureFields}
                    dateGrains={builder.dateGrains}
                    onAddDimension={builder.handleAddDimension}
                    onUpdateDimension={builder.handleUpdateDimension}
                    onRemoveDimension={builder.handleRemoveDimension}
                    onAddMeasure={builder.handleAddMeasure}
                    onUpdateMeasure={builder.handleUpdateMeasure}
                    onRemoveMeasure={builder.handleRemoveMeasure}
                  />

                  {builder.resultMode === "detail" ? (
                    <ReportSelectedFields
                      fields={builder.metadata?.fields || []}
                      selectedFieldCodes={builder.selectedFieldCodes}
                      onRemoveField={builder.handleRemoveField}
                      onAddField={builder.handleAddField}
                    />
                  ) : null}

                  <Divider />

                  <ReportFilterBuilder
                    filters={builder.filters}
                    filterMetaMap={builder.filterMetaMap}
                    fieldMap={builder.fieldMap}
                    onAddFilter={builder.handleAddFilter}
                    onUpdateFilter={builder.handleUpdateFilter}
                    onRemoveFilter={builder.handleRemoveFilter}
                  />

                  <Divider />

                  <ReportSortBuilder
                    sortRules={builder.sortRules}
                    sortableFields={builder.sortableFields}
                    onAddSort={builder.handleAddSort}
                    onUpdateSort={builder.handleUpdateSort}
                    onRemoveSort={builder.handleRemoveSort}
                  />

                  {builder.resultMode === "detail" && builder.groupableFields.length > 0 ? (
                    <>
                      <Divider />
                      <ReportGroupBuilder
                        groupableFields={builder.groupableFields}
                        groupByCodes={builder.groupByCodes}
                        onToggleGroupField={builder.handleToggleGroupField}
                      />
                    </>
                  ) : null}
                </Stack>
              )}
            </Box>

            <ReportBuilderToolbar
              onGenerate={handleGenerate}
              onReset={builder.resetBuilder}
              generating={builder.generating}
              disableGenerate={
                builder.metadataLoading ||
                (builder.resultMode === "detail"
                  ? !builder.selectedFieldCodes.length
                  : !builder.measures.some(
                      (measure) => measure.fieldCode && measure.aggregation
                    ))
              }
            />
          </Stack>
        </EnterpriseSurface>

        {builder.generateError ? (
          <ErrorState
            title="Report generation failed"
            message={builder.generateError}
            onRetry={handleGenerate}
          />
        ) : null}

        {builder.resultMode === "aggregate" && builder.hasGenerated ? (
          <EnterpriseSurface sx={{ p: 2 }}>
            <ReportVisualization
              config={{
                type: "bar",
                category_field: builder.results?.visualization?.category_field,
                value_field: builder.results?.visualization?.value_field,
                title: "Aggregate Preview"
              }}
              results={builder.results}
              loading={builder.generating}
            />
          </EnterpriseSurface>
        ) : null}

        <ReportResults
          results={builder.results}
          loading={builder.generating}
          hasGenerated={builder.hasGenerated}
          pagination={builder.pagination}
          exporting={builder.exporting}
          onExport={builder.exportReport}
          onPageChange={builder.handlePageChange}
          onAdjustFilters={handleAdjustFilters}
          onClearFilters={builder.clearFilters}
        />

        {builder.exportError ? (
          <ErrorState
            title="Report export failed"
            message={builder.exportError}
            onRetry={builder.clearExportError}
          />
        ) : null}
      </Stack>
    </Box>
  );
}

export default ReportBuilderPage;
