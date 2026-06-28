import { useOutletContext } from "react-router-dom";

import { Grid, Alert, Typography } from "@mui/material";

import ConfigPageHeader from "../../components/platform-config/ConfigPageHeader";
import PositionCatalogueCard from "../../components/workforce-planning/PositionCatalogueCard";

function ApprovedPositionCataloguePage() {

  const { data, createRequisition } = useOutletContext();

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
              onCreateRequisition={createRequisition}
            />

          </Grid>

        ))}

      </Grid>

    </>

  );

}

export default ApprovedPositionCataloguePage;
