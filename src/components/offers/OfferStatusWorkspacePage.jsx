import { useMemo, useState } from "react";

import { Chip, Grid, Stack, Typography } from "@mui/material";

import {
  EmptyState,
  WorkspaceHeader
} from "@/components/enterprise";
import OfferApprovalQueueCard from "./OfferApprovalQueueCard";
import OfferWorkspaceDetailPanel from "./OfferWorkspaceDetailPanel";

function OfferStatusWorkspacePage({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  module = "offers",
  statusChipLabel,
  offers = [],
  onRelease,
  onAccept,
  onNegotiate,
  onRevise,
  busy = false
}) {
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  const activeOfferId = useMemo(() => {
    if (selectedOfferId && offers.some((item) => item.offerId === selectedOfferId)) {
      return selectedOfferId;
    }
    return offers[0]?.offerId || null;
  }, [offers, selectedOfferId]);

  const selectedOffer = useMemo(
    () => offers.find((item) => item.offerId === activeOfferId) || null,
    [offers, activeOfferId]
  );

  const Icon = emptyIcon;

  return (
    <>
      <WorkspaceHeader
        title={title}
        subtitle={subtitle}
        statusChip={
          <Chip
            label={statusChipLabel(offers.length)}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, height: 24 }}
          />
        }
      />

      {offers.length === 0 ? (
        <EmptyState
          icon={Icon}
          module={module}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Typography variant="body2" fontWeight={700} mb={1} sx={{ fontSize: 14 }}>
              {title}
            </Typography>
            <Stack spacing={1}>
              {offers.map((offer) => (
                <OfferApprovalQueueCard
                  key={offer.offerId}
                  offer={offer}
                  selected={offer.offerId === activeOfferId}
                  onClick={() => setSelectedOfferId(offer.offerId)}
                />
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <OfferWorkspaceDetailPanel
              offer={selectedOffer}
              onRelease={onRelease}
              onAccept={onAccept}
              onNegotiate={onNegotiate}
              onRevise={onRevise}
              busy={busy}
            />
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default OfferStatusWorkspacePage;
