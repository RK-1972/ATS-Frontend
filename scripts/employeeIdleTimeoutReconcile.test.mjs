import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  attemptIdleTimeoutLogout,
  classifyIdleTimeoutError,
  IDLE_TIMEOUT_NOT_DUE_CODE,
  isIdleDeadlineElapsed
} from "../src/utils/employeeIdleTimeoutReconcile.js";

function axiosError(status, code, message) {
  const error = new Error(message || "request failed");
  error.response = {
    status,
    data: { code, message }
  };
  return error;
}

function networkError() {
  const error = new Error("Network Error");
  return error;
}

describe("classifyIdleTimeoutError", () => {
  it("classifies 409 IDLE_TIMEOUT_NOT_DUE", () => {
    assert.deepEqual(
      classifyIdleTimeoutError(axiosError(409, IDLE_TIMEOUT_NOT_DUE_CODE)),
      { kind: "not_due" }
    );
  });

  it("classifies 401 SESSION_INVALID", () => {
    assert.deepEqual(
      classifyIdleTimeoutError(axiosError(401, "SESSION_INVALID", "gone")),
      { kind: "session_invalid", message: "gone" }
    );
  });

  it("classifies network and 5xx as transient", () => {
    assert.deepEqual(classifyIdleTimeoutError(networkError()), { kind: "transient" });
    assert.deepEqual(classifyIdleTimeoutError(axiosError(503)), { kind: "transient" });
  });
});

describe("isIdleDeadlineElapsed", () => {
  it("returns true when effective_expires_at is in the past", () => {
    const now = Date.parse("2026-01-01T12:00:00.000Z");
    assert.equal(
      isIdleDeadlineElapsed(
        { effective_expires_at: "2026-01-01T11:59:00.000Z" },
        now
      ),
      true
    );
  });
});

describe("attemptIdleTimeoutLogout", () => {
  it("returns confirmed on successful idle-timeout", async () => {
    let calls = 0;
    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        calls += 1;
      },
      fetchIdleStatus: async () => ({}),
      sleep: async () => {}
    });

    assert.equal(result.outcome, "confirmed");
    assert.equal(calls, 1);
  });

  it("returns not_due on 409 and refreshes status", async () => {
    const status = {
      effective_expires_at: "2026-01-01T12:15:00.000Z",
      idle_expires_at: "2026-01-01T12:15:00.000Z"
    };

    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        throw axiosError(409, IDLE_TIMEOUT_NOT_DUE_CODE);
      },
      fetchIdleStatus: async () => status,
      sleep: async () => {}
    });

    assert.equal(result.outcome, "not_due");
    assert.deepEqual(result.status, status);
  });

  it("returns session_invalid on 401 without calling logout APIs", async () => {
    let idleStatusCalls = 0;
    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        throw axiosError(401, "SESSION_INVALID", "inactive");
      },
      fetchIdleStatus: async () => {
        idleStatusCalls += 1;
        return {};
      },
      sleep: async () => {}
    });

    assert.equal(result.outcome, "session_invalid");
    assert.equal(result.message, "inactive");
    assert.equal(idleStatusCalls, 0);
  });

  it("retries transient network failures then confirms", async () => {
    let attempts = 0;
    const sleeps = [];

    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        attempts += 1;
        if (attempts < 2) {
          throw networkError();
        }
      },
      fetchIdleStatus: async () => ({}),
      maxAttempts: 3,
      retryDelayMs: 10,
      sleep: async (ms) => {
        sleeps.push(ms);
      }
    });

    assert.equal(result.outcome, "confirmed");
    assert.equal(attempts, 2);
    assert.equal(sleeps.length, 1);
  });

  it("reconciles via idle-status when idle-timeout eventually succeeds", async () => {
    let completeCalls = 0;
    const past = "2026-01-01T11:00:00.000Z";

    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        completeCalls += 1;
        if (completeCalls < 4) {
          throw networkError();
        }
      },
      fetchIdleStatus: async () => ({ effective_expires_at: past }),
      nowMs: Date.parse("2026-01-01T12:00:00.000Z"),
      maxAttempts: 2,
      retryDelayMs: 1,
      sleep: async () => {}
    });

    assert.equal(result.outcome, "confirmed");
    assert.equal(completeCalls, 4);
  });

  it("returns give_up after repeated failures", async () => {
    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        throw networkError();
      },
      fetchIdleStatus: async () => {
        throw networkError();
      },
      maxAttempts: 2,
      retryDelayMs: 1,
      sleep: async () => {}
    });

    assert.equal(result.outcome, "give_up");
  });

  it("eventual reconciliation via idle-status 401", async () => {
    const result = await attemptIdleTimeoutLogout({
      completeIdleTimeout: async () => {
        throw networkError();
      },
      fetchIdleStatus: async () => {
        throw axiosError(401, "SESSION_INVALID", "ended");
      },
      maxAttempts: 1,
      sleep: async () => {}
    });

    assert.equal(result.outcome, "session_invalid");
    assert.equal(result.message, "ended");
  });
});
