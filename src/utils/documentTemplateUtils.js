export const DOCUMENT_CATEGORIES = [
  "Offer Letter",
  "Appointment Letter",
  "Experience Letter",
  "Relieving Letter",
  "Promotion Letter",
  "Transfer Letter",
  "Warning Letter"
];

export function incrementTemplateVersion(version) {
  const parts = String(version || "1.0").split(".");
  const major = Number(parts[0] || 1);
  const minor = Number(parts[1] || 0);

  if (Number.isNaN(major) || Number.isNaN(minor)) {
    return "1.0";
  }

  return `${major}.${minor + 1}`;
}

export function formatTemplateDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function toTemplateCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}
