import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { bulkUpdateSiswa } from "@/src/features/master/services/siswa";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/siswa", () => ({
  bulkUpdateSiswa: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/siswa/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/master/siswa/bulk", () => {
  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(
      buildRequest({ action: "GRADUATE", studentIds: ["s1"] }),
    );
    expect(response.status).toBe(403);
  });

  it("promotes students", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(bulkUpdateSiswa).mockResolvedValue({ count: 2, error: null });

    const response = await POST(
      buildRequest({
        action: "PROMOTE",
        studentIds: ["s1", "s2"],
        targetKelasId: "k2",
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 2 });
  });

  it("returns 400 when PROMOTE is missing a target class", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildRequest({ action: "PROMOTE", studentIds: ["s1"] }),
    );
    expect(response.status).toBe(400);
    expect(bulkUpdateSiswa).not.toHaveBeenCalled();
  });
});
