/**
 * Display status for Interviewer Home grid (feedback flag + interview_status).
 */
export function resolveInterviewerInterviewDisplayStatus(row) {
  if (row?.feedback_submitted) {
    return "Completed";
  }

  const status = String(row?.interview_status || "").trim();

  if (status === "Cancelled") {
    return "Cancelled";
  }

  if (status === "Completed") {
    return "Completed";
  }

  if (status) {
    return status;
  }

  return "Scheduled";
}
