import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { readNavigationFilters } from "@/copilot/core/navigationPayload";

/**
 * Apply generic navigation filters once when the page mounts / state arrives.
 * Pages supply how to map filters onto their existing UI controls.
 *
 * Not Copilot-specific — any caller may navigate with `{ state: { filters } }`.
 */
export function useNavigationFilters(onFilters) {
  const location = useLocation();
  const onFiltersRef = useRef(onFilters);
  onFiltersRef.current = onFilters;
  const appliedKeyRef = useRef("");

  useEffect(() => {
    const filters = readNavigationFilters(location.state);

    if (!filters) {
      return;
    }

    const key = JSON.stringify(filters);

    if (appliedKeyRef.current === key) {
      return;
    }

    appliedKeyRef.current = key;
    onFiltersRef.current?.(filters);
  }, [location.state]);
}
