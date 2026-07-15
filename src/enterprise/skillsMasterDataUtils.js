import { getPublishedRecords } from "@/enterprise/masterDataHelpers";

export const SKILLS_ENTITY = "skills";
export const SKILL_CATEGORIES_ENTITY = "skill_categories";

export function getSkillCategoryOptions(masterData) {
  return getPublishedRecords(masterData, SKILL_CATEGORIES_ENTITY).map((record) => ({
    code: record.code,
    name: record.name,
    label: `${record.code} — ${record.name}`
  }));
}

export function resolveSkillCategoryLabel(record, masterData) {
  if (record.skillCategory) {
    return record.skillCategory;
  }

  const match = getPublishedRecords(masterData, SKILL_CATEGORIES_ENTITY).find(
    (item) => item.code === record.skillCategoryCode
  );

  return match?.name || record.skillCategoryCode || "—";
}

export function filterSkillsRecords(records, { searchQuery, statusFilter, skillCategoryFilter }, masterData) {
  const query = searchQuery.trim().toLowerCase();

  return records.filter((record) => {
    const categoryLabel = resolveSkillCategoryLabel(record, masterData).toLowerCase();
    const categoryCode = (record.skillCategoryCode || "").toLowerCase();

    const matchesSearch =
      !query
      || record.name.toLowerCase().includes(query)
      || record.code.toLowerCase().includes(query)
      || (record.description || "").toLowerCase().includes(query)
      || categoryLabel.includes(query)
      || categoryCode.includes(query);

    const matchesStatus =
      statusFilter === "all"
      || record.status.toLowerCase() === statusFilter.toLowerCase()
      || record.versionStatus.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      skillCategoryFilter === "all"
      || record.skillCategoryCode === skillCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });
}

export function parseSkillsImportCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const parts = line.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));

    return {
      code: parts[0] || "",
      skillCategory: parts[1] || "",
      name: parts[2] || "",
      description: parts[3] || ""
    };
  }).filter((row) => row.code || row.name || row.skillCategory);
}

export function buildSkillsExportCsv(records) {
  const header = "Code,Skill Category,Name,Description,Status,Version,Version Status,Last Updated";
  const rows = records.map((record) =>
    [
      record.code,
      record.skillCategory || record.skillCategoryCode || "",
      record.name,
      `"${(record.description || "").replace(/"/g, '""')}"`,
      record.status,
      record.version,
      record.versionStatus,
      record.lastUpdated
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

export function previewSkillsImportLocal(masterData, rows) {
  const existing = masterData.records[SKILLS_ENTITY] || [];
  const existingCodes = new Set(existing.map((item) => item.code.toLowerCase()));
  const existingNames = new Set(existing.map((item) => item.name.toLowerCase()));
  const categories = getPublishedRecords(masterData, SKILL_CATEGORIES_ENTITY);
  const categoryCodes = new Set(categories.map((item) => item.code.toLowerCase()));
  const categoryNames = new Set(categories.map((item) => item.name.toLowerCase()));
  const batchCodes = new Set();
  const batchNames = new Set();

  return rows.map((row, index) => {
    const code = String(row.code || "").trim();
    const name = String(row.name || "").trim();
    const skillCategory = String(row.skillCategory || row.skillCategoryCode || "").trim();
    const normalizedCode = code.toLowerCase();
    const normalizedName = name.toLowerCase();
    const normalizedCategory = skillCategory.toLowerCase();
    const issues = [];

    if (!code) {
      issues.push("Code is required");
    }

    if (!skillCategory) {
      issues.push("Skill Category is required");
    } else if (
      !categoryCodes.has(normalizedCategory)
      && !categoryNames.has(normalizedCategory)
      && !categories.some((item) =>
        item.code.toLowerCase().includes(normalizedCategory)
        || item.name.toLowerCase().includes(normalizedCategory)
      )
    ) {
      issues.push(`Skill Category "${skillCategory}" not found`);
    }

    if (!name) {
      issues.push("Name is required");
    }

    if (code && existingCodes.has(normalizedCode)) {
      issues.push("Duplicate code in master data");
    }

    if (name && existingNames.has(normalizedName)) {
      issues.push("Duplicate name in master data");
    }

    if (code && batchCodes.has(normalizedCode)) {
      issues.push("Duplicate code in upload file");
    }

    if (name && batchNames.has(normalizedName)) {
      issues.push("Duplicate name in upload file");
    }

    if (code) {
      batchCodes.add(normalizedCode);
    }

    if (name) {
      batchNames.add(normalizedName);
    }

    return {
      row: index + 1,
      code,
      skillCategory,
      name,
      description: row.description || "",
      status: issues.length ? issues.join("; ") : "Valid"
    };
  });
}

export function resolveSkillCategoryCode(masterData, input) {
  const value = String(input || "").trim();

  if (!value) {
    return "";
  }

  const match = getPublishedRecords(masterData, SKILL_CATEGORIES_ENTITY).find(
    (item) =>
      item.code.toLowerCase() === value.toLowerCase()
      || item.name.toLowerCase() === value.toLowerCase()
  );

  return match?.code || "";
}
