import useApplicationScreenTelemetry from "@/hooks/useApplicationScreenTelemetry";

/**
 * Passive screen-activity recorder for authenticated SPA navigation.
 */
function ApplicationScreenTelemetry() {
  useApplicationScreenTelemetry();
  return null;
}

export default ApplicationScreenTelemetry;
