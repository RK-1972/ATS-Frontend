export function getPublishedRecords(masterData, entityType) {

  const records = masterData?.records?.[entityType] || [];

  return records.filter(
    (record) =>
      record.status === "Active" &&
      record.versionStatus === "Published"
  );

}

export function getPublishedRecordCodes(masterData, entityType) {

  return getPublishedRecords(masterData, entityType).map((record) => record.code);

}

export function getPublishedRecordNames(masterData, entityType) {

  return getPublishedRecords(masterData, entityType).map((record) => record.name);

}

export function getMasterDataOptions(masterData, entityType, fallback = []) {

  const codes = getPublishedRecordCodes(masterData, entityType);

  return codes.length ? codes : fallback;

}

export function findMasterRecord(masterData, entityType, code) {

  return (masterData?.records?.[entityType] || []).find(
    (record) => record.code === code
  );

}

export function getEntityTypeLabel(domains, entityType) {

  for (const domain of domains || []) {
    const match = domain.entityTypes.find((item) => item.key === entityType);

    if (match) {
      return match.label;
    }
  }

  return entityType;

}

export function getDomainForEntityType(domains, entityType) {

  return (domains || []).find((domain) =>
    domain.entityTypes.some((item) => item.key === entityType)
  );

}

export default getPublishedRecordCodes;
