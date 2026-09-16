/** Date-range helpers for Recruiter Cockpit filters (recruiter-home scope). */

/** Local calendar date as YYYY-MM-DD (matches backend formatLocalDateOnly semantics). */
export function localCalendarDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return localCalendarDate(new Date());
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localCalendarDate(d);
}

export const DATE_PRESETS = {
  today: "today",
  last7: "last7",
  last30: "last30"
};

export function presetToRange(preset) {
  const to = todayIso();
  if (preset === DATE_PRESETS.today) {
    return { fromDate: to, toDate: to, preset };
  }
  if (preset === DATE_PRESETS.last7) {
    return { fromDate: addDays(to, -6), toDate: to, preset };
  }
  return { fromDate: addDays(to, -29), toDate: to, preset: DATE_PRESETS.last30 };
}

export function formatRangeLabel(fromDate, toDate) {
  const fmt = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  if (fromDate === toDate) return fmt(fromDate);
  return `${fmt(fromDate)} – ${fmt(toDate)}`;
}

export function defaultCockpitRange() {
  return presetToRange(DATE_PRESETS.last30);
}

/** Matches legacy interview schedule API display format (DD-MM-YYYY). */
export function formatLegacyInterviewDisplayDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
