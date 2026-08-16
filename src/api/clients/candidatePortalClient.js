import candidateAPI from "../candidateAxios";

const candidatePortalClient = {
  register(payload) {
    return candidateAPI
      .post("/candidate-portal/register", payload)
      .then((response) => response.data);
  },

  login(payload) {
    return candidateAPI
      .post("/candidate-portal/login", payload)
      .then((response) => response.data);
  },

  getMe() {
    return candidateAPI
      .get("/candidate-portal/me")
      .then((response) => response.data);
  },

  getWorkspace() {
    return candidateAPI
      .get("/candidate-portal/workspace")
      .then((response) => response.data);
  },

  getProfile() {
    return candidateAPI
      .get("/candidate-portal/profile")
      .then((response) => response.data);
  },

  saveProfile(payload) {
    return candidateAPI
      .put("/candidate-portal/profile", payload)
      .then((response) => response.data);
  },

  createProfileIntake() {
    return candidateAPI
      .post("/candidate-portal/profile/intake")
      .then((response) => response.data);
  },

  processProfileIntake(intakeId, resumeFile) {
    const formData = new FormData();
    formData.append("resume", resumeFile);

    return candidateAPI
      .post(`/candidate-portal/profile/intake/${intakeId}/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then((response) => response.data);
  },

  parseProfileIntake(intakeId) {
    return candidateAPI
      .post(`/candidate-portal/profile/intake/${intakeId}/parse`)
      .then((response) => response.data);
  }
};

export default candidatePortalClient;
