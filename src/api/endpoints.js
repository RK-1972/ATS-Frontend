const V1 = "/api/v1";

export const ENDPOINTS = {
  masterData: `${V1}/master`,
  platformConfig: `${V1}/platform-config`,
  businessRules: `${V1}/business-rules`,
  workflows: `${V1}/workflows`,
  workforce: `${V1}/workforce`,
  recruitment: `${V1}/recruitment`,
  tasks: `${V1}/tasks`,
  offers: `${V1}/offers`,
  interviews: `${V1}/interviews`,
  hiringControlTower: `${V1}/hiring-control-tower`,
  notifications: `${V1}/notifications`,
  audit: `${V1}/audit`
};

export function masterEntityEndpoint(entityType) {
  return `${ENDPOINTS.masterData}/${entityType.replace(/_/g, "-")}`;
}

export default ENDPOINTS;
