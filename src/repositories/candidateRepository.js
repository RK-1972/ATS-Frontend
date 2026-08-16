import candidateClient from "@/api/clients/candidateClient";
import API from "@/api/axios";

const FORM_FIELDS = [
  // Personal Information
  "first_name",
  "middle_name",
  "last_name",
  "preferred_name",
  "gender",

  // Existing Identity
  "email_id",
  "pan_number",
  "mobile_number",
  "alternate_phone",

  // Skills
  "primary_skill",
  "secondary_skill",

  // Experience
  "total_experience",
  "relevant_experience",

  // Employment
  "current_company",
  "current_designation",
  "current_department",
  "employment_type",
  "preferred_work_mode",
  "availability",
  "current_ctc",
  "expected_ctc",
  "currency_code",
  "ctc_negotiable",
  "notice_period",

  // Location / Address
  "country_code",
  "state_code",
  "city_code",
  "current_location",
  "address_line",
  "preferred_location",

  // Professional
  "linkedin_url",
  "source_channel",

  // Status
  "candidate_status",
  "remarks"
];

function buildFormData(candidate = {}, user = null, resumeFile = null) {
  const data = new FormData();

  FORM_FIELDS.forEach((field) => {
    const value = candidate[field];
    if (value !== null && value !== undefined && value !== "") {
      data.append(field, value);
    }
  });

  if (user?.employee_code) {
    data.append("created_by", user.employee_code);
  }

  if (resumeFile) {
    data.append("resume", resumeFile);
  }

  return data;
}

function getInitialProfile() {
  return {
    master: null,
    mapping: null,
    children: {
      address: [],
      education: [],
      experience: [],
      skill_map: [],
      certification: [],
      language: [],
      document: [],
      social_profile: [],
      preference: [],
      notes: [],
      activity: []
    }
  };
}

function isTalentPoolView(workspaceView = "pool") {
  return String(workspaceView || "").toLowerCase() === "pool";
}

async function listCandidates(workspaceView = "pool") {
  const response = isTalentPoolView(workspaceView)
    ? await candidateClient.listAvailableCandidates()
    : await candidateClient.listMyCandidates();

  if (response?.success === false) {
    throw new Error(response.message || "Failed to load candidates");
  }

  return response?.data || [];
}
async function loadCandidateProfile(candidateId) {
  const [masterResponse, detailsResponse] = await Promise.all([
    candidateClient.getCandidateById(candidateId),
    candidateClient.getCandidateFullDetails(candidateId)
  ]);

  const master = masterResponse?.data || masterResponse || null;
  const mapping = detailsResponse?.data || detailsResponse || null;

  return {
    master,
    mapping,
    children: getInitialProfile().children
  };
}

async function updateCandidate(candidateId, candidate, user, resumeFile = null) {
  const formData = buildFormData(candidate, user, resumeFile);
  const response = await candidateClient.updateCandidate(candidateId, formData);

  if (response?.success === false) {
    throw new Error(response.message || "Failed to update candidate");
  }

  return response?.data || response;
}

async function mapCandidateToRequisition(payload) {

  const response =
    await candidateClient.mapCandidateToRequisition(payload);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to map candidate"
    );

  }

  return response;

}

async function getMyRequisitions() {

  const response =
    await candidateClient.getMyRequisitions();

  return response.data || [];

}

async function getCandidateOwnership(candidateId) {

  const response =
    await candidateClient.getCandidateOwnership(candidateId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to load candidate ownership."
    );

  }

  const data = response.data || {};

  return {
    candidate_id: data.candidate_id,
    owner_employee_code: data.owner_employee_code || "",
    full_name: data.full_name || "",
    owner_display_name: data.owner_display_name || "",
    is_owner: Boolean(data.is_owner),
    pending_request: Boolean(data.pending_request)
  };

}

async function requestCandidateOwnership(candidateId, reason = "") {

  const response =
    await candidateClient.requestCandidateOwnership(
      candidateId,
      reason
    );

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Ownership request failed."
    );

  }

  return response;

}

async function getMyOwnershipRequests() {

  const response =
    await candidateClient.getMyOwnershipRequests();

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to load ownership requests."
    );

  }

  return response.data || [];

}

async function approveOwnershipRequest(requestId) {

  const response =
    await candidateClient.approveOwnershipRequest(requestId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to approve ownership request."
    );

  }

  return response;

}

