import { useOutletContext, useNavigate } from "react-router-dom";

import { Grid, Alert, Typography } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import PositionCatalogueCard from "../../components/workforce-planning/PositionCatalogueCard";

function extractExistingRequisitionCode(error) {
  const message =
    error?.response?.data?.message || error?.message || "";
  const match = String(message).match(/REQ-\d{4}-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function ApprovedPositionCataloguePage() {
  const navigate = useNavigate();
  const { data, createRequisition, setToastMessage } = useOutletContext();

  const handleCreateRequisition = async (positionId) => {
    let requisitionCode = null;

    try {
      const result = await createRequisition(positionId);
      requisitionCode = result?.requisitionId || null;
    } catch (error) {
      // One Approved Position → one Requisition: open the existing REQ when create is blocked.
      requisitionCode = extractExistingRequisitionCode(error);

      if (!requisitionCode && typeof setToastMessage === "function") {
        setToastMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to create requisition from this approved position."
        );
      }
    }

    // Always open the Enterprise Requisition Editor with Approved Position context.
    // Put requisitionCode in the query string so EDIT/submit mode survives remount
    // (location.state alone is lost on refresh and can fall back to draft-create).
    const params = new URLSearchParams();
    if (requisitionCode) {
      params.set("requisitionCode", requisitionCode);
    }
    if (positionId) {
      params.set("approvedPositionId", String(positionId));
    }
    const query = params.toString();

    navigate(query ? `/requisitions?${query}` : "/requisitions", {
      state: {
        ...(requisitionCode ? { requisitionCode } : {}),
        approvedPositionId: positionId
      }
    });
  };

  return (
    <>
      <ConfigPageHeader
        title="Approved position catalogue"
        subtitle="Every approved manpower position with remaining budget. Requisitions can only be created from this catalogue."
        breadcrumbs={[
          { label: "Workforce Planning" },
          { label: "Approved Positions" }
        ]}
      />

      <Alert
        severity="info"
        sx={{
          mb: 1.5,
          borderRadius: 2,
          py: 0.5,
          "& .MuiAlert-message": { py: 0.25 }
        }}
      >
        <Typography variant="body2" sx={{ fontSize: 13 }}>
          <strong>Gate to recruitment:</strong> The Create Requisition button
          is enabled only when an approved budget exists with remaining
          headcount and budget.
        </Typography>
      </Alert>

      <Grid container spacing={1.5}>
        {data.approved_positions.map((position) => (
          <Grid key={position.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <PositionCatalogueCard
              position={position}
              onCreateRequisition={handleCreateRequisition}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default ApprovedPositionCataloguePage;
