import { useCallback, useEffect, useState } from "react";

import candidateRepository from "@/repositories/candidateRepository";

function useOwnershipInbox() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOwnershipRequests = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const rows = await candidateRepository.getMyOwnershipRequests();
      setRequests(rows);
    } catch (loadError) {
      setError(loadError.message || "Failed to load ownership requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveOwnershipRequest = useCallback(async (requestId) => {
    const response =
      await candidateRepository.approveOwnershipRequest(requestId);

    await loadOwnershipRequests();

    return response;
  }, [loadOwnershipRequests]);

  const rejectOwnershipRequest = useCallback(async (requestId) => {
    const response =
      await candidateRepository.rejectOwnershipRequest(requestId);

    await loadOwnershipRequests();

    return response;
  }, [loadOwnershipRequests]);

  useEffect(() => {
    loadOwnershipRequests();
  }, [loadOwnershipRequests]);

  return {
    requests,
    isLoading,
    error,
    loadOwnershipRequests,
    approveOwnershipRequest,
    rejectOwnershipRequest
  };
}

export default useOwnershipInbox;
