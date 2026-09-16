import { Chip, Tooltip } from "@mui/material";

import { isClosedRequisitionStatus } from "@/constants/requisitionStatus";

function RequisitionFulfillmentChip({ fulfillment, reqStatus }) {
  const status = fulfillment?.closure_status || "Open";
  const dataQualityException = fulfillment?.data_quality_exception === true;

  let color = "default";
  if (isClosedRequisitionStatus(reqStatus)) {
    color = "default";
  } else if (status === "Closure Eligible") {
    color = "success";
  } else if (dataQualityException) {
    color = "warning";
  }

  const label = isClosedRequisitionStatus(reqStatus) ? reqStatus : status;

  return (
    <Tooltip
      title={
        dataQualityException
          ? "Filled headcount exceeds required — data quality exception"
          : status
      }
    >
      <Chip label={label} size="small" color={color} variant="outlined" />
    </Tooltip>
  );
}

export default RequisitionFulfillmentChip;
