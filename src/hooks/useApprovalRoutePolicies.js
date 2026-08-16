import { useCallback, useState } from "react";

import ApprovalRoutePolicyService from "@/services/approvalRoutePolicyService";

function extractPolicyPayload(response) {
  if (!response) {
    return null;
  }

  if (
    response.policy_id !== undefined
    || response.route_id !== undefined
  ) {
    return response;
  }

  return response.data ?? null;
}

function extractPolicyList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function useApprovalRoutePolicies() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await ApprovalRoutePolicyService.getApprovalRoutePolicies();
      const rows = extractPolicyList(response);
      setPolicies(rows);
      return rows;
    } catch (loadError) {
      const message =
        loadError.response?.data?.message
        || loadError.message
        || "Failed to load approval policies.";
      setError(message);
      setPolicies([]);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolicy = useCallback(async (policyId) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await ApprovalRoutePolicyService.getApprovalRoutePolicy(policyId);
      const policy = extractPolicyPayload(response);
      setSelectedPolicy(policy);
      return policy;
    } catch (loadError) {
      const message =
        loadError.response?.data?.message
        || loadError.message
        || "Failed to load approval policy.";
      setError(message);
      setSelectedPolicy(null);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPolicy = useCallback(async (policy) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await ApprovalRoutePolicyService.createApprovalRoutePolicy(policy);
      return extractPolicyPayload(response);
    } catch (createError) {
      const message =
        createError.response?.data?.message
        || createError.message
        || "Failed to create approval policy.";
      setError(message);
      throw createError;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (policyId, policy) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await ApprovalRoutePolicyService.updateApprovalRoutePolicy(
          policyId,
          policy
        );
      return extractPolicyPayload(response);
    } catch (updateError) {
      const message =
        updateError.response?.data?.message
        || updateError.message
        || "Failed to update approval policy.";
      setError(message);
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, []);

  const activatePolicy = useCallback(async (policyId) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await ApprovalRoutePolicyService.activateApprovalRoutePolicy(policyId);
      return extractPolicyPayload(response);
    } catch (activateError) {
      const message =
        activateError.response?.data?.message
        || activateError.message
        || "Failed to activate approval policy.";
      setError(message);
      throw activateError;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivatePolicy = useCallback(async (policyId) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await ApprovalRoutePolicyService.deactivateApprovalRoutePolicy(
          policyId
        );
      return extractPolicyPayload(response);
    } catch (deactivateError) {
      const message =
        deactivateError.response?.data?.message
        || deactivateError.message
        || "Failed to deactivate approval policy.";
      setError(message);
      throw deactivateError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    policies,
    selectedPolicy,
    loading,
    error,
    setSelectedPolicy,
    loadPolicies,
    loadPolicy,
    createPolicy,
    updatePolicy,
    activatePolicy,
    deactivatePolicy
  };
}

export default useApprovalRoutePolicies;