async function rejectOwnershipRequest(requestId) {

  const response =
    await candidateClient.rejectOwnershipRequest(requestId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to reject ownership request."
    );

  }

  return response;

}

async function releaseCandidateMapping(candidateId) {

  const response =
    await candidateClient.releaseCandidateMapping(candidateId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to release candidate mapping."
    );

  }

  return response;

}

async function returnCandidateToTalentPool(candidateId) {

  const response =
    await candidateClient.returnCandidateToTalentPool(candidateId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to return candidate to Talent Pool."
    );

  }

  return response;

}

async function getCandidateSources() {

  const response =
    await candidateClient.getCandidateSources();

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to load candidate sources."
    );

  }

  return response.data;

}

async function createCandidateIntake(data) {

  const response =
    await candidateClient.createCandidateIntake(data);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to create candidate intake record."
    );

  }

  return response.data;

}

async function processCandidateIntakeResume(intakeId, resumeFile) {

  const response =
    await candidateClient.processCandidateIntakeResume(
      intakeId,
      resumeFile
    );

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to process candidate intake resume."
    );

  }

  return response;

}

async function parseCandidateIntakeResume(intakeId) {

  const response =
    await candidateClient.parseCandidateIntakeResume(intakeId);

  if (response?.success === false) {

    throw new Error(
      response.message ||
      "Failed to parse candidate intake resume."
    );

  }

  return response;

}

function toDateFieldValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toISOString().slice(0, 10);
}

function mapEducationRecord(row = {}) {
  let scoreType = String(row.score_type || "").trim();
  let score = "";

  if (scoreType === "CGPA") {
    if (row.cgpa !== null && row.cgpa !== undefined && row.cgpa !== "") {
      score = String(row.cgpa);
    }
  } else if (scoreType === "Percentage") {
    if (
      row.percentage !== null &&
      row.percentage !== undefined &&
      row.percentage !== ""
    ) {
      score = String(row.percentage);
    }
  }

  if (score === "") {
    if (row.cgpa !== null && row.cgpa !== undefined && row.cgpa !== "") {
      score = String(row.cgpa);
      if (!scoreType) {
        scoreType = "CGPA";
      }
    } else if (
      row.percentage !== null &&
      row.percentage !== undefined &&
      row.percentage !== ""
    ) {
      score = String(row.percentage);
      if (!scoreType) {
        scoreType = "Percentage";
      }
    }
  }

  return {
    id: row.education_id,
    education_id: row.education_id,
    qualification: row.qualification || "",
    institution: row.institution || "",
    university_board: row.board_university || "",
    specialization: row.specialization || "",
    from_date: toDateFieldValue(row.from_date),
    to_date: toDateFieldValue(row.to_date),
    score_type: scoreType,
    score,
    year_of_passing: row.year_of_passing,
    percentage: row.percentage,
    cgpa: row.cgpa
  };
}

function buildEducationPayload(form = {}) {
  const payload = {};

  const qualification = String(form.qualification || "").trim();
  const institution = String(form.institution || "").trim();
  const universityBoard = String(form.university_board || "").trim();
  const specialization = String(form.specialization || "").trim();
  const scoreType = String(form.score_type || "").trim();
  const scoreRaw = String(form.score ?? "").trim();
  const fromDate = String(form.from_date || "").trim();
  const toDate = String(form.to_date || "").trim();

  if (qualification) {
    payload.qualification = qualification;
  }

  if (institution) {
    payload.institution = institution;
  }

  if (universityBoard) {
    payload.board_university = universityBoard;
  }

  payload.specialization = specialization;
  payload.from_date = fromDate || null;
  payload.to_date = toDate || null;
  // Always send score + score_type; backend maps score → percentage/cgpa.
  payload.score_type = scoreType || null;
  payload.score = scoreRaw;

  return payload;
}

function getApiErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

async function listEducation(candidateId) {
  try {
    const response = await candidateClient.listEducation(candidateId);

    if (response?.success === false) {
      throw new Error(response.message || "Failed to load education records");
    }

    return (response?.data || []).map(mapEducationRecord);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load education records")
    );
  }
}

async function createEducation(candidateId, form) {
  const payload = buildEducationPayload(form);

  if (!payload.qualification) {
    throw new Error("Please fill education details before saving.");
  }

  try {
    const response = await candidateClient.createEducation(
      candidateId,
      payload
    );

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to create education record"
      );
    }

    return mapEducationRecord(response?.data || {});
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to create education record")
    );
  }
}

