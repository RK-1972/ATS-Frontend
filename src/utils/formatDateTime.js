export function formatDateTime(isoString, options = {}) {

  const {
    includeYear = false,
    includeTime = true
  } = options;

  return new Date(isoString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit"
        }
      : {})
  });

}

export default formatDateTime;
