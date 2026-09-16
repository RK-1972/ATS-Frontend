import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import EnterpriseWorkspaceHeader from "@/components/enterprise/framework/EnterpriseWorkspaceHeader";
import HmCandidateDetailPanel from "@/components/hiring-manager/HmCandidateDetailPanel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SearchBar,
  StatusChip
} from "@/components/enterprise";

function matchesRequisitionSearch(row, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    row.requisition_code,
    row.req_code,
    row.job_title,
    row.hiring_manager
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");

  return haystack.includes(query);
}

function RequisitionSidebar({
  requisitions,
  selectedCode,
  onSelect,
  isLoading,
  error,
  isSearchActive
}) {
  if (isLoading) {
    return <LoadingState message="Loading requisitions..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load requisitions" message={error} />;
  }

  if (!requisitions.length) {
    if (isSearchActive) {
      return (
        <EmptyState
          title="No matching requisitions"
          description="Try a different requisition code, job title, or hiring manager."
        />
      );
    }

    return (
      <EmptyState
        title="No requisitions assigned"
        description="Requisitions assigned to you will appear here."
      />
    );
  }

  return (
    <List dense disablePadding>
      {requisitions.map((row) => {
        const code = row.requisition_code || row.req_code;
        const selected = code === selectedCode;

        return (
          <ListItemButton
            key={code || row.req_id}
            selected={selected}
            onClick={() => onSelect(code)}
            sx={{ alignItems: "flex-start", py: 1.25 }}
          >
            <ListItemText
              primary={code || "Requisition"}
              secondary={
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {row.job_title || "—"}
                  </Typography>
                  <StatusChip status={row.req_status || "—"} />
                </Stack>
              }
              primaryTypographyProps={{ fontWeight: 700, fontSize: 13 }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

function CandidateListPanel({
  candidates,
  selectedMapId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
  error,
  requisitionCode
}) {
  if (!requisitionCode) {
    return (
      <EmptyState
        title="Select a requisition"
        description="Choose a requisition to view assigned candidates."
      />
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading candidates..." />;
  }

  if (error) {
    return <ErrorState title="Unable to load candidates" message={error} />;
  }

  if (!candidates.length) {
    return (
      <EmptyState
        title="No candidates"
        description="No active pipeline mappings were returned for this requisition."
      />
    );
  }

  return (
    <Stack spacing={1.5} sx={{ minHeight: 0, flex: 1 }}>
      <SearchBar
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search candidates"
        size="small"
      />

      <List dense disablePadding sx={{ overflow: "auto", flex: 1 }}>
        {candidates.map((row) => {
          const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
          const selected = row.map_id === selectedMapId;

          return (
            <ListItemButton
              key={row.map_id}
              selected={selected}
              onClick={() => onSelect(row.map_id)}
              sx={{ alignItems: "flex-start", py: 1.1 }}
            >
              <ListItemText
                primary={name || row.candidate_code || "Candidate"}
                secondary={
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.candidate_code || "—"}
                    </Typography>
                    <StatusChip status={row.stage_name || "Applied"} />
                  </Stack>
                }
                primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Stack>
  );
}

function scrollMainPageToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function HiringManagerWorkspacePage() {
  const workspace = useOutletContext();
  const [requisitionSearch, setRequisitionSearch] = useState("");
  const {
    requisitions,
    candidates,
    selectedRequisition,
    selectedRequisitionCode,
    selectedCandidate,
    selectedMapId,
    candidateSearch,
    setCandidateSearch,
    isLoadingRequisitions,
    isLoadingCandidates,
    requisitionError,
    candidateError,
    accessDenied,
    loadRequisitions,
    loadCandidates,
    selectRequisition,
    selectCandidate
  } = workspace;

  const requisitionSearchQuery = String(requisitionSearch || "").trim().toLowerCase();

  const filteredRequisitions = useMemo(() => {
    if (!requisitionSearchQuery) {
      return requisitions;
    }

    return requisitions.filter((row) =>
      matchesRequisitionSearch(row, requisitionSearchQuery)
    );
  }, [requisitions, requisitionSearchQuery]);

  const handleSelectRequisition = useCallback(
    (code) => {
      selectRequisition(code);
      requestAnimationFrame(() => {
        scrollMainPageToTop();
      });
    },
    [selectRequisition]
  );

  if (accessDenied) {
    return (
      <ErrorState
        title="Access denied"
        message="No active Hiring Manager profile is bound to this account."
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minHeight: 0,
        maxHeight: { md: "calc(100vh - 56px - 32px)" },
        overflow: "hidden"
      }}
    >
      <EnterpriseWorkspaceHeader
        title="Hiring Manager Workspace"
        subtitle="Read-only view of requisitions and candidates assigned to you."
        actions={
          <IconButton
            size="small"
            aria-label="Refresh workspace"
            onClick={() => {
              loadRequisitions();
              if (selectedRequisitionCode) {
                loadCandidates(selectedRequisitionCode);
              }
            }}
          >
            <RefreshOutlinedIcon fontSize="small" />
          </IconButton>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(220px, 280px) minmax(260px, 320px) minmax(0, 1fr)"
          },
          gridTemplateRows: { md: "minmax(0, 1fr)" },
          gap: 1.5,
          flex: "1 1 0",
          minHeight: 0,
          overflow: { xs: "auto", md: "hidden" },
          px: { xs: 1, sm: 2 },
          pb: 2,
          alignContent: { xs: "start", md: "stretch" }
        }}
      >
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            p: 1.5,
            minHeight: { xs: 320, md: 0 },
            height: { md: "100%" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, flexShrink: 0 }}>
            My Requisitions
          </Typography>
          <SearchBar
            value={requisitionSearch}
            onChange={(event) => setRequisitionSearch(event.target.value)}
            placeholder="Search requisitions"
            size="small"
            width="100%"
            sx={{ mb: 1, flexShrink: 0, width: "100%" }}
          />
          <Box
            sx={{
              flex: "1 1 0",
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              overscrollBehavior: "contain"
            }}
          >
            <RequisitionSidebar
              requisitions={filteredRequisitions}
              selectedCode={selectedRequisitionCode}
              onSelect={handleSelectRequisition}
              isLoading={isLoadingRequisitions}
              error={requisitionError}
              isSearchActive={Boolean(requisitionSearchQuery)}
            />
          </Box>
        </Box>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            p: 1.5,
            minHeight: { xs: 280, md: 0 },
            height: { md: "100%" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Candidates
          </Typography>
          <CandidateListPanel
            candidates={candidates}
            selectedMapId={selectedMapId}
            onSelect={selectCandidate}
            searchQuery={candidateSearch}
            onSearchChange={setCandidateSearch}
            isLoading={isLoadingCandidates}
            error={candidateError}
            requisitionCode={selectedRequisitionCode}
          />
        </Box>

        <Box
          sx={{
            minHeight: { xs: 320, md: 0 },
            height: { md: "100%" },
            overflow: "auto",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <HmCandidateDetailPanel
            candidate={selectedCandidate}
            requisition={selectedRequisition}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default HiringManagerWorkspacePage;
