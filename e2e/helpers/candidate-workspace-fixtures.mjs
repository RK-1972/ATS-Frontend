import { demoPassword, manifest, userEmail } from "./demo-config.mjs";

const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";

function candidateDisplayName(row) {
  if (!row) {
    return "";
  }
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return name || row.candidate_code || String(row.candidate_id || "");
}

function recruiterEmployeeCode() {
  const account = manifest.users.accounts.find((item) => item.key === "recruiter");
  return account?.employeeCode || "DEMO_E2E_REC";
}

async function apiLogin(request, email, password) {
  const response = await request.post(`${API_BASE}/login`, {
    data: { email_id: email, password }
  });

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(`Login failed for ${email} (${response.status()}): ${body}`);
  }

  const body = await response.json();
  if (!body.token) {
    throw new Error(`Login response missing token for ${email}`);
  }

  return { token: body.token, user: body.user };
}

async function fetchEnterpriseList(request, token, view) {
  const response = await request.get(
    `${API_BASE}/api/v1/recruitment/candidates?view=${view}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const body = await response.json();

  if (response.status() !== 200 || !body.success) {
    throw new Error(
      `GET candidates?view=${view} failed (${response.status()}): ${body.message || "unknown"}`
    );
  }

  return body.data || [];
}

async function fetchAdminCandidates(request, token) {
  const response = await request.get(`${API_BASE}/candidates`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json();

  if (response.status() !== 200) {
    throw new Error(`Admin GET /candidates failed (${response.status()})`);
  }

  return body.data || [];
}

async function fetchEducationCount(request, token, candidateId) {
  const response = await request.get(
    `${API_BASE}/api/v1/recruitment/candidates/${candidateId}/education`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.status() !== 200) {
    return null;
  }

  const body = await response.json();
  return Array.isArray(body.data) ? body.data.length : 0;
}

/**
 * Resolves live candidate IDs for Candidate Workspace UI E2E (demo DB).
 */
export async function resolveCandidateWorkspaceFixtures(request) {
  const password = demoPassword();
  const recruiterEmail = userEmail("recruiter");
  const adminEmail = userEmail("admin");
  const recruiterCode = recruiterEmployeeCode();

  const { token: recruiterToken } = await apiLogin(request, recruiterEmail, password);
  const { token: adminToken } = await apiLogin(request, adminEmail, password);

  const pipeline = await fetchEnterpriseList(request, recruiterToken, "pipeline");
  const pool = await fetchEnterpriseList(request, recruiterToken, "pool");

  if (!pipeline.length) {
    throw new Error("No pipeline candidates visible to demo recruiter — seed demo data first.");
  }

  const demoEmail = manifest.candidate.email;
  const demoInPool = pool.find((row) => row.email_id === demoEmail);
  const demoInPipeline = pipeline.find((row) => row.email_id === demoEmail);

  // Workspace defaults to Talent Pool — deep links must target a pool-visible row when possible.
  const poolAuthorized = demoInPool || pool[0] || null;
  const pipelineAuthorized = demoInPipeline || pipeline[0] || null;

  const mappedRow =
    pipeline.find((row) => row.req_id || row.req_code) || pipelineAuthorized || poolAuthorized;

  const adminRows = await fetchAdminCandidates(request, adminToken);
  const foreignRow = adminRows.find((row) => {
    const container = String(row.candidate_container || "PIPELINE").toUpperCase();
    const owner = String(row.owner_employee_code || "").trim();
    return container === "PIPELINE" && owner && owner !== recruiterCode;
  });

  let emptyEducationCandidateId = null;
  const educationProbe = [...pool, ...pipeline].slice(0, 20);
  for (const row of educationProbe) {
    const count = await fetchEducationCount(request, recruiterToken, row.candidate_id);
    if (count === 0) {
      emptyEducationCandidateId = row.candidate_id;
      break;
    }
  }

  if (!poolAuthorized?.candidate_id && !pipelineAuthorized?.candidate_id) {
    throw new Error("No authorized candidate rows for recruiter in pool or pipeline.");
  }

  return {
    recruiterEmail,
    password,
    demoCandidateName: manifest.candidate.fullName,
    authorizedDisplayName: candidateDisplayName(poolAuthorized || pipelineAuthorized),
    authorizedCandidateId: poolAuthorized?.candidate_id || pipelineAuthorized.candidate_id,
    authorizedInPool: Boolean(poolAuthorized?.candidate_id),
    pipelineCandidateId: pipelineAuthorized?.candidate_id || null,
    mappedCandidateId: mappedRow?.candidate_id || pipelineAuthorized?.candidate_id,
    hasMappedRequisition: Boolean(mappedRow?.req_id || mappedRow?.req_code),
    poolCandidateId: pool[0]?.candidate_id || null,
    foreignCandidateId: foreignRow?.candidate_id || null,
    emptyEducationCandidateId
  };
}
