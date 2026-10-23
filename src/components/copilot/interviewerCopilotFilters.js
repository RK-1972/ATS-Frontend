/**
 * Client-side interviewer filters for Interviewer Home (Copilot navigation).
 * Business calendar dates use Asia/Kolkata (IST) — aligned with copilotInterviewFilters.js.
 */

import {
  getBusinessCalendarDateKey,
  getInterviewBusinessCalendarDateKey
} from "../../utils/optalynxBusinessTimezone.js";

function isActionableInterviewRow(row) {
  if (row?.feedback_submitted) {
    return false;
  }

  const status = String(row?.interview_status || "").trim();

  if (status === "Cancelled" || status === "Completed") {
    return false;
  }

  return true;
}

export function applyInterviewerViewFilter(rows, view, referenceDate = new Date()) {
  const list = Array.isArray(rows) ? rows : [];
  const today = getBusinessCalendarDateKey(referenceDate);

  if (view === "today") {
    return list.filter(
      (row) =>
        isActionableInterviewRow(row) &&
        getInterviewBusinessCalendarDateKey(row) === today
    );
  }

  if (view === "pending_feedback") {
    return list.filter((row) => {
      if (row?.feedback_submitted) {
        return false;
      }

      const status = String(row?.interview_status || "").trim();

      return status !== "Cancelled" && status !== "Completed";
    });
  }

  if (view === "upcoming") {
    return list.filter((row) => {
      if (!isActionableInterviewRow(row)) {
        return false;
      }

      const dateKey = getInterviewBusinessCalendarDateKey(row);

      return dateKey && dateKey >= today;
    });
  }

  return list;
}
