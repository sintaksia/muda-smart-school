import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { autoCloseDueSessions } from "@/src/features/attendance/services/session";
import { detectMissedSessions } from "@/src/features/attendance/services/teacher-attendance";

vi.mock("@/src/features/attendance/services/session", () => ({
  autoCloseDueSessions: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/teacher-attendance", () => ({
  detectMissedSessions: vi.fn(),
}));

function buildRequest(secret?: string): Request {
  return new Request("http://localhost/api/cron/attendance", {
    method: "POST",
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
}

describe("POST /api/cron/attendance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects a missing or wrong secret", async () => {
    expect((await POST(buildRequest())).status).toBe(401);
    expect((await POST(buildRequest("wrong"))).status).toBe(401);
    expect(autoCloseDueSessions).not.toHaveBeenCalled();
  });

  it("runs the auto-close and missed-session jobs", async () => {
    vi.mocked(autoCloseDueSessions).mockResolvedValue(2);
    vi.mocked(detectMissedSessions).mockResolvedValue(1);

    const response = await POST(buildRequest("test-secret"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ closed: 2, missedTeacherSessions: 1 });
  });

  it("rejects everything when CRON_SECRET is unset", async () => {
    delete process.env.CRON_SECRET;
    const response = await POST(buildRequest("anything"));
    expect(response.status).toBe(401);
  });
});
