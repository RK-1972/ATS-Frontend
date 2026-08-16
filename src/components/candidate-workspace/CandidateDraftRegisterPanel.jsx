import { useState } from "react";

import { Alert, Button, Stack } from "@mui/material";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";

import RegisterCandidateDestinationDialog from "@/components/recruitment/RegisterCandidateDestinationDialog";
import candidateClient from "@/api/clients/candidateClient";
import {
  buildDraftUpdatePayload,
  candidateMasterToEditableCandidate,
  validateRegisterCandidate
} from "@/utils/candidateRegistrationUtils";

function CandidateDraftRegisterPanel({
  candidate,
  onRegistered
}) {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [candidateContainer, setCandidateContainer] = useState("PIPELINE");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDraft =
    String(candidate?.candidate_status || "").trim().toUpperCase() === "DRAFT";

  if (!isDraft) {
    return null;
  }

  const handleRegisterCandidate = async () => {
    setErrorMessage("");

    const editableCandidate = candidateMasterToEditableCandidate(candidate);
    const profileErrors = validateRegisterCandidate(editableCandidate);

    if (Object.keys(profileErrors).length > 0) {
      setErrorMessage(
        "Complete required candidate details before registering."
      );
      setRegisterDialogOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");
      const payload = buildDraftUpdatePayload(
        editableCandidate,
        candidateContainer || "PIPELINE"
      );
      const formData = new FormData();

      Object.entries(payload).forEach(([field, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(field, value);
        }
      });

      if (loggedInUser?.employee_code) {
        formData.append("created_by", loggedInUser.employee_code);
      }

      const response = await candidateClient.updateCandidate(
        candidate.candidate_id,
        formData
      );

      if (response?.success === false) {
        throw new Error(response.message || "Failed to register candidate.");
      }

      setRegisterDialogOpen(false);
      onRegistered?.(response?.data || response);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to register candidate."
      );
      setRegisterDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack spacing={1} sx={{ mb: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<HowToRegOutlinedIcon />}
          onClick={() => {
            setErrorMessage("");
            setCandidateContainer("PIPELINE");
            setRegisterDialogOpen(true);
          }}
          sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600 }}
        >
          Register Candidate
        </Button>
        {errorMessage ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}
      </Stack>

      <RegisterCandidateDestinationDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        selectedContainer={candidateContainer}
        onSelectContainer={setCandidateContainer}
        onConfirm={handleRegisterCandidate}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

export default CandidateDraftRegisterPanel;
