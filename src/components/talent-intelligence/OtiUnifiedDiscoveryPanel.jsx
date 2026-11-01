import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";

import { EmptyState } from "@/components/enterprise";
import OtiRunResultsGrid from "./OtiRunResultsGrid";
import OtiExternalLeadsGrid from "./OtiExternalLeadsGrid";
import OtiResultsFilterBar, { defaultFilters } from "./OtiResultsFilterBar";
import { filterExternalLeads, filterInternalResults } from "./otiDiscoveryFilters";
import { OTI_NO_QUALIFYING_MATCHES_MESSAGE } from "./otiRecommendationPolicy";

function OtiUnifiedDiscoveryPanel({
  requisitionCode,
  runId,
  internalRows = [],
  externalRows = [],
  internalQualifyingTotal = null,
  onActionRecorded,
  runFailed
}) {
  const [tab, setTab] = useState("internal");
  const [internalFilters, setInternalFilters] = useState(defaultFilters);
  const [externalFilters, setExternalFilters] = useState(defaultFilters);
  const lastAutoExternalRunRef = useRef(null);

  useEffect(() => {
    if (!runId || externalRows.length === 0) {
      return;
    }

    if (lastAutoExternalRunRef.current === runId) {
      return;
    }

    lastAutoExternalRunRef.current = runId;
    setTab("external");
  }, [runId, externalRows.length]);

  const providerOptions = useMemo(
    () =>
      Array.from(
        new Set(
          externalRows.flatMap((row) =>
            (row.sources || [])
              .map((source) => source.provider_key)
              .concat(row.provider_key)
              .filter(Boolean)
          )
        )
      ),
    [externalRows]
  );

  const filteredInternal = useMemo(
    () => filterInternalResults(internalRows, internalFilters),
    [internalRows, internalFilters]
  );

  const filteredExternal = useMemo(
    () => filterExternalLeads(externalRows, externalFilters),
    [externalRows, externalFilters]
  );

  if (runFailed) {
    return (
      <EmptyState
        title="Run did not complete"
        description="Failed runs do not expose candidate results. Start a new run or open a completed run from history."
      />
    );
  }

  const qualifyingTotal =
    typeof internalQualifyingTotal === "number"
      ? internalQualifyingTotal
      : internalRows.length;
  const hasAny = qualifyingTotal > 0 || externalRows.length > 0 || internalRows.length > 0;

  const showInternalOnlyEmpty =
    runId && qualifyingTotal === 0 && externalRows.length === 0;

  if (showInternalOnlyEmpty) {
    return (
      <EmptyState
        title="No qualifying internal matches"
        description={OTI_NO_QUALIFYING_MATCHES_MESSAGE}
      />
    );
  }

  if (!hasAny) {
    if (runId) {
      return (
        <EmptyState
          title="No qualifying internal matches"
          description={OTI_NO_QUALIFYING_MATCHES_MESSAGE}
        />
      );
    }

    return (
      <EmptyState
        title="No discovery results"
        description="Start a sourcing run to populate internal and external candidate views."
      />
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Tabs
        value={tab}
        onChange={(_event, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1 }}
      >
        <Tab value="internal" label={`Internal (${filteredInternal.length}/${internalRows.length})`} />
        <Tab value="external" label={`External staged (${filteredExternal.length}/${externalRows.length})`} />
        <Tab value="combined" label="Combined overview" />
      </Tabs>

      {tab === "internal" ? (
        <>
          <OtiResultsFilterBar mode="internal" filters={internalFilters} onChange={setInternalFilters} />
          {filteredInternal.length === 0 ? (
            <EmptyState
              title="No qualifying internal matches"
              description={OTI_NO_QUALIFYING_MATCHES_MESSAGE}
            />
          ) : (
            <OtiRunResultsGrid
              rows={filteredInternal}
              requisitionCode={requisitionCode}
              onActionRecorded={onActionRecorded}
            />
          )}
        </>
      ) : null}

      {tab === "external" ? (
        <>
          <OtiResultsFilterBar
            mode="external"
            filters={externalFilters}
            onChange={setExternalFilters}
            providerOptions={providerOptions}
          />
          <OtiExternalLeadsGrid
            rows={filteredExternal}
            requisitionCode={requisitionCode}
            runId={runId}
            onActionRecorded={onActionRecorded}
          />
        </>
      ) : null}

      {tab === "combined" ? (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Internal and external candidates remain separate records with independent authorization and
            workflows.
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Internal ({filteredInternal.length})
          </Typography>
          {filteredInternal.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {OTI_NO_QUALIFYING_MATCHES_MESSAGE}
            </Typography>
          ) : (
            <OtiRunResultsGrid
              rows={filteredInternal.slice(0, 5)}
              requisitionCode={requisitionCode}
              onActionRecorded={onActionRecorded}
            />
          )}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 0.5 }}>
            External staged ({filteredExternal.length})
          </Typography>
          <OtiExternalLeadsGrid
            rows={filteredExternal.slice(0, 5)}
            requisitionCode={requisitionCode}
            runId={runId}
            onActionRecorded={onActionRecorded}
          />
        </Box>
      ) : null}
    </Box>
  );
}

export default OtiUnifiedDiscoveryPanel;
