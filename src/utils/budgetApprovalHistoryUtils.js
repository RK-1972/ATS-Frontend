/**
 * Sort and map Budget approval history for Inspector display.
 * Uses wf_history recorded_on as the authoritative event timestamp.
 */

export function mapWorkflowTimelineToHistoryEntries(timeline = []) {
  return timeline.map((event, index) => ({
    action: event.event,
    actor: event.actor,
    date: event.recorded_on,
    comment: event.comment,
    event_type: event.event_type,
    history_id: event.history_id ?? index
  }));
}

export function sortApprovalHistoryLatestFirst(entries = []) {
  return [...entries].sort((left, right) => {
    const leftTime = Date.parse(left.date) || 0;
    const rightTime = Date.parse(right.date) || 0;

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    const leftId = Number(left.history_id ?? 0);
    const rightId = Number(right.history_id ?? 0);
    return rightId - leftId;
  });
}

export function sortTimelineLatestFirst(events = []) {
  return sortApprovalHistoryLatestFirst(
    events.map((event, index) => ({
      ...event,
      date: event.date || event.recorded_on,
      history_id: event.history_id ?? index
    }))
  );
}

function collectActivityTimestamps(request = {}) {
  const timestamps = [];

  (request.history || []).forEach((entry) => {
    if (entry?.date) {
      timestamps.push(Date.parse(entry.date) || 0);
    }
  });

  (request.timeline || []).forEach((entry) => {
    if (entry?.date) {
      timestamps.push(Date.parse(entry.date) || 0);
    }
  });

  if (request.submitted_on) {
    timestamps.push(Date.parse(request.submitted_on) || 0);
  }

  return timestamps.filter((value) => value > 0);
}

export function resolveLatestActivityAt(request = {}) {
  const timestamps = collectActivityTimestamps(request);
  return timestamps.length ? Math.max(...timestamps) : 0;
}

/**
 * Authoritative queue sort timestamp: prefer API-enriched latest_activity_at
 * (MAX wf_history.recorded_on), then fall back to draft timeline for mock/offline.
 */
export function parseLatestActivityTimestamp(request = {}) {
  if (request.latest_activity_at) {
    const parsed = new Date(request.latest_activity_at).getTime();
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return resolveLatestActivityAt(request);
}

export function sortApprovalQueueByLatestActivity(queue = []) {
  return [...queue].sort((left, right) => {
    const leftTime = parseLatestActivityTimestamp(left);
    const rightTime = parseLatestActivityTimestamp(right);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return String(right.id || "").localeCompare(String(left.id || ""));
  });
}

export function buildApprovalQueueSortKey(queue = []) {
  return (queue || [])
    .map((item) => {
      const enriched = item.latest_activity_at || "";
      const resolved = parseLatestActivityTimestamp(item);
      return `${item.id || ""}:${enriched}:${resolved}:${item.status || ""}`;
    })
    .join("|");
}
