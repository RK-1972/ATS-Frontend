import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { demoPassword, userEmail } from "./demo-config.mjs";

const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WAVE1_IDENTITIES_PATH = path.resolve(__dirname, "../artifacts/wave1-identities.json");

async function apiLogin(request, email, password) {
  const response = await request.post(`${API_BASE}/login`, {
    data: { email_id: email, password }
  });

  if (response.status() !== 200) {
    throw new Error(`Login failed for ${email} (${response.status()})`);
  }

  const body = await response.json();
  if (!body.token) {
    throw new Error(`Login response missing token for ${email}`);
  }

  return { token: body.token, user: body.user };
}

async function fetchMyInterviews(request, token) {
  const response = await request.get(`${API_BASE}/my-interviews`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await response.json();

  if (response.status() !== 200 || !body.success) {
    throw new Error(
      `GET /my-interviews failed (${response.status()}): ${body.message || "unknown"}`
    );
  }

  return body.data || [];
}

/**
 * Live interview fixtures for Wave 4 UI E2E (demo DB + panel assignments).
 */
export async function resolveInterviewWorkspaceFixtures(request) {
  const password = demoPassword();
  const recruiterEmail = userEmail("recruiter");
  const interviewerEmail = userEmail("interviewer");

  const { token: interviewerToken } = await apiLogin(request, interviewerEmail, password);
  const { token: recruiterToken } = await apiLogin(request, recruiterEmail, password);

  const panelInterviews = await fetchMyInterviews(request, interviewerToken);
  const pendingRow =
    panelInterviews.find((row) => !row.feedback_submitted) || panelInterviews[0] || null;

  let recruiterDeniedFeedback = false;
  let recruiterDeniedFeedbackRead = false;
  if (pendingRow?.schedule_id) {
    const denied = await request.get(
      `${API_BASE}/feedback-details/${pendingRow.schedule_id}`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    recruiterDeniedFeedback = denied.status() === 403;

    const deniedRead = await request.get(
      `${API_BASE}/feedback/${pendingRow.schedule_id}`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    recruiterDeniedFeedbackRead = deniedRead.status() === 403;
  }

  const feedbackSubmittedRow =
    panelInterviews.find((row) => row.feedback_submitted) || null;

  let panelViewFeedbackScheduleId = null;
  if (feedbackSubmittedRow?.schedule_id) {
    const readOk = await request.get(
      `${API_BASE}/feedback/${feedbackSubmittedRow.schedule_id}`,
      { headers: { Authorization: `Bearer ${interviewerToken}` } }
    );
    if (readOk.status() === 200) {
      const body = await readOk.json();
      if (body.feedbackExists) {
        panelViewFeedbackScheduleId = feedbackSubmittedRow.schedule_id;
      }
    }
  }

  const { token: adminToken } = await apiLogin(request, userEmail("admin"), password);

  const adminBundleRes = await request.get(`${API_BASE}/api/v1/interviews`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminBundle = await adminBundleRes.json();
  const adminInterviews = adminBundle.interviews || [];

  const recruiterBundleRes = await request.get(`${API_BASE}/api/v1/interviews`, {
    headers: { Authorization: `Bearer ${recruiterToken}` }
  });
  const recruiterBundle = await recruiterBundleRes.json();
  const recruiterScopedIds = new Set(
    (recruiterBundle.interviews || []).map((row) => row.interviewId)
  );

  const authorizedRecruiterInterviewId =
    recruiterBundle.interviews?.[0]?.interviewId || null;

  let foreignInterviewId = null;
  for (const row of adminInterviews) {
    if (!row.interviewId || recruiterScopedIds.has(row.interviewId)) {
      continue;
    }

    const probe = await request.get(
      `${API_BASE}/api/v1/interviews/${encodeURIComponent(row.interviewId)}`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    if (probe.status() === 403) {
      foreignInterviewId = row.interviewId;
      break;
    }
  }

  let panelEnterpriseInterviewId = null;
  if (pendingRow?.schedule_id) {
    const loginInterviewer = interviewerToken;
    const detailRes = await request.get(
      `${API_BASE}/my-interviews`,
      { headers: { Authorization: `Bearer ${loginInterviewer}` } }
    );
    const detailBody = await detailRes.json();
    const match = (detailBody.data || []).find(
      (row) => String(row.schedule_id) === String(pendingRow.schedule_id)
    );
    panelEnterpriseInterviewId = match?.interview_id || match?.enterprise_interview_id || null;
  }

  if (!panelEnterpriseInterviewId && pendingRow?.schedule_id) {
    const adminInterview = adminInterviews.find(
      (row) => String(row.scheduleId) === String(pendingRow.schedule_id)
    );
    panelEnterpriseInterviewId = adminInterview?.interviewId || null;
  }

  let scheduleFormFixture = null;
  const myReqsRes = await request.get(`${API_BASE}/my-requisitions`, {
    headers: { Authorization: `Bearer ${recruiterToken}` }
  });
  const myReqsBody = await myReqsRes.json();
  const firstReq = (myReqsBody.data || [])[0];

  if (firstReq?.req_id) {
    const candidatesRes = await request.get(
      `${API_BASE}/interview-candidates/${firstReq.req_id}`,
      { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    const candidatesBody = await candidatesRes.json();
    const firstCandidate = (candidatesBody.data || [])[0];

    const interviewersRes = await request.get(`${API_BASE}/active-interviewers`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    const interviewersBody = await interviewersRes.json();
    const firstPanel = (interviewersBody.data || [])[0];

    const masterRes = await request.get(`${API_BASE}/api/v1/master`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    const masterBody = await masterRes.json();
    const interviewTypeBundle =
      masterBody?.data?.interview_types
      || masterBody?.interview_types
      || {};
    const interviewTypeRecords = Array.isArray(interviewTypeBundle)
      ? interviewTypeBundle
      : interviewTypeBundle.records || interviewTypeBundle.items || [];
    const roundNames = interviewTypeRecords
      .map((row) => row.name || row.label)
      .filter(Boolean);
    const publishedRound = roundNames[0] || "L1 Interview";

    if (firstCandidate?.map_id && firstPanel?.panel_id) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + 14);
      scheduleFormFixture = {
        reqId: firstReq.req_id,
        reqCode: firstReq.req_code,
        mapId: firstCandidate.map_id,
        candidateLabel: `${firstCandidate.candidate_code} - ${firstCandidate.candidate_name}`,
        panelId: firstPanel.panel_id,
        panelName: firstPanel.interviewer_name,
        roundType: publishedRound,
        interviewDate: scheduleDate.toISOString().slice(0, 10),
        interviewTime: "15:30"
      };
    }
  }

  let taLeadOperatorEmail = null;
  let taLeadVerificationToken = null;
  if (fs.existsSync(WAVE1_IDENTITIES_PATH)) {
    try {
      const identities = JSON.parse(fs.readFileSync(WAVE1_IDENTITIES_PATH, "utf8"));
      taLeadOperatorEmail = identities?.taLead?.email_id || null;
      taLeadVerificationToken = identities?.taLead?.verification_token || null;
    } catch {
      taLeadOperatorEmail = null;
      taLeadVerificationToken = null;
    }
  }

  return {
    recruiterEmail,
    interviewerEmail,
    taLeadOperatorEmail,
    taLeadVerificationToken,
    password,
    panelScheduleId: pendingRow?.schedule_id ?? null,
    panelInterviewCount: panelInterviews.length,
    hasPanelInterviews: panelInterviews.length > 0,
    recruiterDeniedFeedbackOnPanelSchedule: recruiterDeniedFeedback,
    recruiterDeniedFeedbackReadOnPanelSchedule: recruiterDeniedFeedbackRead,
    panelViewFeedbackScheduleId,
    scheduleFormFixture,
    authorizedRecruiterInterviewId,
    foreignInterviewId,
    panelEnterpriseInterviewId
  };
}
