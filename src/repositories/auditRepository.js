import auditClient from "@/api/clients/auditClient";
import { createAuditRecord } from "@/enterprise/auditService";

function getInitialState() {
  return [];
}

async function getAll(currentEvents = []) {
  return auditClient.getAll(currentEvents);
}

async function getById(id, currentEvents = []) {
  return auditClient.getById(id, currentEvents);
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
  appendEvent
};

export default auditRepository;
