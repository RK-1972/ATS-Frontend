import { useCallback, useState } from "react";

import ApprovalRouteService from "@/services/approvalRouteService";

function useApprovalRoutes() {
  const [approvalRoutes, setApprovalRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadApprovalRoutes = useCallback(async (options = {}) => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (options.applies_to) {
        params.applies_to = options.applies_to;
      }

      const response = await ApprovalRouteService.getApprovalRoutes(params);
      setApprovalRoutes(response?.data || []);
      return response?.data || [];
    } catch (loadError) {
      const message =
        loadError.response?.data?.message ||
        loadError.message ||
        "Failed to load approval routes.";
      setError(message);
      setApprovalRoutes([]);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApprovalRoute = useCallback(async (routeId) => {
    setLoading(true);
    setError("");

    try {
      const response = await ApprovalRouteService.getApprovalRoute(routeId);
      const payload = response?.data || null;
      setSelectedRoute(payload);
      return payload;
    } catch (loadError) {
      const message =
        loadError.response?.data?.message ||
        loadError.message ||
        "Failed to load approval route.";
      setError(message);
      setSelectedRoute(null);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const createApprovalRoute = useCallback(async (route) => {
    setLoading(true);
    setError("");

    try {
      const response = await ApprovalRouteService.createApprovalRoute(route);
      return response?.data?.route_id ?? response?.data ?? null;
    } catch (createError) {
      const message =
        createError.response?.data?.message ||
        createError.message ||
        "Failed to create approval route.";
      setError(message);
      throw createError;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateApprovalRoute = useCallback(async (routeId, route) => {
    setLoading(true);
    setError("");

    try {
      const response = await ApprovalRouteService.updateApprovalRoute(
        routeId,
        route
      );
      return response?.data ?? null;
    } catch (updateError) {
      const message =
        updateError.response?.data?.message ||
        updateError.message ||
        "Failed to update approval route.";
      setError(message);
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approvalRoutes,
    selectedRoute,
    loading,
    error,
    loadApprovalRoutes,
    loadApprovalRoute,
    createApprovalRoute,
    updateApprovalRoute
  };
}

export default useApprovalRoutes;
