import { findMasterRecord } from "@/enterprise/masterDataHelpers";

export function parseRequisitionSkillCodes(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinRequisitionSkillCodes(codes = []) {
  const unique = [];

  for (const code of codes) {
    const normalized = String(code || "").trim();
    if (!normalized || unique.includes(normalized)) {
      continue;
    }
    unique.push(normalized);
  }

  return unique.join(",");
}

export function resolveRequisitionSkillLabel(code, masterData) {
  const normalized = String(code || "").trim();
  if (!normalized) {
    return "";
  }

  const record = findMasterRecord(masterData, "skills", normalized);
  return record?.name || normalized;
}

export function formatRequisitionSkillDisplay(value, masterData) {
  const codes = parseRequisitionSkillCodes(value);
  if (!codes.length) {
    return "";
  }

  return codes
    .map((code) => resolveRequisitionSkillLabel(code, masterData))
    .join(", ");
}

export function buildRequisitionSkillOptions(masterData) {
  const records = masterData?.records?.skills || [];

  return records
    .filter(
      (record) =>
        record.status === "Active" && record.versionStatus === "Published"
    )
    .map((record) => ({
      code: record.code,
      name: record.name,
      label: record.name
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}
