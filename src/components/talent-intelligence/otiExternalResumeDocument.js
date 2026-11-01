export function openOrDownloadResumeBlob({ blob, filename }) {
  const name = String(filename || "resume.pdf");
  const extension = name.split(".").pop()?.toLowerCase() || "pdf";
  const inlineViewFormats = new Set(["pdf"]);

  const objectUrl = URL.createObjectURL(blob);

  if (inlineViewFormats.has(extension)) {
    const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      triggerDownload(objectUrl, name);
    } else {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
    return;
  }

  triggerDownload(objectUrl, name);
  URL.revokeObjectURL(objectUrl);
}

function triggerDownload(objectUrl, filename) {
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function externalLeadHasRetrievedResume(row) {
  const doc = row?.resume_document;
  const byteLength = Number(doc?.byte_length);

  if (doc?.document_id && Number.isFinite(byteLength) && byteLength > 0) {
    return true;
  }

  if (row?.latest_document_id) {
    return true;
  }

  return String(row?.resume_index_status || "").toLowerCase() === "indexed";
}

export function canReviewExternalLead(row) {
  const importStatus = String(row?.import_status || "staged").toLowerCase();

  if (importStatus === "imported" || importStatus === "dismissed") {
    return false;
  }

  return externalLeadHasRetrievedResume(row);
}

export function buildOtiIntakeReviewSearchParams({ externalLeadId, runId, requisitionCode }) {
  const params = new URLSearchParams();
  params.set("oti_external_lead", String(externalLeadId));

  if (runId) {
    params.set("run_id", String(runId));
  }

  if (requisitionCode) {
    params.set("requisition_code", String(requisitionCode));
  }

  return params.toString();
}