async function updateEducation(candidateId, educationId, form) {
  const payload = buildEducationPayload(form);

  if (!payload.qualification) {
    throw new Error("Please fill education details before saving.");
  }

  try {
    const response = await candidateClient.updateEducation(
      candidateId,
      educationId,
      payload
    );

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to update education record"
      );
    }

    return mapEducationRecord(response?.data || {});
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to update education record")
    );
  }
}

async function deleteEducation(candidateId, educationId) {
  try {
    const response = await candidateClient.deleteEducation(
      candidateId,
      educationId
    );

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to delete education record"
      );
    }

    return response?.data || null;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to delete education record")
    );
  }
}

function mapExperienceRecord(row = {}) {
  return {
    id: row.experience_id,
    experience_id: row.experience_id,
    company_name: row.company_name || "",
    designation: row.designation || "",
    joining_date: toDateFieldValue(row.joining_date),
    relieving_date: toDateFieldValue(row.relieving_date),
    role_summary: row.role_summary || "",
    technology: row.technology || "",
    reason_for_change: row.reason_for_change || "",
    active_flag: row.active_flag,
    created_on: row.created_on,
    modified_on: row.modified_on
  };
}

function buildExperiencePayload(experience = {}) {
  const payload = {};

  const companyName = String(experience.company_name || "").trim();
  const designation = String(experience.designation || "").trim();
  const joiningDate = String(experience.joining_date || "").trim();
  const relievingDate = String(experience.relieving_date || "").trim();
  const roleSummary = String(experience.role_summary || "").trim();
  const technology = String(experience.technology || "").trim();
  const reasonForChange = String(experience.reason_for_change || "").trim();

  if (companyName) {
    payload.company_name = companyName;
  }

  payload.designation = designation || null;
  payload.joining_date = joiningDate || null;
  payload.relieving_date = relievingDate || null;
  payload.role_summary = roleSummary || null;
  payload.technology = technology || null;
  payload.reason_for_change = reasonForChange || null;

  return payload;
}

async function listExperience(candidateId) {
  try {
    const response = (
      await API.get(`/candidate/${candidateId}/experience`)
    ).data;

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to load experience records"
      );
    }

    return (response?.data || []).map(mapExperienceRecord);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to load experience records")
    );
  }
}

async function createExperience(candidateId, experience) {
  const payload = buildExperiencePayload(experience);

  if (!payload.company_name) {
    throw new Error("Please fill experience details before saving.");
  }

  try {
    const response = (
      await API.post(`/candidate/${candidateId}/experience`, payload)
    ).data;

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to create experience record"
      );
    }

    return mapExperienceRecord(response?.data || {});
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to create experience record")
    );
  }
}

async function updateExperience(candidateId, experienceId, experience) {
  const payload = buildExperiencePayload(experience);

  if (!payload.company_name) {
    throw new Error("Please fill experience details before saving.");
  }

  try {
    const response = (
      await API.put(
        `/candidate/${candidateId}/experience/${experienceId}`,
        payload
      )
    ).data;

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to update experience record"
      );
    }

    return mapExperienceRecord(response?.data || {});
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to update experience record")
    );
  }
}

async function deleteExperience(candidateId, experienceId) {
  try {
    const response = (
      await API.delete(
        `/candidate/${candidateId}/experience/${experienceId}`
      )
    ).data;

    if (response?.success === false) {
      throw new Error(
        response.message || "Failed to delete experience record"
      );
    }

    return response?.data || null;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Failed to delete experience record")
    );
  }
}

const candidateRepository = {
  getInitialProfile,
  listCandidates,
  loadCandidateProfile,
  updateCandidate,
  mapCandidateToRequisition,
  getMyRequisitions,
  getCandidateOwnership,
  requestCandidateOwnership,
  getMyOwnershipRequests,
  approveOwnershipRequest,
  rejectOwnershipRequest,
  releaseCandidateMapping,
  returnCandidateToTalentPool,
  getCandidateSources,
  createCandidateIntake,
  processCandidateIntakeResume,
  parseCandidateIntakeResume,
  listEducation,
  createEducation,
  updateEducation,
  deleteEducation,
  listExperience,
  createExperience,
  updateExperience,
  deleteExperience
};

export default candidateRepository;
