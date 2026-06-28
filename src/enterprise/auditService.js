let correlationCounter = 1;

export function createCorrelationId() {
  const id = `COR-${Date.now()}-${correlationCounter}`;
  correlationCounter += 1;
  return id;
}

export function getCurrentUserContext() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return {
      user: user?.full_name || "Current User",
      role: user?.role_name || "Admin",
      userId: user?.id || null
    };
  } catch {
    return {
      user: "Current User",
      role: "Admin",
      userId: null
    };
  }
}

export function createAuditRecord({
  eventType,
  module,
  entity,
  entityId = null,
  action,
  previousValue = null,
  newValue = null,
  correlationId = null,
  metadata = {}
}) {

  const userContext = getCurrentUserContext();

  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    user: userContext.user,
    role: userContext.role,
    userId: userContext.userId,
    module,
    entity,
    entityId,
    action,
    eventType,
    previousValue,
    newValue,
    correlationId: correlationId || createCorrelationId(),
    metadata
  };

}

export function auditRecordToTimelineEvent(record) {

  return {
    id: record.id,
    time: record.timestamp,
    actor: record.user,
    role: record.role,
    action: record.action,
    event_type: record.eventType,
    stage_key: record.metadata?.stageKey || null,
    comment: record.metadata?.comment || null,
    module: record.module,
    correlationId: record.correlationId
  };

}

export default createAuditRecord;
