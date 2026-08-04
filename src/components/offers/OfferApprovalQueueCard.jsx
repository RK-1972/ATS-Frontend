import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography
} from "@mui/material";

import { StatusChip } from "@/components/enterprise";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Queue card for Offer Approval Workspace — mirrors BudgetRequestCard composition.
 */
function OfferApprovalQueueCard({ offer, selected, onClick }) {
  const title = offer.candidateName || offer.candidate_name || "Candidate";
  const req = offer.requisitionCode || offer.requisition_code || "—";
  const step = offer.currentApprovalStep || "Approval";
  const ctc = Number(offer.offeredCtc ?? offer.offered_ctc ?? 0);

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 2,
        border: 2,
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "rgba(31, 59, 99, 0.03)" : "background.paper",
        transition: "border-color 0.2s ease",
        "&:hover": onClick ? { borderColor: "primary.main" } : {}
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <Box minWidth={0} flex={1}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: 11 }}
            >
              {offer.offerId} · {req} · {step}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              mt={0.25}
              sx={{ fontSize: 14, lineHeight: 1.3 }}
            >
              {title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              {offer.positionTitle || offer.grade || "—"} · {formatCurrency(ctc)}
            </Typography>
          </Box>

          <StatusChip status={offer.offerStatus || "Pending Approval"} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default OfferApprovalQueueCard;
