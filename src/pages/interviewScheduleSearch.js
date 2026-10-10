/** Same pattern as PendingApplicationsPage / RecruiterRequisitionDetailsPage candidate search. */
export function buildInterviewScheduleSearchHaystack(row) {
  return [
    row.req_code,
    row.job_title,
    row.candidate_code,
    row.candidate_name,
    row.interviewer_name,
    row.round_type,
    row.interview_date,
    row.interview_time,
    row.interview_status,
    row.schedule_id
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

export function scheduleMatchesSearch(row, searchText) {
  const query = String(searchText ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!query) {
    return true;
  }

  return buildInterviewScheduleSearchHaystack(row).includes(query);
}

export function filterInterviewSchedules(schedules, searchText) {
  const list = Array.isArray(schedules) ? schedules : [];
  const query = String(searchText ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!query) {
    return list;
  }

  return list.filter((row) => scheduleMatchesSearch(row, searchText));
}
