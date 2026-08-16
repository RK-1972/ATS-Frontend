/**
 * Mirrors candidatePortalService.getCandidateWorkspaceSummary profile_status logic.
 */
export function deriveCandidatePortalProfileStatus({
  candidate_status,
  portal_review_status,
  profile_completion = 0,
  has_resume,
  resume_path
} = {}) {
  const profileCompletion = Number(profile_completion || 0);
  const hasResume = has_resume ?? Boolean(resume_path);

  if (String(candidate_status || "").trim().toUpperCase() === "REGISTERED") {
    return "Registered";
  }

  if (String(portal_review_status || "").trim().toUpperCase() === "SUBMITTED") {
    return "Under Recruiter Review";
  }

  if (hasResume && profileCompletion >= 50) {
    return "Profile Complete";
  }

  if (hasResume || profileCompletion > 0) {
    return "Profile Complete";
  }

  return "Profile Incomplete";
}

export function getCandidatePortalStatusDescription({
  profile_status,
  candidate_status,
  portal_review_status
} = {}) {
  const resolvedStatus =
    profile_status ||
    deriveCandidatePortalProfileStatus({
      candidate_status,
      portal_review_status
    });

  if (
    String(candidate_status || "").trim().toUpperCase() === "REGISTERED" ||
    resolvedStatus === "Registered"
  ) {
    return "Your profile has been registered with our recruitment team. A recruiter will contact you regarding next steps.";
  }

  if (
    String(portal_review_status || "").trim().toUpperCase() === "SUBMITTED" ||
    resolvedStatus === "Under Recruiter Review"
  ) {
    return "Your profile has been submitted and is awaiting recruiter review.";
  }

  if (resolvedStatus === "Profile Complete") {
    return "Your profile information is saved. Submit it for recruiter review from Complete My Profile when you are ready.";
  }

  return "Complete your profile by uploading your resume and filling in your professional details.";
}
