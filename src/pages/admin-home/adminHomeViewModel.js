export function buildAdminHomeModel(raw) {
  const kpis = raw?.kpis || {};

  return {
    kpis: {
      totalUsers: Number(kpis.total_users) || 0,
      activeUsers: Number(kpis.active_users) || 0,
      pendingAccessItems: Number(kpis.pending_access_items) || 0,
      activeRequisitions: Number(kpis.active_requisitions) || 0,
      openWorkflowTasks: Number(kpis.open_workflow_tasks) || 0,
      governanceExceptions: Number(kpis.governance_exceptions) || 0
    },
    attentionItems: Array.isArray(raw?.attention_items) ? raw.attention_items : []
  };
}
