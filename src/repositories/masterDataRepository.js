import { isLiveMode } from "@/api/config";
import { MASTER_DATA_DOMAINS } from "@/enterprise/masterDataConstants";
import masterDataClient from "@/api/clients/masterDataClient";
import masterDataMock from "@/data/mock/masterData.mock";
import { DEFAULT_USED_BY } from "@/enterprise/masterDataConstants";
import { cloneData } from "@/utils/cloneData";

function buildEmptyRecords() {
  return MASTER_DATA_DOMAINS.reduce((records, domain) => {
    domain.entityTypes.forEach((entity) => {
      records[entity.key] = [];
    });
    return records;
  }, {});
}

function getInitialState() {
  if (isLiveMode()) {
    return {
      meta: {
        org_name: "IGS Engineering Quality",
        last_published: null,
        environment: "Production",
        total_records: 0,
        published_records: 0,
        entity_type_count: Object.keys(buildEmptyRecords()).length
      },
      domains: MASTER_DATA_DOMAINS,
      records: buildEmptyRecords()
    };
  }

  return cloneData(masterDataMock);
}

async function getAll(currentData) {
  if (isLiveMode() || !currentData) {
    return masterDataClient.getAll();
  }

  return cloneData(currentData);
}

async function getById(entityType, id, currentData) {
  if (isLiveMode()) {
    return masterDataClient.getById(entityType, id, currentData);
  }

  return masterDataClient.getById(entityType, id, currentData);
}

function saveRecordLocal(masterData, { draftRecord, selectedEntityType, reason = "" }) {

  if (!draftRecord || !selectedEntityType) {
    return null;
  }

  const isNew = !draftRecord.id;
  const recordId = draftRecord.id || `md-${selectedEntityType}-${Date.now()}`;
  const previous = isNew
    ? null
    : masterData.records[selectedEntityType]?.find((item) => item.id === recordId);

  const savedRecord = {
    ...draftRecord,
    id: recordId,
    entityType: selectedEntityType,
    usedBy: draftRecord.usedBy?.length
      ? draftRecord.usedBy
      : DEFAULT_USED_BY[selectedEntityType] || [],
    lastUpdated: new Date().toISOString(),
    history: [
      ...(draftRecord.history || []),
      {
        version: draftRecord.version,
        status: draftRecord.versionStatus,
        date: new Date().toISOString(),
        user: "Current User",
        reason: reason || (isNew ? "Record created" : "Record updated")
      }
    ]
  };

  const nextMasterData = {
    ...masterData,
    records: {
      ...masterData.records,
      [selectedEntityType]: isNew
        ? [...(masterData.records[selectedEntityType] || []), savedRecord]
        : (masterData.records[selectedEntityType] || []).map((item) =>
            item.id === recordId ? savedRecord : item
          )
    },
    meta: {
      ...masterData.meta,
      total_records: isNew
        ? masterData.meta.total_records + 1
        : masterData.meta.total_records
    }
  };

  return {
    masterData: nextMasterData,
    savedRecord,
    previous,
    isNew,
    recordId,
    entityType: selectedEntityType
  };

}

async function saveRecord(masterData, params) {

  if (!isLiveMode()) {
    return saveRecordLocal(masterData, params);
  }

  const { draftRecord, selectedEntityType, reason = "" } = params;

  if (!draftRecord || !selectedEntityType) {
    return null;
  }

  const isNew = !draftRecord.id;
  const previous = isNew
    ? null
    : masterData.records[selectedEntityType]?.find((item) => item.id === draftRecord.id);

  const payload = {
    code: draftRecord.code,
    name: draftRecord.name,
    description: draftRecord.description,
    status: draftRecord.status,
    reason,
    usedBy: draftRecord.usedBy?.length
      ? draftRecord.usedBy
      : DEFAULT_USED_BY[selectedEntityType] || []
  };

  if (isNew) {
    await masterDataClient.create(selectedEntityType, payload);
  } else {
    await masterDataClient.update(selectedEntityType, draftRecord.id, payload);
  }

  const refreshed = await masterDataClient.getAll();
  const savedRecord = refreshed.records[selectedEntityType]?.find(
    (item) => item.id === draftRecord.id || item.code === draftRecord.code
  );

  return {
    masterData: refreshed,
    savedRecord,
    previous,
    isNew,
    recordId: savedRecord?.id,
    entityType: selectedEntityType,
    toastMessage: isNew ? "Master record created." : "Master record saved."
  };

}

function publishRecordLocal(masterData, { entityType, recordId, reason = "" }) {

  const record = masterData.records[entityType]?.find((item) => item.id === recordId);

  if (!record) {
    return null;
  }

  const nextVersion = `${parseFloat(record.version || "1.0") + 0.1}`.slice(0, 3);

  const nextMasterData = {
    ...masterData,
    records: {
      ...masterData.records,
      [entityType]: masterData.records[entityType].map((item) =>
        item.id === recordId
          ? {
              ...item,
              version: nextVersion,
              versionStatus: "Published",
              lastUpdated: new Date().toISOString(),
              history: [
                ...item.history,
                {
                  version: nextVersion,
                  status: "Published",
                  date: new Date().toISOString(),
                  user: "Current User",
                  reason: reason || "Published to production"
                }
              ]
            }
          : item
      )
    },
    meta: {
      ...masterData.meta,
      last_published: new Date().toISOString()
    }
  };

  return { masterData: nextMasterData, record, nextVersion, entityType, recordId };

}

