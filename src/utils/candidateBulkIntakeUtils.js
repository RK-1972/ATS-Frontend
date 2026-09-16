export const BULK_INTAKE_MAX_FILES = 10;
export const BULK_INTAKE_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const BULK_INTAKE_ACCEPT = ".pdf,application/pdf";

export function createBulkBatchId() {
  return `${Date.now()}`;
}

export function buildBulkSourceReference(batchId, fileIndex) {
  return `bulk-upload:${batchId}:${String(fileIndex + 1).padStart(2, "0")}`;
}

export function isPdfFile(file) {
  if (!file) {
    return false;
  }

  const name = String(file.name || "").toLowerCase();

  return (
    file.type === "application/pdf" ||
    name.endsWith(".pdf")
  );
}

export function validateBulkIntakeFile(file) {
  if (!file) {
    return "File is required.";
  }

  if (!isPdfFile(file)) {
    return "Only PDF files are supported.";
  }

  if (file.size > BULK_INTAKE_MAX_FILE_SIZE_BYTES) {
    return "File exceeds the 5 MB limit.";
  }

  return null;
}

export function validateBulkIntakeSelection(files) {
  const selectedFiles = Array.from(files || []);

  if (selectedFiles.length === 0) {
    return {
      validFiles: [],
      error: "Select at least one PDF resume."
    };
  }

  if (selectedFiles.length > BULK_INTAKE_MAX_FILES) {
    return {
      validFiles: [],
      error: `A maximum of ${BULK_INTAKE_MAX_FILES} files is allowed per batch.`
    };
  }

  const validFiles = [];
  const fileErrors = [];

  selectedFiles.forEach((file) => {
    const validationError = validateBulkIntakeFile(file);

    if (validationError) {
      fileErrors.push(`${file.name}: ${validationError}`);
      return;
    }

    validFiles.push(file);
  });

  if (fileErrors.length > 0) {
    return {
      validFiles,
      error: fileErrors.join(" ")
    };
  }

  return {
    validFiles,
    error: ""
  };
}

export function formatParsedCandidateName(parsedCandidate) {
  const candidateName = String(
    parsedCandidate?.candidate_name || parsedCandidate?.name || ""
  ).trim();

  if (candidateName) {
    return candidateName;
  }

  const firstName = String(parsedCandidate?.first_name || "").trim();
  const lastName = String(parsedCandidate?.last_name || "").trim();

  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function formatDuplicateCandidateLabel(duplicateCandidate) {
  if (!duplicateCandidate) {
    return "";
  }

  const name = [
    duplicateCandidate.first_name,
    duplicateCandidate.last_name
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (name && duplicateCandidate.candidate_code) {
    return `${name} (${duplicateCandidate.candidate_code})`;
  }

  return name || duplicateCandidate.candidate_code || duplicateCandidate.email_id || "";
}
