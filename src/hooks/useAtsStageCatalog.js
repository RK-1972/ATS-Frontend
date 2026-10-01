import { useCallback, useEffect, useState } from "react";

import recruitmentRepository from "@/repositories/recruitmentRepository";

let cachedStages = null;
let inflightRequest = null;

async function loadCatalogStages() {
  if (cachedStages) {
    return cachedStages;
  }

  if (!inflightRequest) {
    inflightRequest = recruitmentRepository
      .listAtsStageCatalog()
      .then((stages) => {
        cachedStages = stages;
        return stages;
      })
      .catch((error) => {
        inflightRequest = null;
        throw error;
      });
  }

  return inflightRequest;
}

function resolveCatalogLoadError(loadError) {
  return (
    loadError.response?.data?.message ||
    loadError.message ||
    "Failed to load ATS stage catalog."
  );
}

function useAtsStageCatalog() {
  const [stages, setStages] = useState(cachedStages || []);
  const [isLoading, setIsLoading] = useState(!cachedStages);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    cachedStages = null;
    inflightRequest = null;
    setIsLoading(true);
    setError("");

    try {
      const rows = await loadCatalogStages();
      setStages(rows);
      return rows;
    } catch (loadError) {
      const message = resolveCatalogLoadError(loadError);
      setStages([]);
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      if (cachedStages) {
        setStages(cachedStages);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const rows = await loadCatalogStages();
        if (active) {
          setStages(rows);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message = resolveCatalogLoadError(loadError);
        setStages([]);
        setError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const stageLabels = stages.map((stage) => stage.display_name);

  return {
    stages,
    stageLabels,
    isLoading,
    error,
    isEmpty: !isLoading && stages.length === 0 && !error,
    isUnavailable: !isLoading && Boolean(error),
    reload
  };
}

export default useAtsStageCatalog;
