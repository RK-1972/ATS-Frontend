import { useCallback, useEffect, useMemo, useState } from "react";

import recruitmentClient from "@/api/clients/recruitmentClient";

function dedupeByMapId(rows) {
  const seen = new Set();
  const result = [];

  for (const row of rows || []) {
    const key = row?.map_id ?? `${row?.candidate_id}-${row?.requisition_code}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(row);
  }

  return result;
}

function useHiringManagerWorkspace() {
  const [requisitions, setRequisitions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedRequisitionCode, setSelectedRequisitionCode] = useState("");
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [isLoadingRequisitions, setIsLoadingRequisitions] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [requisitionError, setRequisitionError] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const loadRequisitions = useCallback(async () => {
    setIsLoadingRequisitions(true);
    setRequisitionError("");
    setAccessDenied(false);

    try {
      const response = await recruitmentClient.listMyHmRequisitions();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setRequisitions(rows);

      setSelectedRequisitionCode((current) =>
        current || rows[0]?.requisition_code || ""
      );
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load requisitions.";

      setRequisitions([]);

      if (status === 403) {
        setAccessDenied(true);
      } else {
        setRequisitionError(message);
      }
    } finally {
      setIsLoadingRequisitions(false);
    }
  }, []);

  const loadCandidates = useCallback(async (requisitionCode) => {
    if (!requisitionCode) {
      setCandidates([]);
      setSelectedMapId(null);
      return;
    }

    setIsLoadingCandidates(true);
    setCandidateError("");

    try {
      const response = await recruitmentClient.listMyHmCandidates({
        requisitionCode
      });
      const rows = dedupeByMapId(
        Array.isArray(response?.data) ? response.data : []
      );
      setCandidates(rows);
      setSelectedMapId((current) =>
        rows.some((row) => row.map_id === current)
          ? current
          : rows[0]?.map_id ?? null
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load candidates.";

      setCandidates([]);
      setSelectedMapId(null);
      setCandidateError(message);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }

      await loadRequisitions();
    })();

    return () => {
      cancelled = true;
    };
  }, [loadRequisitions]);

  useEffect(() => {
    if (!selectedRequisitionCode) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }

      await loadCandidates(selectedRequisitionCode);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRequisitionCode, loadCandidates]);

  const selectedRequisition = useMemo(
    () =>
      requisitions.find(
        (row) => row.requisition_code === selectedRequisitionCode
      ) || null,
    [requisitions, selectedRequisitionCode]
  );

  const filteredCandidates = useMemo(() => {
    const query = String(candidateSearch || "").trim().toLowerCase();

    if (!query) {
      return candidates;
    }

    return candidates.filter((row) => {
      const haystack = [
        row.first_name,
        row.last_name,
        row.candidate_code,
        row.email_id,
        row.stage_name,
        row.job_title
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [candidates, candidateSearch]);

  const selectedCandidate = useMemo(
    () =>
      filteredCandidates.find((row) => row.map_id === selectedMapId) ||
      candidates.find((row) => row.map_id === selectedMapId) ||
      null,
    [filteredCandidates, candidates, selectedMapId]
  );

  const selectRequisition = useCallback((requisitionCode) => {
    setSelectedRequisitionCode(requisitionCode || "");
    setSelectedMapId(null);
    setCandidateSearch("");

    if (!requisitionCode) {
      setCandidates([]);
    }
  }, []);

  const selectCandidate = useCallback((mapId) => {
    setSelectedMapId(mapId ?? null);
  }, []);

  return {
    requisitions,
    candidates: filteredCandidates,
    selectedRequisition,
    selectedRequisitionCode,
    selectedCandidate,
    selectedMapId,
    candidateSearch,
    setCandidateSearch,
    isLoadingRequisitions,
    isLoadingCandidates,
    requisitionError,
    candidateError,
    accessDenied,
    loadRequisitions,
    loadCandidates,
    selectRequisition,
    selectCandidate
  };
}

export default useHiringManagerWorkspace;
