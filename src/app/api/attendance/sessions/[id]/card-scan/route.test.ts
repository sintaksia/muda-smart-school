import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizeSessionAccess } from "@/src/features/attendance/services/sessionAccess";
import { recordCardScan } from "@/src/features/attendance/services/cardScan";
import { POST } from "./route";

vi.mock("@/src/features/attendance/services/sessionAccess", () => ({
  authorizeSessionAccess: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/cardScan", () => ({
  recordCardScan: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request(
    "http://localhost/api/attendance/sessions/sesi-1/card-scan",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const params = Promise.resolve({ id: "sesi-1" });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authorizeSessionAccess).mockResolvedValue({ status: 200 });
});

describe("POST /api/attendance/sessions/[id]/card-scan", () => {
  it("records a scanned card and returns the student's name", async () => {
    vi.mocked(recordCardScan).mockResolvedValue({
      ok: true,
      duplicate: false,
      status: "PRESENT",
      studentName: "Ani",
      nis: "1001",
    });

    const response = await POST(buildRequest({ cardToken: "tok-1" }), {
      params,
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      studentName: "Ani",
      status: "PRESENT",
    });
    expect(recordCardScan).toHaveBeenCalledWith({
      sessionId: "sesi-1",
      cardToken: "tok-1",
    });
  });

  it("returns 200 for an already-recorded student", async () => {
    vi.mocked(recordCardScan).mockResolvedValue({
      ok: true,
      duplicate: true,
      status: "PRESENT",
      studentName: "Ani",
    });

    const response = await POST(buildRequest({ nis: "1001" }), { params });

    expect(response.status).toBe(200);
  });

  it("rejects a requester who does not own the session", async () => {
    vi.mocked(authorizeSessionAccess).mockResolvedValue({
      status: 403,
      error: "Unauthorized",
    });

    const response = await POST(buildRequest({ cardToken: "tok-1" }), {
      params,
    });

    expect(response.status).toBe(403);
    expect(recordCardScan).not.toHaveBeenCalled();
  });

  it("rejects a body with neither card nor NIS", async () => {
    const response = await POST(buildRequest({}), { params });

    expect(response.status).toBe(400);
    expect(recordCardScan).not.toHaveBeenCalled();
  });

  it("surfaces a rejected scan as 400", async () => {
    vi.mocked(recordCardScan).mockResolvedValue({
      ok: false,
      error: "Kartu tidak dikenal",
    });

    const response = await POST(buildRequest({ cardToken: "revoked" }), {
      params,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Kartu tidak dikenal",
    });
  });
});
