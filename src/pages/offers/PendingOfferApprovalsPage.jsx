import { useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

import {
  Alert,
  Chip,
  Grid,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";

import { ENDPOINTS } from "@/api/endpoints";
import { httpPost } from "@/api/httpClient";
import offerClient from "@/api/clients/offerClient";
import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferApprovalQueueCard from "@/components/offers/OfferApprovalQueueCard";
import OfferApprovalWorkspacePanel from "@/components/offers/OfferApprovalWorkspacePanel";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

/**
 * Offer Approval Workspace — mirrors BudgetApprovalWorkspacePage.
 * Reads queue from enterpriseStore via OfferWorkspaceLayout outlet context.
 */
function PendingOfferApprovalsPage() {
  const location = useLocation();
  const {
    queue,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    approveOffer,
    refreshOffers
  } = useOutletContext();

  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

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
    showToast(`${approvalStep} approved.`);
  };

  const handleReject = async (offerId, reason) => {
    const result = await offerClient.rejectOffer(offerId, reason);
    showToast(result?.toastMessage || "Offer rejected.", "info");
    await refreshOffers?.();
  };

  const handleSendBack = async (offerId, comments) => {
    const result = await httpPost(
      `${ENDPOINTS.offers}/${offerId}/request-clarification`,
      { comments },
      () => ({
        success: true,
        toastMessage: "Clarification requested via Workflow Engine."
      })
    );
    showToast(result?.toastMessage || "Offer sent back for clarification.");
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

            <Stack spacing={1}>
              {queue.map((offer) => (
                <OfferApprovalQueueCard
                  key={offer.offerId}
                  offer={offer}
                  selected={offer.offerId === selectedOfferId}
                  onClick={() => setSelectedOfferId(offer.offerId)}
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <OfferApprovalWorkspacePanel
              offer={selectedOffer}
              onApprove={handleApprove}
              onReject={handleReject}
              onSendBack={handleSendBack}
            />
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
