import { useState } from "react";

import candidateRepository from "@/repositories/candidateRepository";

function useCandidateIntake() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createCandidateIntake = async (data) => {
    setError("");

    setSubmitting(true);

    try {
      const record = await candidateRepository.createCandidateIntake(data);

      return record;
    } catch (submitError) {
      setError(
        submitError.message || "Failed to create candidate intake record."
      );

      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  const processResume = async (intakeId, resumeFile) => {
    setError("");

    setSubmitting(true);

    try {
      const response =
        await candidateRepository.processCandidateIntakeResume(
          intakeId,
          resumeFile
        );

      return response;
    } catch (submitError) {
      setError(
        submitError.message || "Failed to process candidate intake resume."
      );

      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  const parseResume = async (intakeId) => {
    setError("");

    setSubmitting(true);

    try {
      const response =
        await candidateRepository.parseCandidateIntakeResume(intakeId);

      return response;
    } catch (submitError) {
      setError(
        submitError.message || "Failed to parse candidate intake resume."
      );

      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    createCandidateIntake,
    processResume,
    parseResume,
    submitting,
    error
  };
}

export default useCandidateIntake;
