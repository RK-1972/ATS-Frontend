import candidateClient from "@/api/clients/candidateClient";

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

async function listCandidates(
  workspaceView = "pool",
  isRecruiter = false
) {
  let response;

  if (!isRecruiter) {

    response = await candidateClient.listCandidates();

  } else {

    if (workspaceView === "pool") {

      response =
        await candidateClient.listAvailableCandidates();

    } else {

      response =
        await candidateClient.listMyCandidates();

    }

  }

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
  getCandidateSources,
  createCandidateIntake,
  processCandidateIntakeResume,
  parseCandidateIntakeResume,
  buildFormData
};

export default candidateRepository;
