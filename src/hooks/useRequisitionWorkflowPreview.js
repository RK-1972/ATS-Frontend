import { useCallback, useRef, useState } from "react";

import workforcePlanningClient from "@/api/clients/workforcePlanningClient";

const previewCache = new Map();
const inflightRequests = new Map();

function buildCacheKey(documentType, documentId) {
  return `${String(documentType || "").trim().toUpperCase()}:${String(documentId || "").trim()}`;
}

async function fetchApprovalWorkflowPreview(documentType, documentId) {
  const cacheKey = buildCacheKey(documentType, documentId);

  if (!documentId) {
    return null;
  }

  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey);
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const normalizedType = String(documentType || "").trim().toUpperCase();
  const clientRequest =
    normalizedType === "BUDGET"
      ? workforcePlanningClient.getBudgetActionContext(documentId)
      : workforcePlanningClient.getRequisitionActionContext(documentId);

  const request = clientRequest
    .then((response) => {
      const data = response?.data || response || null;
      previewCache.set(cacheKey, data);
      inflightRequests.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      inflightRequests.delete(cacheKey);
      throw error;
    });

  inflightRequests.set(cacheKey, request);
  return request;
}

export function useApprovalWorkflowPreview(documentType, documentId) {
  const cacheKey = buildCacheKey(documentType, documentId);
  const [data, setData] = useState(() => previewCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const contextRef = useRef({ documentType, documentId });
  contextRef.current = { documentType, documentId };

  const load = useCallback(async () => {
    const { documentType: type, documentId: id } = contextRef.current;
    const key = buildCacheKey(type, id);

    if (!id) {
      return null;
    }

    const cached = previewCache.get(key);

    if (cached) {
      setData(cached);
      setError("");
      return cached;
    }

    setLoading(true);
    setError("");

    try {
      const next = await fetchApprovalWorkflowPreview(type, id);
      setData(next);
      return next;
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message
          || loadError?.message
          || "Unable to load approval progress."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    load
  };
}

export function useRequisitionWorkflowPreview(requisitionCode) {
  return useApprovalWorkflowPreview("REQUISITION", requisitionCode);
}

export function clearRequisitionWorkflowPreviewCache(requisitionCode) {
  if (requisitionCode) {
    previewCache.delete(buildCacheKey("REQUISITION", requisitionCode));
    return;
  }

  previewCache.clear();
}

export function clearApprovalWorkflowPreviewCache(documentType, documentId) {
  if (documentType && documentId) {
    previewCache.delete(buildCacheKey(documentType, documentId));
    return;
  }

  previewCache.clear();
}
