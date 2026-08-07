import { Box, Grid, Stack, Typography } from "@mui/material";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import { StatusChip } from "@/components/enterprise";
import { formatCurrency } from "@/utils/formatCurrency";
import OfferApprovalHistory from "./OfferApprovalHistory";
import OfferCommercialSummaryFields from "./OfferCommercialSummaryFields";

function SummaryField({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function OfferApprovedSummaryPanel({ offer }) {
  if (!offer) {
    return (
      <EnterpriseCard>
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
            Select an approved offer to view its approval history
          </Typography>
        </Box>
      </EnterpriseCard>
    );
  }

  const candidateName = offer.candidateName || offer.candidate_name;
  const clientName = offer.businessUnit || offer.business_unit;
  const projectName = offer.department;
  const offeredCtc = Number(offer.offeredCtc ?? offer.offered_ctc ?? 0);

  return (
    <Stack spacing={1.5}>
      <EnterpriseCard
        title={candidateName || "Approved Offer"}
        subtitle={`${offer.offerId} · ${offer.requisitionCode || "—"}`}
        actions={<StatusChip status={offer.offerStatus || "Approved"} />}
      >
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <SummaryField label="Candidate Name" value={candidateName} />
          <SummaryField label="Client Name" value={clientName} />
          <SummaryField label="Project Name" value={projectName} />
          <SummaryField label="Offered CTC" value={formatCurrency(offeredCtc)} />
        </Stack>

        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <OfferCommercialSummaryFields offer={offer} />
        </Grid>

        <Stack
          direction="row"
          spacing={3}
          flexWrap="wrap"
          useFlexGap
          sx={{
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider"
          }}
        >
          <SummaryField label="Position" value={offer.positionTitle} />
          <SummaryField label="Grade" value={offer.grade} />
        </Stack>
      </EnterpriseCard>

      <OfferApprovalHistory
        steps={offer.approvalSteps || []}
        subtitle="From existing offer approval records"
      />
    </Stack>
  );
}

export default OfferApprovedSummaryPanel;
