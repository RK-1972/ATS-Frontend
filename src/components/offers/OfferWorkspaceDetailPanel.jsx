import { useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import OfferApprovedSummaryPanel from "./OfferApprovedSummaryPanel";

function OfferWorkspaceDetailPanel({
  offer,
  onRelease,
  onAccept,
  onNegotiate,
  onRevise,
  busy = false
}) {
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [proposedCtc, setProposedCtc] = useState("");
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [revisedCtc, setRevisedCtc] = useState("");
  const [reviseReason, setReviseReason] = useState("");

  if (!offer) {
    return <OfferApprovedSummaryPanel offer={null} />;
  }

  const status = String(offer.offerStatus || offer.offer_status || "");
  const canRelease = status === "Approved";
  const canRevise = ["Draft", "Approved", "Pending Approval"].includes(status);
  const canNegotiate = ["Approved", "Released"].includes(status);
  const canAccept = status === "Released";

  const handleNegotiate = async () => {
    await onNegotiate?.(offer.offerId, {
      proposed_ctc: Number(proposedCtc),
      notes: negotiationNotes
    });
    setNegotiateOpen(false);
    setProposedCtc("");
    setNegotiationNotes("");
  };

  const handleRevise = async () => {
    await onRevise?.(offer.offerId, {
      offered_ctc: Number(revisedCtc),
      reason: reviseReason
    });
    setReviseOpen(false);
    setRevisedCtc("");
    setReviseReason("");
  };

  return (
    <Stack spacing={1.5}>
      <OfferApprovedSummaryPanel offer={offer} />

      {(canRelease || canRevise || canNegotiate || canAccept) ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper"
          }}
        >
          {canRelease ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<SendOutlinedIcon />}
              disabled={busy}
              onClick={() => onRelease?.(offer.offerId)}
            >
              Release Offer
            </Button>
          ) : null}
          {canRevise ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon />}
              disabled={busy}
              onClick={() => {
                setRevisedCtc(String(offer.offeredCtc ?? offer.offered_ctc ?? ""));
                setReviseOpen(true);
              }}
            >
              Revise CTC
            </Button>
          ) : null}
          {canNegotiate ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<HandshakeOutlinedIcon />}
              disabled={busy}
              onClick={() => {
                setProposedCtc(String(offer.offeredCtc ?? offer.offered_ctc ?? ""));
                setNegotiateOpen(true);
              }}
            >
              Record Negotiation
            </Button>
          ) : null}
          {canAccept ? (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlinedIcon />}
              disabled={busy}
              onClick={() => onAccept?.(offer.offerId)}
            >
              Mark Accepted
            </Button>
          ) : null}
        </Box>
      ) : null}

      <Dialog open={negotiateOpen} onClose={() => setNegotiateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Negotiation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Proposed CTC"
              type="number"
              value={proposedCtc}
              onChange={(event) => setProposedCtc(event.target.value)}
              fullWidth
            />
            <TextField
              label="Notes"
              value={negotiationNotes}
              onChange={(event) => setNegotiationNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNegotiateOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !proposedCtc} onClick={handleNegotiate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reviseOpen} onClose={() => setReviseOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revise Offer CTC</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Offered CTC"
              type="number"
              value={revisedCtc}
              onChange={(event) => setRevisedCtc(event.target.value)}
              fullWidth
            />
            <TextField
              label="Reason"
              value={reviseReason}
              onChange={(event) => setReviseReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviseOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={busy || !revisedCtc} onClick={handleRevise}>
            Revise
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default OfferWorkspaceDetailPanel;