async function publishRecord(masterData, params) {

  if (!isLiveMode()) {
    return publishRecordLocal(masterData, params);
  }

  const { entityType, recordId, reason = "" } = params;

  await masterDataClient.publish(entityType, recordId, { reason });
  const refreshed = await masterDataClient.getAll();
  const record = refreshed.records[entityType]?.find((item) => item.id === recordId);

  return {
    masterData: refreshed,
    record,
    nextVersion: record?.version,
    entityType,
    recordId,
    toastMessage: record ? `${record.name} published.` : "Master record published."
  };

}

function archiveRecordLocal(masterData, { entityType, recordId, reason = "" }) {

  const nextMasterData = {
    ...masterData,
    records: {
      ...masterData.records,
      [entityType]: masterData.records[entityType].map((item) =>
        item.id === recordId
          ? {
              ...item,
              status: "Inactive",
              versionStatus: "Archived",
              lastUpdated: new Date().toISOString(),
              history: [
                ...item.history,
                {
                  version: item.version,
                  status: "Archived",
                  date: new Date().toISOString(),
                  user: "Current User",
                  reason: reason || "Record archived"
                }
              ]
            }
          : item
      )
    }
  };

  return { masterData: nextMasterData, entityType, recordId, reason };

}

async function archiveRecord(masterData, params) {

  if (!isLiveMode()) {
    return archiveRecordLocal(masterData, params);
  }

  const { entityType, recordId, reason = "" } = params;

  await masterDataClient.archive(entityType, recordId, { reason });
  const refreshed = await masterDataClient.getAll();

  return {
    masterData: refreshed,
    entityType,
    recordId,
    reason,
    toastMessage: "Master record archived."
  };

}

function rollbackRecordLocal(masterData, { entityType, recordId, targetVersion, reason = "" }) {

  const record = masterData.records[entityType]?.find((item) => item.id === recordId);

  if (!record) {
    return null;
  }

  const nextMasterData = {
    ...masterData,
    records: {
      ...masterData.records,
      [entityType]: masterData.records[entityType].map((item) =>
        item.id === recordId
          ? {
              ...item,
              version: targetVersion,
              versionStatus: "Published",
              lastUpdated: new Date().toISOString(),
              history: [
                ...item.history,
                {
                  version: targetVersion,
                  status: "Published",
                  date: new Date().toISOString(),
                  user: "Current User",
                  reason: reason || `Rolled back to v${targetVersion}`
                }
              ]
            }
          : item
      )
    }
  };

  return { masterData: nextMasterData, record, entityType, recordId, targetVersion, reason };

}

async function rollbackRecord(masterData, params) {

  if (!isLiveMode()) {
    return rollbackRecordLocal(masterData, params);
  }

  const { entityType, recordId, targetVersion, reason = "" } = params;

  await masterDataClient.rollback(entityType, recordId, {
    targetVersion,
    reason
  });

  const refreshed = await masterDataClient.getAll();

  return {
    masterData: refreshed,
    record: refreshed.records[entityType]?.find((item) => item.id === recordId),
    entityType,
    recordId,
    targetVersion,
    reason,
    toastMessage: `Rolled back to version ${targetVersion}.`
  };

}

async function previewImport(masterData, { entityType, rows }) {

  if (isLiveMode()) {
    return masterDataClient.previewImport(entityType, rows);
  }

  const existingCodes = new Set(
    (masterData.records[entityType] || []).map((item) => item.code.toLowerCase())
  );

  return rows.map((row, index) => ({
    row: index + 1,
    code: row.code,
    name: row.name,
    description: row.description || "",
    status: existingCodes.has(row.code.toLowerCase()) ? "Duplicate" : "Valid"
  }));

}

function commitImportLocal(masterData, { entityType, rows, reason = "" }) {

  const existing = masterData.records[entityType] || [];
  const existingCodes = new Set(existing.map((item) => item.code.toLowerCase()));

  const newRecords = rows
    .filter((row) => !existingCodes.has(row.code.toLowerCase()))
    .map((row) => ({
      id: `md-${entityType}-${row.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      entityType,
      code: row.code,
      name: row.name,
      description: row.description || "",
      status: "Active",
      version: "1.0",
      versionStatus: "Draft",
      usedBy: [],
      lastUpdated: new Date().toISOString(),
      history: [{
        version: "1.0",
        status: "Draft",
        date: new Date().toISOString(),
        user: "Current User",
        reason: reason || "Imported from file"
      }]
    }));

  if (!newRecords.length) {
    return { masterData, newRecords, imported: false };
  }

  const nextMasterData = {
    ...masterData,
    records: {
      ...masterData.records,
      [entityType]: [...existing, ...newRecords]
    },
    meta: {
      ...masterData.meta,
      total_records: masterData.meta.total_records + newRecords.length
    }
  };

  return { masterData: nextMasterData, newRecords, imported: true, entityType };

}

async function commitImport(masterData, { entityType, rows, reason = "" }) {

  if (!isLiveMode()) {
    return commitImportLocal(masterData, { entityType, rows, reason });
  }

  const result = await masterDataClient.commitImport(entityType, rows, reason);

  if (!result.imported) {
    return { masterData, newRecords: [], imported: false };
  }

  return {
    masterData: result.masterData || await masterDataClient.getAll(),
    newRecords: result.records || [],
    imported: true,
    entityType,
    toastMessage: `${result.imported} record(s) imported.`
  };

}

async function exportRecords(masterData, entityType) {
  return masterData.records[entityType] || [];
}

const masterDataRepository = {
  getInitialState,
  getAll,
  getById,
  create: saveRecord,
  update: saveRecord,
  publish: publishRecord,
  archive: archiveRecord,
  delete: archiveRecord,
  saveRecord,
  publishRecord,
  archiveRecord,
  rollbackRecord,
  previewImport,
  commitImport,
  exportRecords
};

export default masterDataRepository;
