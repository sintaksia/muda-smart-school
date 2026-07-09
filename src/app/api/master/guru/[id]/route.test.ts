import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { updateGuru } from "@/src/features/master/services/guru";
import type { SessionUser } from "@/src/features/auth/types";
import type { Guru } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/guru", () => ({
  updateGuru: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "guru-1" }) };

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/guru/guru-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/master/guru/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates qualifications", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateGuru).mockResolvedValue({
      guru: { id: "guru-1" } as Guru,
      error: null,
    });

    const response = await PUT(
      buildRequest({ mataPelajaranIds: ["m1", "m2"] }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateGuru).toHaveBeenCalledWith("guru-1", {
      mataPelajaranIds: ["m1", "m2"],
    });
  });

  it("returns 400 when the service errors", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateGuru).mockResolvedValue({
      guru: null,
      error: "Guru tidak ditemukan",
    });

    const response = await PUT(
      buildRequest({ jabatan: "Wakasek" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });
});
