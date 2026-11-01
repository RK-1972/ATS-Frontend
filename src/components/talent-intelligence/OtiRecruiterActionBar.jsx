import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from "@mui/material";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";

import recruitmentClient from "@/api/clients/recruitmentClient";
import candidateRepository from "@/repositories/candidateRepository";

function OtiRecruiterActionBar({ row, requisitionCode, onActionRecorded }) {
  const navigate = useNavigate();
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [isMapping, setIsMapping] = useState(false);

  const recordAction = async (actionType, note = "") => {
    if (!row?.result_id) {
      return;
    }

    setBusyAction(actionType);
    setError("");

    try {
      await recruitmentClient.postTalentIntelligenceAction(row.result_id, {
        action_type: actionType,
        note
      });
      onActionRecorded?.(actionType, row);
    } catch (actionError) {
      setError(
        actionError.response?.data?.message ||
          actionError.message ||
          "Failed to record action."
      );
    } finally {
      setBusyAction("");
    }
  };

  const handleConfirmMap = async () => {
    if (!row?.candidate_id || !requisitionCode) {
      return;
    }

    setIsMapping(true);
    setError("");

    try {
      await recordAction("request_map", "Recruiter confirmed mapping intent");
      await candidateRepository.mapCandidateToRequisition({
        candidate_id: row.candidate_id,
        requisition_code: requisitionCode
      });
      setMapDialogOpen(false);
      onActionRecorded?.("mapped", row);
    } catch (mapError) {
      setError(
        mapError.response?.data?.message ||
          mapError.message ||
          "Mapping failed."
      );
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
        sx={{ rowGap: 0.75, columnGap: 0.75, width: "100%" }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<StarOutlineOutlinedIcon />}
          disabled={Boolean(busyAction)}
          onClick={() => recordAction("shortlist")}
          sx={{ flexShrink: 0 }}
        >
          Shortlist
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<HighlightOffOutlinedIcon />}
          disabled={Boolean(busyAction)}
          onClick={() => recordAction("dismiss")}
          sx={{ flexShrink: 0 }}
        >
          Dismiss
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          disabled={Boolean(busyAction) || !requisitionCode}
          onClick={() => setMapDialogOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          Map
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={() => navigate(`/candidates/${row.candidate_id}`)}
          sx={{ flexShrink: 0, minWidth: 0, px: 1 }}
        >
          Profile
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : null}

      <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm candidate mapping</DialogTitle>
        <DialogContent>
          Map {row?.candidate_name || "this candidate"} to {requisitionCode}? This uses the
          standard recruitment mapping workflow and requires your explicit confirmation.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmMap} disabled={isMapping}>
            {isMapping ? "Mapping…" : "Confirm map"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default OtiRecruiterActionBar;
