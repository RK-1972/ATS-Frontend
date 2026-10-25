export const EMPLOYEE_IDLE_SYNC_STORAGE_KEY = "optalynx_employee_idle_sync_v1";

export function readEmployeeIdleSync(expectedSessionId = null) {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(EMPLOYEE_IDLE_SYNC_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (
      expectedSessionId
      && parsed?.session_id
      && String(parsed.session_id) !== String(expectedSessionId)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeEmployeeIdleSync(payload) {
  if (typeof localStorage === "undefined" || !payload) {
    return;
  }

  localStorage.setItem(
    EMPLOYEE_IDLE_SYNC_STORAGE_KEY,
    JSON.stringify({
      ...payload,
      updatedAt: Date.now()
    })
  );
}

export function clearEmployeeIdleSync() {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(EMPLOYEE_IDLE_SYNC_STORAGE_KEY);
}
