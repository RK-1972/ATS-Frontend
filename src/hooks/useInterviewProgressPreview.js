import { useCallback, useRef, useState } from "react";

import interviewClient from "@/api/clients/interviewClient";

const previewCache = new Map();
const inflightRequests = new Map();

function buildCacheKey(mapId) {
  return `INTERVIEW:${String(mapId || "").trim()}`;
}

async function fetchInterviewProgressPreview(mapId) {
  const cacheKey = buildCacheKey(mapId);

  if (!mapId) {
    return null;
  }

  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey);
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const request = interviewClient
    .getInterviewProgress(mapId)
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

export function useInterviewProgressPreview(mapId) {
  const cacheKey = buildCacheKey(mapId);
  const [data, setData] = useState(() => previewCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapIdRef = useRef(mapId);
  mapIdRef.current = mapId;

  const load = useCallback(async () => {
    const id = mapIdRef.current;
    const key = buildCacheKey(id);

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
      const next = await fetchInterviewProgressPreview(id);
      setData(next);
      return next;
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message
          || loadError?.message
          || "Unable to load interview progress."
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

export function clearInterviewProgressPreviewCache(mapId) {
  if (mapId) {
    previewCache.delete(buildCacheKey(mapId));
    return;
  }

  previewCache.clear();
}
