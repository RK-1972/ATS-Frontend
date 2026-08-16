import { useOutletContext, useNavigate } from "react-router-dom";

import { Grid, Alert, Typography } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import PositionCatalogueCard from "../../components/workforce-planning/PositionCatalogueCard";
import { EmptyState } from "../../components/enterprise";
import ApprovalOutlinedIcon from "@mui/icons-material/ApprovalOutlined";

function extractExistingRequisitionCode(error) {
  const message =
    error?.response?.data?.message || error?.message || "";
  const match = String(message).match(/REQ-\d{4}-\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function ApprovedPositionCataloguePage() {
  const navigate = useNavigate();
  const { data, createRequisition, setToastMessage } = useOutletContext();

  const availablePositions = data.approved_positions || [];

  const handleCreateRequisition = async (positionId) => {
    let requisitionCode = null;

    try {
      const result = await createRequisition(positionId);
      requisitionCode = result?.requisitionId || null;
    } catch (error) {
      requisitionCode = extractExistingRequisitionCode(error);

      if (!requisitionCode && typeof setToastMessage === "function") {
        setToastMessage(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to create requisition from this approved position."
        );
      }
    }

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
        subtitle="Approved manpower positions still available for raising a requisition."
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
          headcount and budget. After a requisition is raised, track it under
          Requisitions in the main navigation rail.
        </Typography>
      </Alert>

      {availablePositions.length ? (
        <Grid container spacing={1.5}>
          {availablePositions.map((position) => (
            <Grid key={position.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PositionCatalogueCard
                position={position}
                onCreateRequisition={handleCreateRequisition}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={ApprovalOutlinedIcon}
          title="No available approved positions"
          description="All approved positions have already raised a requisition or have no remaining budget."
        />
      )}
    </>
  );
}

export default ApprovedPositionCataloguePage;
