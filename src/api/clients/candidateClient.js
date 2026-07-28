import API from "../axios";

const candidateClient = {
  listCandidates() {
    return API.get("/candidates").then((response) => response.data);
  },

  listMyCandidates() {
    return API.get("/my-candidates-list").then((response) => response.data);
  },

  listAvailableCandidates() {
  return API.get("/available-candidates").then((response) => response.data);
  },

mapCandidateToRequisition(payload) {
  return API
    .post("/api/v1/recruitment/candidate-mappings", payload)
    .then((response) => response.data);
},

  getCandidateById(candidateId) {
    return API.get(`/candidate/${candidateId}`).then((response) => response.data);
  },

  getCandidateFullDetails(candidateId) {
    return API.get(`/candidate-full-details/${candidateId}`).then((response) => response.data);
  },

  getMyRequisitions() {
  return API.get("/my-requisitions").then((response) => response.data);
},
getCandidateOwnership(candidateId) {
  return API
    .get(`/candidate-ownership/${candidateId}`)
    .then((response) => response.data);
},

requestCandidateOwnership(candidateId, reason) {
  return API
    .post("/request-candidate-ownership", {
      candidate_id: candidateId,
      reason
    })
    .then((response) => response.data);
},
getMyOwnershipRequests() {
  return API.get("/my-ownership-requests").then((response) => response.data);
},
approveOwnershipRequest(requestId) {
  return API
    .put(`/approve-candidate-ownership/${requestId}`)
    .then((response) => response.data);
},
rejectOwnershipRequest(requestId) {
  return API
    .put(`/reject-candidate-ownership/${requestId}`)
    .then((response) => response.data);
},
releaseCandidateMapping(candidateId) {
  return API
    .put(`/release-candidate-mapping/${candidateId}`)
    .then((response) => response.data);
},
returnCandidateToTalentPool(candidateId) {
  return API
    .put(`/return-candidate-to-talent-pool/${candidateId}`)
    .then((response) => response.data);
},
getCandidateSources() {
  return API
    .get("/candidate-sources")
    .then((response) => response.data);
},
createCandidateIntake(data) {
  return API
    .post("/candidate-intake", data)
    .then((response) => response.data);
},
processCandidateIntakeResume(intakeId, resumeFile) {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  return API
    .post(`/candidate-intake/${intakeId}/process`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    .then((response) => response.data);
},
parseCandidateIntakeResume(intakeId) {
  return API
    .post(`/candidate-intake/${intakeId}/parse`)
    .then((response) => response.data);
},
  updateCandidate(candidateId, formData) {
    // Do not set Content-Type manually — axios must include the multipart boundary.
    return API.put(`/candidate/${candidateId}`, formData).then(
      (response) => response.data
    );
  },

  listEducation(candidateId) {
    return API.get(`/candidate/${candidateId}/education`).then(
      (response) => response.data
    );
  },

  createEducation(candidateId, payload) {
    return API.post(`/candidate/${candidateId}/education`, payload).then(
      (response) => response.data
    );
  },

  updateEducation(candidateId, educationId, payload) {
    return API.put(
      `/candidate/${candidateId}/education/${educationId}`,
      payload
    ).then((response) => response.data);
  },

  deleteEducation(candidateId, educationId) {
    return API.delete(
      `/candidate/${candidateId}/education/${educationId}`
    ).then((response) => response.data);
  }
};

export default candidateClient;
