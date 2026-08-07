import {
  Box,
  Stack,
  Typography
} from "@mui/material";

import EnterpriseCard from "@/components/enterprise/framework/EnterpriseCard";
import OfferCompensationBreakupTable from "./OfferCompensationBreakupTable";

function formatApprovedAnnualCtc(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

function OfferCompensationSection({
  approvedAnnualCtc = 0,
  compensation = null
}) {
  const ctcBreakup = compensation?.ctcBreakup || [];

  return (
    <EnterpriseCard
      title="Compensation"
      subtitle="Annexure-A salary structure (monthly and annual breakup)"
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Annual CTC
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: 20, mt: 0.25 }}>
            {formatApprovedAnnualCtc(approvedAnnualCtc)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (Approved Compensation)
          </Typography>
        </Box>

        <OfferCompensationBreakupTable
          components={ctcBreakup}
          gross={compensation?.gross || 0}
          totalCtc={compensation?.totalCtc || 0}
        />

        {compensation?.calculatedOn ? (
          <Typography variant="caption" color="text.secondary">
            Last calculated{" "}
            {new Date(compensation.calculatedOn).toLocaleString("en-IN")}
            {compensation.calculatedBy ? ` by ${compensation.calculatedBy}` : ""}
          </Typography>
        ) : null}
      </Stack>
    </EnterpriseCard>
  );
}

export default OfferCompensationSection;
