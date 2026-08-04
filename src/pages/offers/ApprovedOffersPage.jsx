import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Chip,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferApprovalQueueCard from "@/components/offers/OfferApprovalQueueCard";
import OfferApprovedSummaryPanel from "@/components/offers/OfferApprovedSummaryPanel";

/**
 * Approved Offers — mirrors enterprise store-driven workspace pages.
 * Reads from OfferWorkspaceLayout outlet context (same pattern as Budget).
 */
function ApprovedOffersPage() {
  const { approvedOffers } = useOutletContext();
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  useEffect(() => {
    setSelectedOfferId((prev) => {
      if (prev && approvedOffers.some((item) => item.offerId === prev)) {
        return prev;
      }
      return approvedOffers[0]?.offerId || null;
    });
  }, [approvedOffers]);

  const selectedOffer = useMemo(
    () => approvedOffers.find((item) => item.offerId === selectedOfferId) || null,
    [approvedOffers, selectedOfferId]
  );

  return (
    <>
      <WorkspaceHeader
        title="Approved Offers"
        subtitle="Offers that have completed the Enterprise approval workflow and are ready for release."
        statusChip={
          <Chip
            label={`${approvedOffers.length} approved`}
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {approvedOffers.length === 0 ? (
        <EmptyState
          icon={VerifiedOutlinedIcon}
          module="team"
          title="No approved offers"
          description="When offer requests complete all approval steps, they will appear here."
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
              Approved offers
            </Typography>

            <Stack spacing={1}>
              {approvedOffers.map((offer) => (
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
            <OfferApprovedSummaryPanel offer={selectedOffer} />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default ApprovedOffersPage;
