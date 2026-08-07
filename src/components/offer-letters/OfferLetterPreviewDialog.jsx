import {

  Dialog,

  DialogContent,

  DialogTitle,

  Divider,

  Grid,

  Stack,

  Typography

} from "@mui/material";



import OfferCompensationBreakupTable from "@/components/offer-letters/OfferCompensationBreakupTable";

import { formatCurrency } from "@/utils/formatCurrency";

import { formatApprovedDate } from "@/utils/offerLetterUtils";



function PreviewField({ label, value }) {

  return (

    <Stack spacing={0.25}>

      <Typography variant="caption" color="text.secondary">

        {label}

      </Typography>

      <Typography variant="body2" fontWeight={600}>

        {value || "—"}

      </Typography>

    </Stack>

  );

}



function OfferLetterPreviewDialog({ open, onClose, detail }) {

  if (!detail) {

    return null;

  }



  return (

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">

      <DialogTitle sx={{ fontWeight: 700 }}>Offer Letter Preview</DialogTitle>



      <DialogContent dividers>

        <Stack spacing={2}>

          <Typography variant="subtitle2" fontWeight={700}>

            Offer Summary

          </Typography>



          <Grid container spacing={2}>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField label="Candidate" value={detail.candidateName} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField label="Offer Number" value={detail.offerNumber} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField label="Position" value={detail.position} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField label="Department" value={detail.department} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField label="Business Unit" value={detail.businessUnit} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField

                label="Annual CTC"

                value={formatCurrency(detail.annualCtc || 0)}

              />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField

                label="Reporting Manager"

                value={detail.reportingManager}

              />

            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>

              <PreviewField

                label="Approved Date"

                value={formatApprovedDate(detail.approvedDate)}

              />

            </Grid>

          </Grid>



          <Divider />



          <Typography variant="subtitle2" fontWeight={700}>

            Compensation Breakup

          </Typography>



          <OfferCompensationBreakupTable
            components={detail.ctcBreakup || []}
            gross={detail.gross || 0}
            totalCtc={detail.totalCtc || 0}
          />

        </Stack>

      </DialogContent>

    </Dialog>

  );

}



export default OfferLetterPreviewDialog;


