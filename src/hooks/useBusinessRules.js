import { useCallback, useMemo } from "react";

import useEnterpriseStore from "@/store/enterpriseStore";
import businessRulesRepository from "@/repositories/businessRulesRepository";

function useBusinessRules() {

  const config = useEnterpriseStore((state) => state.businessRules);
  const platformConfig = useEnterpriseStore((state) => state.platformConfig);
  const isDirty = useEnterpriseStore((state) => state.businessRulesDirty);
  const draftRule = useEnterpriseStore((state) => state.businessRulesUi.draftRule);
  const simulationInput = useEnterpriseStore(
    (state) => state.businessRulesUi.simulationInput
  );
  const simulationResult = useEnterpriseStore(
    (state) => state.businessRulesUi.simulationResult
  );

  const updateBusinessRulesState = useEnterpriseStore(
    (state) => state.updateBusinessRulesState
  );
  const setBusinessRulesUi = useEnterpriseStore((state) => state.setBusinessRulesUi);
  const setBusinessRulesDirty = useEnterpriseStore(
    (state) => state.setBusinessRulesDirty
  );
  const saveChanges = useEnterpriseStore((state) => state.saveBusinessRules);
  const discardChanges = useEnterpriseStore((state) => state.discardBusinessRules);

  const markDirty = useCallback(() => {
    setBusinessRulesDirty();
  }, [setBusinessRulesDirty]);

  const updateApprovalMatrix = useCallback((rowId, field, value) => {

    updateBusinessRulesState((prev) => ({
      ...prev,
      approval_matrix: prev.approval_matrix.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    }));

  }, [updateBusinessRulesState]);

  const loadRuleForEdit = useCallback((ruleId) => {

    const rule = config.rules.find((item) => item.id === ruleId);

    if (rule) {
      setBusinessRulesUi((prev) => ({ ...prev, draftRule: { ...rule } }));
    }

  }, [config.rules, setBusinessRulesUi]);

  const startNewRule = useCallback(() => {
    setBusinessRulesUi((prev) => ({
      ...prev,
      draftRule: {
        id: `rule-new-${Date.now()}`,
        ...businessRulesRepository.getDesignerDefaults(),
        conditions: [""],
        actions: [""]
      }
    }));
    markDirty();
  }, [markDirty, setBusinessRulesUi]);

  const updateDraftRule = useCallback((field, value) => {

    setBusinessRulesUi((prev) => {
      if (!prev.draftRule) {
        return prev;
      }
      return {
        ...prev,
        draftRule: { ...prev.draftRule, [field]: value }
      };
    });

    markDirty();

  }, [markDirty, setBusinessRulesUi]);

  const updateDraftListField = useCallback((field, index, value) => {

    setBusinessRulesUi((prev) => {
      if (!prev.draftRule) {
        return prev;
      }
      const list = [...prev.draftRule[field]];
      list[index] = value;
      return {
        ...prev,
        draftRule: { ...prev.draftRule, [field]: list }
      };
    });

    markDirty();

  }, [markDirty, setBusinessRulesUi]);

  const addDraftListItem = useCallback((field) => {

    setBusinessRulesUi((prev) => {
      if (!prev.draftRule) {
        return prev;
      }
      return {
        ...prev,
        draftRule: { ...prev.draftRule, [field]: [...prev.draftRule[field], ""] }
      };
    });

    markDirty();

  }, [markDirty, setBusinessRulesUi]);

  const saveDraftRule = useCallback(() => {

    if (!draftRule) {
      return;
    }

    updateBusinessRulesState((prev) => {

      const exists = prev.rules.some((rule) => rule.id === draftRule.id);

      const updatedRule = {
        ...draftRule,
        last_modified: new Date().toISOString()
      };

      return {
        ...prev,
        rules: exists
          ? prev.rules.map((rule) =>
              rule.id === draftRule.id ? updatedRule : rule
            )
          : [...prev.rules, updatedRule],
        kpis: {
          ...prev.kpis,
          total_rules: exists
            ? prev.kpis.total_rules
            : prev.kpis.total_rules + 1,
          draft_rules: updatedRule.status === "Draft"
            ? prev.kpis.draft_rules + (exists ? 0 : 1)
            : prev.kpis.draft_rules
        }
      };

    });

    markDirty();

  }, [draftRule, markDirty, updateBusinessRulesState]);

  const updateSimulationInput = useCallback((field, value) => {
    setBusinessRulesUi((prev) => ({
      ...prev,
      simulationInput: { ...prev.simulationInput, [field]: value }
    }));
  }, [setBusinessRulesUi]);

  const runSimulation = useCallback(() => {

    const { offered_salary_lpa, department, grade, location } = simulationInput;
    const threshold = platformConfig?.budget?.max_budget_variance_pct ?? 10;

    const matrixRow = config.approval_matrix.find(
      (row) => row.department === department && row.grade === grade
    );

    const triggeredRules = [];
    const approvers = matrixRow
      ? [...(matrixRow.required_approvers ?? [])]
      : ["Hiring Manager"];
    const notifications = [];
    let estimatedSla = "24 hours";

    if (
      matrixRow &&
      offered_salary_lpa > matrixRow.budget_limit_lpa
    ) {
      triggeredRules.push("Offer Above Budget");
      approvers.push("Finance Approver");
      notifications.push("Budget exception alert to TA Lead");
      notifications.push("Finance approval request");
      estimatedSla = "48 hours";
    }

    if (grade >= "G10" || ["G10", "G11", "G12"].includes(grade)) {
      if (!triggeredRules.includes("Offer Approval Based on Grade")) {
        triggeredRules.push("Offer Approval Based on Grade");
      }
      if (!approvers.includes("TA Lead")) {
        approvers.push("TA Lead");
      }
    }

    if (["Mumbai", "Delhi", "Hyderabad"].includes(location)) {
      triggeredRules.push("Location Based Hiring Approval");
      notifications.push("HRBP review required — restricted location");
      estimatedSla = "72 hours";
    }

    if (triggeredRules.length === 0) {
      triggeredRules.push("Standard Offer Approval");
      notifications.push("Offer approval notification to Hiring Manager");
    }

    if (matrixRow?.escalation) {
      notifications.push(`Escalation policy: ${matrixRow.escalation}`);
    }

    const uniqueApprovers = [...new Set(approvers)];
    const uniqueNotifications = [...new Set(notifications)];

    setBusinessRulesUi((prev) => ({
      ...prev,
      simulationResult: {
        triggered_rules: triggeredRules,
        approvers: uniqueApprovers,
        notifications: uniqueNotifications,
        estimated_sla: estimatedSla,
        budget_threshold_pct: threshold
      }
    }));

  }, [
    simulationInput,
    config.approval_matrix,
    platformConfig?.budget?.max_budget_variance_pct,
    setBusinessRulesUi
  ]);

  const rollbackVersion = useCallback((versionId) => {

    const entry = config.version_history.find((version) => version.id === versionId);

    if (entry) {
      markDirty();
    }

  }, [config.version_history, markDirty]);

  const compareVersion = useCallback((versionId) => {
    return config.version_history.find((version) => version.id === versionId);
  }, [config.version_history]);

  const filteredRules = useCallback((searchTerm, categoryFilter) => {

    return config.rules.filter((rule) => {

      const matchesSearch =
        !searchTerm ||
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !categoryFilter ||
        categoryFilter === "all" ||
        rule.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;

    });

  }, [config.rules]);

  return {
    config,
    isDirty,
    draftRule,
    simulationInput,
    simulationResult,
    saveChanges,
    discardChanges,
    updateApprovalMatrix,
    loadRuleForEdit,
    startNewRule,
    updateDraftRule,
    updateDraftListField,
    addDraftListItem,
    saveDraftRule,
    updateSimulationInput,
    runSimulation,
    rollbackVersion,
    compareVersion,
    filteredRules
  };

}

export default useBusinessRules;
