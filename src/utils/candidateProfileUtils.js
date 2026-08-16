export function buildEditableCandidate(parsedCandidate) {
  if (!parsedCandidate) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      current_company: "",
      designation: "",
      experience: "",
      skills: "",
      education: ""
    };
  }

  const candidateName = String(
    parsedCandidate.candidate_name || parsedCandidate.name || ""
  ).trim();

  const fallbackNameParts = candidateName ? candidateName.split(/\s+/) : [];
  const fallbackFirstName = fallbackNameParts[0] || "";
  const fallbackLastName =
    fallbackNameParts.length > 1 ? fallbackNameParts.slice(1).join(" ") : "";

  const rawSkills = parsedCandidate.skills;
  const skills =
    Array.isArray(rawSkills)
      ? rawSkills.join(", ")
      : String(rawSkills || "");

  return {
    first_name: String(parsedCandidate.first_name || fallbackFirstName || ""),
    last_name: String(parsedCandidate.last_name || fallbackLastName || ""),
    email: String(parsedCandidate.email || parsedCandidate.email_id || ""),
    mobile: String(parsedCandidate.mobile || parsedCandidate.mobile_number || ""),
    current_company: String(
      parsedCandidate.current_company || parsedCandidate.company || ""
    ),
    designation: String(parsedCandidate.designation || parsedCandidate.role || ""),
    experience: String(parsedCandidate.experience || parsedCandidate.total_experience || ""),
    skills: String(skills || parsedCandidate.primary_skill || ""),
    education: String(parsedCandidate.education || "")
  };
}

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

export function buildProfileSavePayload(editableCandidate = {}) {
  return {
    first_name: editableCandidate.first_name,
    last_name: editableCandidate.last_name,
    email: editableCandidate.email,
    mobile: editableCandidate.mobile,
    current_company: editableCandidate.current_company,
    designation: editableCandidate.designation,
    experience: normalizeNumericExperience(editableCandidate.experience),
    skills: editableCandidate.skills
  };
}

export function validateProfileFields(editableCandidate) {
  const errors = {};

  if (!String(editableCandidate?.first_name || "").trim()) {
    errors.first_name = "First name is required.";
  }

  if (!String(editableCandidate?.last_name || "").trim()) {
    errors.last_name = "Last name is required.";
  }

  const email = String(editableCandidate?.email || "").trim();
  const mobile = String(editableCandidate?.mobile || "").trim();

  if (!email && !mobile) {
    const contactMessage = "Enter email or mobile.";
    errors.email = contactMessage;
    errors.mobile = contactMessage;
  }

  return errors;
}
