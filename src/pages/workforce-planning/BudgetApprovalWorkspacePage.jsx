import { useEffect, useMemo, useState } from "react";

import { useLocation, useOutletContext } from "react-router-dom";

import { Box, Button, Grid, Stack, Typography, Chip } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import ConfigSurface from "../../components/platform-config/ConfigSurface";
import BudgetRequestCard from "../../components/workforce-planning/BudgetRequestCard";
import ApprovalWorkspacePanel from "../../components/workforce-planning/ApprovalWorkspacePanel";
import WorkforcePlanningSectionSearch from "../../components/workforce-planning/WorkforcePlanningSectionSearch";
import { sortApprovalQueueByLatestActivity } from "@/utils/budgetApprovalHistoryUtils";
import { countPendingApprovalQueueItems } from "@/utils/deriveWorkforceDashboardView";
import {
  BUDGET_REQUEST_SEARCH_FIELDS,
  filterItemsBySearch,
  normalizeWorkforceSearchQuery,
  WORKFORCE_PLANNING_QUEUE_SCROLL_SX
} from "@/utils/workforcePlanningListFilter";

function BudgetApprovalWorkspacePage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data,
    approvalQueueSortKey,
    selectedRequestId,
    setSelectedRequestId,
    selectedRequest,
    approveRequest,
    rejectRequest,
    clarifyRequest,
    resubmitClarification
  } = useOutletContext();

  const approvalQueue = useMemo(
    () => sortApprovalQueueByLatestActivity(data?.approval_queue || []),
    [data?.approval_queue, approvalQueueSortKey]
  );

  const filteredApprovalQueue = useMemo(
    () =>
      filterItemsBySearch(
        approvalQueue,
        BUDGET_REQUEST_SEARCH_FIELDS,
        searchQuery
      ),
    [approvalQueue, searchQuery]
  );

  const normalizedSearchQuery = normalizeWorkforceSearchQuery(searchQuery);

  const defaultRequestId = approvalQueue[0]?.id ?? null;

  const selectedExistsInQueue = useMemo(
    () => approvalQueue.some((item) => item.id === selectedRequestId),
    [approvalQueue, selectedRequestId]
  );

  useEffect(() => {
    const budgetRequestId = location.state?.budgetRequestId;
    if (!budgetRequestId) {
      return;
    }

    const exists = approvalQueue.some((item) => item.id === budgetRequestId);
    if (exists) {
      setSelectedRequestId(budgetRequestId);
    }
  }, [
    location.state?.budgetRequestId,
    approvalQueueSortKey,
    setSelectedRequestId,
    approvalQueue
  ]);

  useEffect(() => {
    if (!approvalQueue.length) {
      if (selectedRequestId) {
        setSelectedRequestId(null);
      }
      return;
    }

    if ((!selectedRequestId || !selectedExistsInQueue) && defaultRequestId) {
      setSelectedRequestId(defaultRequestId);
    }
  }, [
    approvalQueueSortKey,
    approvalQueue.length,
    defaultRequestId,
    selectedExistsInQueue,
    selectedRequestId,
    setSelectedRequestId
  ]);

  const pendingCount = countPendingApprovalQueueItems(approvalQueue);

  return (
    <>
      <ConfigPageHeader
        title="Budget approval workspace"
        subtitle="Review, approve, reject, or send back budget requests with full audit trail."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Approval Workspace" }
        ]}
        statusChip={
          <Chip
            label={`${pendingCount} pending review`}
            color="warning"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
            Request queue
          </Typography>

          <WorkforcePlanningSectionSearch
            label="Search approval queue"
            placeholder="Request ID, position, department, grade, requester, status…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onClear={() => setSearchQuery("")}
          />

          <Box sx={{ ...WORKFORCE_PLANNING_QUEUE_SCROLL_SX, mt: 1.5 }}>
            {filteredApprovalQueue.length === 0 ? (
              <ConfigSurface sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {approvalQueue.length === 0
                    ? "No budget requests are in the approval queue."
                    : normalizedSearchQuery
                      ? "No requests match your search. Try different keywords or clear the search."
                      : "No requests to display."}
                </Typography>
                {normalizedSearchQuery && approvalQueue.length > 0 ? (
                  <Button
                    size="small"
                    onClick={() => setSearchQuery("")}
                    sx={{ mt: 1.5, textTransform: "none", fontWeight: 600 }}
                  >
                    Clear search
                  </Button>
                ) : null}
              </ConfigSurface>
            ) : (
              <Stack spacing={1}>
                {filteredApprovalQueue.map((request) => (
                  <BudgetRequestCard
                    key={request.id}
                    request={request}
                    selected={request.id === selectedRequestId}
                    onClick={() => setSelectedRequestId(request.id)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <ApprovalWorkspacePanel
            key={selectedRequestId || "no-selection"}
            request={selectedRequest}
            onApprove={approveRequest}
            onReject={rejectRequest}
            onClarify={clarifyRequest}
            onResubmit={resubmitClarification}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default BudgetApprovalWorkspacePage;
