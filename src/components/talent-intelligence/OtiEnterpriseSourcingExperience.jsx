import {
  Alert,
  Box,
  Button,
  Pagination,
  Stack,
  Typography
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import { EmptyState, LoadingState } from "@/components/enterprise";
import OtiAiRunInsights from "./OtiAiRunInsights";
import OtiExternalProviderMetrics from "./OtiExternalProviderMetrics";
import OtiEnterpriseSourcingShell from "./OtiEnterpriseSourcingShell";
import OtiProviderCatalogPanel from "./OtiProviderCatalogPanel";
import OtiRunHistoryPanel from "./OtiRunHistoryPanel";
import OtiRunStatusBanner from "./OtiRunStatusBanner";
import OtiSourcingConfigPanel from "./OtiSourcingConfigPanel";
import OtiUnifiedDiscoveryPanel from "./OtiUnifiedDiscoveryPanel";
import { useOtiSourcingWorkspace } from "./useOtiSourcingWorkspace";

function OtiEnterpriseSourcingExperience({
  requisitionCode,
  headerSlot = null,
  compact = false,
  entryPoint = "requisition"
}) {
  const workspace = useOtiSourcingWorkspace(requisitionCode, entryPoint);

  const {
    availability,
    queryText,
    setQueryText,
    includeExternal,
    setIncludeExternal,
    includeSemantic,
    setIncludeSemantic,
    includeAiAssist,
    setIncludeAiAssist,
    isRunning,
    isRefreshing,
    runMeta,
    runFailed,
    results,
    externalLeads,
    pagination,
    pastRuns,
    error,
    internalPage,
    setInternalPage,
    internalPageSize,
    externalPage,
    setExternalPage,
    loadRunResults,
    refreshCurrentRun,
    startRun
  } = workspace;

  if (!requisitionCode) {
    return (
      <EmptyState
        title="Select a requisition"
        description="Choose an approved open requisition to configure and run Talent Intelligence sourcing."
      />
    );
  }

  if (availability && !availability.available) {
    return (
      <Alert severity="info">
        Talent Intelligence is unavailable. Enable the AI module, Talent Intelligence feature, and required
        work assignment.
      </Alert>
    );
  }

  const handleSelectRun = async (run) => {
    await loadRunResults(run.run_id, { page: 1, pageSize: internalPageSize, extPage: 1, extPageSize: 10 });
    setInternalPage(1);
    setExternalPage(1);
  };

  const internalPages = pagination?.internal?.total_pages || 1;
  const externalPages = pagination?.external?.total_pages || 1;

  return (
    <OtiEnterpriseSourcingShell compact={compact} headerSlot={headerSlot}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems="stretch"
      >
        <Box
          sx={{
            width: { xs: "100%", lg: compact ? "100%" : 360 },
            flexShrink: 0,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            bgcolor: "background.paper"
          }}
        >
          <OtiSourcingConfigPanel
            availability={availability}
            queryText={queryText}
            onQueryTextChange={setQueryText}
            includeExternal={includeExternal}
            onIncludeExternalChange={setIncludeExternal}
            includeSemantic={includeSemantic}
            onIncludeSemanticChange={setIncludeSemantic}
            includeAiAssist={includeAiAssist}
            onIncludeAiAssistChange={setIncludeAiAssist}
          />

          <Box sx={{ mt: 2 }}>
            <OtiProviderCatalogPanel availability={availability} />
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeOutlinedIcon />}
              disabled={isRunning || !requisitionCode}
              onClick={startRun}
            >
              {isRunning ? "Running…" : "Start sourcing run"}
            </Button>
            {runMeta?.run_id ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshOutlinedIcon />}
                disabled={isRunning || isRefreshing}
                onClick={refreshCurrentRun}
              >
                Refresh
              </Button>
            ) : null}
          </Stack>

          <Box sx={{ mt: 2 }}>
            <OtiRunHistoryPanel
              runs={pastRuns}
              activeRunId={runMeta?.run_id}
              onSelectRun={handleSelectRun}
            />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {error}
            </Alert>
          ) : null}

          <OtiRunStatusBanner
            runMeta={runMeta}
            runFailed={runFailed}
            internalCount={results.length}
            externalCount={Math.max(
              externalLeads.length,
              pagination?.external?.total ?? 0,
              runMeta?.external_leads_count ?? 0
            )}
          />

          <OtiAiRunInsights runMeta={runMeta} />

          <OtiExternalProviderMetrics externalSummary={runMeta?.external_summary} />

          {isRunning ? <LoadingState label="Running end-to-end sourcing workflow…" /> : null}

          {!isRunning ? (
            <OtiUnifiedDiscoveryPanel
              requisitionCode={requisitionCode}
              runId={runMeta?.run_id}
              internalRows={results}
              internalQualifyingTotal={pagination?.internal?.total ?? null}
              externalRows={externalLeads}
              runFailed={runFailed}
              onActionRecorded={refreshCurrentRun}
            />
          ) : null}

          {!isRunning && pagination?.internal?.total_pages > 1 ? (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Internal server page {internalPage} / {internalPages} ({pagination.internal.total} total)
              </Typography>
              <Pagination
                size="small"
                page={internalPage}
                count={internalPages}
                onChange={async (_event, page) => {
                  setInternalPage(page);
                  await loadRunResults(runMeta.run_id, {
                    page,
                    pageSize: internalPageSize,
                    extPage: externalPage,
                    extPageSize: 10
                  });
                }}
              />
            </Stack>
          ) : null}

          {!isRunning && pagination?.external?.total_pages > 1 ? (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                External server page {externalPage} / {externalPages} ({pagination.external.total} total)
              </Typography>
              <Pagination
                size="small"
                page={externalPage}
                count={externalPages}
                onChange={async (_event, page) => {
                  setExternalPage(page);
                  await loadRunResults(runMeta.run_id, {
                    page: internalPage,
                    pageSize: internalPageSize,
                    extPage: page,
                    extPageSize: 10
                  });
                }}
              />
            </Stack>
          ) : null}
        </Box>
      </Stack>
    </OtiEnterpriseSourcingShell>
  );
}

export default OtiEnterpriseSourcingExperience;
