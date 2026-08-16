export function normalizeNumericExperience(value) {
  if (value === null || value === undefined || value === "") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value).trim().match(/(\d+(?:\.\d+)?)/);

  if (!match) {
    return value;
  }

  const parsed = Number(match[1]);

  return Number.isFinite(parsed) ? parsed : value;
}

export function buildDraftUpdatePayload(
  editableCandidate = {},
  candidateContainer = "PIPELINE"
) {
  return {
    first_name: editableCandidate.first_name,
    last_name: editableCandidate.last_name,
    email_id: editableCandidate.email || editableCandidate.email_id,
    mobile_number: editableCandidate.mobile || editableCandidate.mobile_number,
    current_company: editableCandidate.current_company,
    current_designation:
      editableCandidate.designation || editableCandidate.current_designation,
    total_experience: normalizeNumericExperience(
      editableCandidate.experience ?? editableCandidate.total_experience
    ),
    primary_skill: editableCandidate.skills || editableCandidate.primary_skill,
    candidate_container: candidateContainer || "PIPELINE"
  };
}

export function validateRegisterCandidate(editableCandidate) {
  const errors = {};

  if (!String(editableCandidate?.first_name || "").trim()) {
    errors.first_name = "First name is required.";
  }

  if (!String(editableCandidate?.last_name || "").trim()) {
    errors.last_name = "Last name is required.";
  }

  const email = String(
    editableCandidate?.email || editableCandidate?.email_id || ""
  ).trim();
  const mobile = String(
    editableCandidate?.mobile || editableCandidate?.mobile_number || ""
  ).trim();

  if (!email && !mobile) {
    const contactMessage = "Enter email or mobile.";
    errors.email = contactMessage;
    errors.mobile = contactMessage;
  }

  return errors;
}

export function candidateMasterToEditableCandidate(candidate = {}) {
  return {
    first_name: candidate.first_name || "",
    last_name: candidate.last_name || "",
    email: candidate.email_id || "",
    mobile: candidate.mobile_number || "",
    current_company: candidate.current_company || "",
    designation: candidate.current_designation || "",
    experience: candidate.total_experience ?? "",
    skills: candidate.primary_skill || ""
  };
}
