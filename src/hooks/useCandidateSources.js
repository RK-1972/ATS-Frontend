import { useEffect, useState } from "react";

import candidateRepository from "@/repositories/candidateRepository";

function useCandidateSources() {
  const [candidateSources, setCandidateSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCandidateSources = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await candidateRepository.getCandidateSources();

        if (!cancelled) {
          setCandidateSources(rows || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load candidate sources.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCandidateSources();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    candidateSources,
    loading,
    error
  };
}

export default useCandidateSources;
