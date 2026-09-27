import { expect } from "@playwright/test";

const API_BASE = process.env.E2E_API_BASE_URL || "http://localhost:5000";

/**
 * Employee login via API (same token/workspace payload as UI login).
 */
export async function loginEmployeeViaApi(page, request, email, password) {
  const response = await request.post(`${API_BASE}/login`, {
    data: { email_id: email, password }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.token).toBeTruthy();
  expect(body.user?.email_id).toBe(email);

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ payload }) => {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("user", JSON.stringify(payload.user));
      localStorage.setItem(
        "work_assignments",
        JSON.stringify(payload.work_assignments || [])
      );
      localStorage.setItem(
        "work_assignment_status",
        payload.work_assignment_status || ""
      );
      localStorage.setItem(
        "workspace",
        JSON.stringify(payload.workspace || {})
      );
    },
    {
      payload: {
        token: body.token,
        user: body.user,
        work_assignments: body.work_assignments,
        work_assignment_status: body.work_assignment_status,
        workspace: body.workspace
      }
    }
  );
}
