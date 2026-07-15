/** Date-range helpers for Recruiter Cockpit filters (recruiter-home scope). */

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
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
