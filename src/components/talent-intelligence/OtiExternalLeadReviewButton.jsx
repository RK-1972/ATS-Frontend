import { useNavigate } from "react-router-dom";
import { Button, Chip, Tooltip } from "@mui/material";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import {
  buildOtiIntakeReviewSearchParams,
  canReviewExternalLead
} from "./otiExternalResumeDocument";

function OtiExternalLeadReviewButton({ row, requisitionCode, runId }) {
  const navigate = useNavigate();
  const importStatus = String(row?.import_status || "staged").toLowerCase();
  const leadId = row?.external_lead_id || row?.id;
  const eligible = canReviewExternalLead(row);

  if (importStatus === "imported") {
    return (
      <Chip
        size="small"
        color="success"
        variant="outlined"
        label="Registered"
        sx={{ width: "100%", maxWidth: 220 }}
      />
    );
  }

  const handleReview = () => {
    if (!leadId || !eligible) {
      return;
    }

    const query = buildOtiIntakeReviewSearchParams({
      externalLeadId: leadId,
      runId,
      requisitionCode
    });

    navigate(`/candidate-intake?${query}`);
  };

  const reviewButton = (
    <Button
      fullWidth
      size="small"
      variant="contained"
      color="primary"
      disabled={!eligible}
      startIcon={<RateReviewOutlinedIcon sx={{ fontSize: 18 }} />}
      onClick={handleReview}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        maxWidth: 220,
        py: 0.75
      }}
    >
      Review candidate
    </Button>
  );

  if (!eligible) {
    return (
      <Tooltip title="A retrieved resume is required before review and registration.">
        <span>{reviewButton}</span>
      </Tooltip>
    );
  }

  return reviewButton;
}

export default OtiExternalLeadReviewButton;
