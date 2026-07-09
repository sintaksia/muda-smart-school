import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { recordScan } from "@/src/features/attendance/services/scan";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/scan", () => ({
  recordScan: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/attendance/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-students", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(buildRequest({ token: "t" }));

    expect(response.status).toBe(403);
    expect(recordScan).not.toHaveBeenCalled();
  });

  it("returns 400 when validation fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(buildRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns 201 with the scan result", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(recordScan).mockResolvedValue({
      ok: true,
      status: "HADIR",
      needsReview: false,
    });

    const response = await POST(
      buildRequest({ token: "tok", gpsLat: -6.9, gpsLng: 107.7 }),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.status).toBe("HADIR");
    expect(recordScan).toHaveBeenCalledWith({
      token: "tok",
      studentUserId: "u1",
      gpsLat: -6.9,
      gpsLng: 107.7,
    });
  });

  it("returns 400 with the specific error when the scan fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(recordScan).mockResolvedValue({
      ok: false,
      error: "Tidak ada sesi aktif",
    });

    const response = await POST(buildRequest({ token: "tok" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Tidak ada sesi aktif");
  });
});
