import { useEffect, useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";

import { ENDPOINTS } from "@/api/endpoints";
import { httpPost } from "@/api/httpClient";
import myApprovalsService from "@/services/myApprovalsService";
import { dispatchApprovalNotificationsUpdated } from "@/utils/enterpriseNotificationEvents";
import {
  filterPendingApprovalQueueBySearch,
  normalizeOfferApprovalSearchQuery
} from "@/utils/offerApprovalUtils";
import { WORKFORCE_PLANNING_QUEUE_SCROLL_SX } from "@/utils/workforcePlanningListFilter";
import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferApprovalQueueCard from "@/components/offers/OfferApprovalQueueCard";
import OfferApprovalWorkspacePanel from "@/components/offers/OfferApprovalWorkspacePanel";
import WorkforcePlanningSectionSearch from "@/components/workforce-planning/WorkforcePlanningSectionSearch";
import ConfigSurface from "@/components/platform-config/ConfigSurface";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

const OFFER_DETAIL_SCROLL_SX = {
  maxHeight: {
    xs: "min(70vh, 640px)",
    lg: "min(calc(100vh - 240px), 720px)"
  },
  overflowY: "auto",
  overflowX: "hidden",
  pr: 0.5
};

/**
 * Offer Approval Workspace — mirrors BudgetApprovalWorkspacePage.
 * Reads queue from enterpriseStore via OfferWorkspaceLayout outlet context.
 */
function PendingOfferApprovalsPage() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    queue,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    approveOffer,
    refreshOffers
  } = useOutletContext();

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const filteredQueue = useMemo(
    () => filterPendingApprovalQueueBySearch(queue, searchQuery),
    [queue, searchQuery]
  );

  const normalizedSearchQuery = normalizeOfferApprovalSearchQuery(searchQuery);

  useEffect(() => {
    const offerId = location.state?.offerId;
    if (!offerId) {
      return;
    }

    if (queue.some((item) => item.offerId === offerId)) {
      setSelectedOfferId(offerId);
    }
  }, [location.state, queue, setSelectedOfferId]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleApprove = async (offerId, approvalStep, comment) => {
    await approveOffer(offerId, approvalStep, comment);
    dispatchApprovalNotificationsUpdated();
    showToast(`${approvalStep} approved.`);
    await refreshOffers?.();
  };

  const handleReject = async (offerId, reason) => {
    const offerContext =
      selectedOffer?.offerId === offerId
        ? selectedOffer
        : queue.find((item) => item.offerId === offerId);
    const heldApprovalTaskId = offerContext?.clarificationHeldApprovalTaskId;

    if (heldApprovalTaskId && offerContext?.canRejectDuringClarification) {
      const result = await myApprovalsService.rejectApproval(
        heldApprovalTaskId,
        reason
      );
      showToast(result?.message || "Offer approval rejected.", "info");
      dispatchApprovalNotificationsUpdated();
      await refreshOffers?.();
      return;
    }

    const approvalsResponse = await myApprovalsService.listMyActiveApprovals();
    const rows = Array.isArray(approvalsResponse?.data) ? approvalsResponse.data : [];
    const match = rows.find((row) => {
      const documentType = String(row?.document_type || row?.workflow_type || "")
        .trim()
        .toUpperCase();
      if (documentType !== "OFFER") {
        return false;
      }
      const documentNumber = String(row?.document_number || row?.offer_id || "").trim();
      return documentNumber === String(offerId);
    });

    if (!match?.task_id) {
      showToast("No active approval task found for this offer.", "error");
      return;
    }

    const result = await myApprovalsService.rejectApproval(match.task_id, reason);
    showToast(result?.message || "Offer approval rejected.", "info");
    dispatchApprovalNotificationsUpdated();
    await refreshOffers?.();
  };

  const handleSendBack = async (offerId, comments) => {
    const result = await httpPost(
      `${ENDPOINTS.offers}/${offerId}/request-clarification`,
      { comments },
      () => ({
        success: true,
        toastMessage: "Clarification request sent. Workflow paused."
      })
    );
    showToast(result?.toastMessage || "Offer sent back for clarification.");
    dispatchApprovalNotificationsUpdated();
    await refreshOffers?.();
  };

  return (
    <>
      <WorkspaceHeader
        title="Pending Offer Approvals"
        subtitle="Review, approve, reject, or send back offer requests using the existing Enterprise approval flow."
        statusChip={
          <Chip
            label={`${queue.length} pending review`}
            color="warning"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {queue.length === 0 ? (
        <EmptyState
          icon={PendingActionsOutlinedIcon}
          module="approvals"
          title="No pending offer approvals"
          description="When recruiters submit offer requests, pending approvals will appear here for review."
        />
      ) : (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              mb={1}
              sx={{ fontSize: 14 }}
            >
              Offer queue
            </Typography>

            <WorkforcePlanningSectionSearch
              label="Search offer queue"
              placeholder="Offer ID, candidate, requisition, approval step…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onClear={() => setSearchQuery("")}
            />

            <Box sx={{ ...WORKFORCE_PLANNING_QUEUE_SCROLL_SX, mt: 1.5 }}>
              {filteredQueue.length === 0 ? (
                <ConfigSurface sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {normalizedSearchQuery
                      ? "No offers match your search. Try different keywords or clear the search."
                      : "No offers to display."}
                  </Typography>
                  {normalizedSearchQuery ? (
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
                  {filteredQueue.map((offer) => (
                    <OfferApprovalQueueCard
                      key={offer.offerId}
                      offer={offer}
                      selected={offer.offerId === selectedOfferId}
                      onClick={() => setSelectedOfferId(offer.offerId)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={OFFER_DETAIL_SCROLL_SX}>
              <OfferApprovalWorkspacePanel
                key={selectedOfferId || "no-selection"}
                offer={selectedOffer}
                onApprove={handleApprove}
                onReject={handleReject}
                onSendBack={handleSendBack}
              />
            </Box>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default PendingOfferApprovalsPage;
