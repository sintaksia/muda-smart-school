import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { revertPromotion } from "@/src/features/master/services/classPromotion";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/classPromotion", () => ({
  revertPromotion: vi.fn(),
}));

function postRequest(body: unknown): Request {
  return new Request(
    "http://localhost/api/master/students/class-promotion/revert",
    { method: "POST", body: JSON.stringify(body) },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "admin-1",
    role: "ADMIN",
  } as SessionUser);
});

describe("POST /api/master/students/class-promotion/revert", () => {
  it("reverts the batch", async () => {
    vi.mocked(revertPromotion).mockResolvedValue({ ok: true, error: null });

    const response = await POST(postRequest({ batchId: "batch-1" }));

    expect(response.status).toBe(200);
    expect(revertPromotion).toHaveBeenCalledWith("batch-1");
  });

  it("rejects a body with no batch id", async () => {
    const response = await POST(postRequest({}));

    expect(response.status).toBe(400);
    expect(revertPromotion).not.toHaveBeenCalled();
  });

  it("surfaces a refusal from the service", async () => {
    vi.mocked(revertPromotion).mockResolvedValue({
      ok: false,
      error: "Hanya proses kenaikan terakhir yang dapat dibatalkan",
    });

    const response = await POST(postRequest({ batchId: "batch-1" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/terakhir/);
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(postRequest({ batchId: "batch-1" }));

    expect(response.status).toBe(403);
    expect(revertPromotion).not.toHaveBeenCalled();
  });
});
