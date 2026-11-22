export function isMasterDataBulkPublishEligible(record) {
  return record?.versionStatus === "Draft";
}

export function buildBulkPublishSummary({ succeeded = [], failed = [] }) {
  const published = succeeded.length;
  const failedCount = failed.length;

  if (!published && !failedCount) {
    return "No records were published.";
  }

  if (!failedCount) {
    return `${published} record${published === 1 ? "" : "s"} published.`;
  }

  if (!published) {
    return `Bulk publish failed for ${failedCount} record${failedCount === 1 ? "" : "s"}.`;
  }

  return `${published} published, ${failedCount} failed.`;
}