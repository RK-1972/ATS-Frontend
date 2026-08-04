/**
 * Generic navigation payload for deep-linking into existing pages.
 * Pages may consume `filters` without knowing about Copilot.
 */

export type NavigationFilters = {
  /** Free-text / search-box filter (most list pages). */
  search?: string;
  [key: string]: string | number | boolean | undefined;
};

export type NavigationPayload = {
  path: string;
  filters?: NavigationFilters;
};

export const NAVIGATION_STATE_KEY = "filters" as const;

/**
 * Build React Router location.state from a NavigationPayload.
 * Returns undefined when there are no filters (plain navigation).
 */
export function toLocationState(
  payload: NavigationPayload
): { filters: NavigationFilters } | undefined {
  if (!payload.filters || Object.keys(payload.filters).length === 0) {
    return undefined;
  }

  return { filters: { ...payload.filters } };
}

/**
 * Read generic filters from location.state (any producer may set them).
 */
export function readNavigationFilters(
  locationState: unknown
): NavigationFilters | null {
  if (!locationState || typeof locationState !== "object") {
    return null;
  }

  const filters = (locationState as { filters?: unknown }).filters;

  if (!filters || typeof filters !== "object") {
    return null;
  }

  return filters as NavigationFilters;
}
