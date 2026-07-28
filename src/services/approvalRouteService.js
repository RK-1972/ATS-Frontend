import API from "../api/axios";

async function getApprovalRoutes(params = {}) {
  const response = await API.get("/approval-routes", { params });
  return response.data;
}

async function getApprovalRoute(routeId) {
  const response = await API.get(
    `/approval-routes/${encodeURIComponent(routeId)}`
  );
  return response.data;
}

async function createApprovalRoute(route) {
  const response = await API.post("/approval-routes", route);
  return response.data;
}

async function updateApprovalRoute(routeId, route) {
  const response = await API.put(
    `/approval-routes/${encodeURIComponent(routeId)}`,
    route
  );
  return response.data;
}

const ApprovalRouteService = {
  getApprovalRoutes,
  getApprovalRoute,
  createApprovalRoute,
  updateApprovalRoute
};

export {
  getApprovalRoutes,
  getApprovalRoute,
  createApprovalRoute,
  updateApprovalRoute
};

export default ApprovalRouteService;
