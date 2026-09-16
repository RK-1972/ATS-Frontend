import API from "../api/axios";

/**
 * Legacy Candidate Registration create workflow (Single Source of Truth).
 * Used by Enterprise Candidate Workspace registration dialog.
 */
export async function executeLegacyCandidateRegistration(
  formData,
  resumeFile,
  { skipConfirm = false } = {}
) {
  if (!skipConfirm) {
    const confirmSave = window.confirm(
      "Are you sure you want to save this candidate?"
    );

    if (!confirmSave) {
      return null;
    }
  }

  if (!formData.pan_number?.trim()) {
    alert("PAN Number is mandatory");
    return null;
  }

  const panNumber = formData.pan_number.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(panNumber)) {
    alert("Invalid PAN Format. Example: ABCDE1234F");
    return null;
  }

  const data = new FormData();

  data.append("first_name", formData.first_name);
  data.append("last_name", formData.last_name);
  data.append("email_id", formData.email_id);
  data.append("pan_number", formData.pan_number);
  data.append("mobile_number", formData.mobile_number);
  data.append("primary_skill", formData.primary_skill);
  data.append("total_experience", formData.total_experience);
  data.append("relevant_experience", "5");
  data.append("current_company", "IGS");
  data.append("current_ctc", "1000000");
  data.append("expected_ctc", "1200000");
  data.append("notice_period", "30");
  data.append("current_location", "Bangalore");
  data.append("preferred_location", "Bangalore");
  data.append("secondary_skill", "Node.js");
  data.append("linkedin_url", "https://linkedin.com");
  data.append("source_channel", "LinkedIn");
  data.append("candidate_status", formData.candidate_status);
  data.append("req_id", formData.req_id || "");
  data.append("ats_stage", formData.ats_stage || "Applied");
  data.append("source_type", "ATS");
  data.append("remarks", "ATS UI Test");
  data.append("created_by", "admin");

  if (resumeFile) {
    data.append("resume", resumeFile);
  }

  const candidateResponse = await API.post("/candidate", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  if (formData.req_id) {
    await API.post("/api/v1/recruitment/candidate-mappings", {
      candidate_id: candidateResponse.data.data.candidate_id,
      req_id: formData.req_id,
      recruiter_id: formData.recruiter_id,
      stage_name: formData.ats_stage,
      source_type: formData.source_type,
      remarks: formData.remarks
    });
  }

  return candidateResponse.data.data;
}
