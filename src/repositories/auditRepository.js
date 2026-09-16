import auditClient from "@/api/clients/auditClient";
import { createAuditRecord } from "@/enterprise/auditService";
import { cloneData } from "@/utils/cloneData";

function getInitialState() {
  return [];
}

function normalizeMetadata(value) {
  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return cloneData(value);
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function mapApiAuditRecord(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  if (row.id && row.timestamp) {
    return {
      id: row.id,
      timestamp: row.timestamp,
      user: row.user,
      role: row.role,
      userId: row.userId ?? null,
      module: row.module,
      entity: row.entity,
      entityId: row.entityId ?? row.entity_id ?? null,
      action: row.action,
      eventType: row.eventType ?? row.event_type,
      previousValue: row.previousValue ?? row.previous_value ?? null,
      newValue: row.newValue ?? row.new_value ?? null,
      correlationId: row.correlationId ?? row.correlation_id ?? null,
      metadata: normalizeMetadata(row.metadata)
    };
  }

  const createdOn = row.created_on;

  return {
    id: row.audit_id,
    timestamp: createdOn instanceof Date ? createdOn.toISOString() : createdOn,
    user: row.user_name,
    role: row.user_role,
    userId: null,
    module: row.module,
    entity: row.entity,
    entityId: row.entity_id ?? null,
    action: row.action,
    eventType: row.event_type,
    previousValue: row.previous_value ?? null,
    newValue: row.new_value ?? null,
    correlationId: row.correlation_id ?? null,
    metadata: normalizeMetadata(row.metadata)
  };
}

function unwrapAuditItems(response) {
  const payload = response?.data ?? response;
  const items = payload?.items ?? payload;

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map(mapApiAuditRecord)
    .filter(Boolean);
}

async function getAll(options = {}) {
  const response = await auditClient.getAll(options);
  return unwrapAuditItems(response);
}

async function getById(id, currentEvents = []) {
  const response = await auditClient.getById(id, currentEvents);
  return mapApiAuditRecord(response?.data ?? response);
}

function create(currentEvents, eventType, auditPayload) {

  const record = createAuditRecord({
    eventType,
    ...auditPayload
  });

  return {
    events: [...currentEvents, record],
    record
  };

}

function appendEvent(currentEvents, record) {
  return [...currentEvents, record];
}

const auditRepository = {
  getInitialState,
  getAll,
  getById,
  create,
  update: create,
  publish: create,
  archive: create,
  delete: create,
  appendEvent,
  mapApiAuditRecord
};

export default auditRepository;
