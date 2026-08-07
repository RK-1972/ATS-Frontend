import { Box, Grid, Typography } from "@mui/material";

import { formatCurrency } from "@/utils/formatCurrency";
import { formatApprovedDate } from "@/utils/offerLetterUtils";
import { formatPayFrequency } from "@/utils/offerCommercialUtils";

function SummaryField({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Grid>
  );
}

function readCommercialValue(offer, camelKey, snakeKey, fallback = null) {
  if (offer?.[camelKey] !== undefined && offer?.[camelKey] !== null) {
    return offer[camelKey];
  }

  if (offer?.[snakeKey] !== undefined && offer?.[snakeKey] !== null) {
    return offer[snakeKey];
  }

  return fallback;
}

function OfferCommercialSummaryFields({ offer }) {
  if (!offer) {
    return null;
  }

  const expectedJoiningDate = readCommercialValue(
    offer,
    "expectedJoiningDate",
    "expected_joining_date"
  );
  const variablePay = Number(
    readCommercialValue(offer, "variablePay", "variable_pay", 0)
  );
  const variablePayFrequency = readCommercialValue(
    offer,
    "variablePayFrequency",
    "variable_pay_frequency"
  );
  const joiningBonus = Number(
    readCommercialValue(offer, "joiningBonus", "joining_bonus", 0)
  );
  const joiningBonusFrequency = readCommercialValue(
    offer,
    "joiningBonusFrequency",
    "joining_bonus_frequency"
  );

  return (
    <>
      <SummaryField
        label="Expected Joining Date"
        value={formatApprovedDate(expectedJoiningDate)}
      />
      <SummaryField label="Variable Pay" value={formatCurrency(variablePay)} />
      <SummaryField
        label="Variable Pay Frequency"
        value={formatPayFrequency(variablePayFrequency)}
      />
      <SummaryField label="Joining Bonus" value={formatCurrency(joiningBonus)} />
      <SummaryField
        label="Joining Bonus Frequency"
        value={formatPayFrequency(joiningBonusFrequency)}
      />
    </>
  );
}

export default OfferCommercialSummaryFields;
