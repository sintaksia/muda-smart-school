import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { deleteClass } from "@/src/features/master/services/schoolClass";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/schoolClass", () => ({
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "k1" }) };

function buildRequest(): Request {
  return new Request("http://localhost/api/master/classes/k1", {
    method: "DELETE",
  });
}

describe("DELETE /api/master/classes/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes an unused class", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(deleteClass).mockResolvedValue({ ok: true, error: null });

    const response = await DELETE(buildRequest(), routeParams);
    expect(response.status).toBe(200);
  });

  it("returns 400 with the specific error when in use", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(deleteClass).mockResolvedValue({
      ok: false,
      error: "Kelas masih memiliki siswa atau jadwal — tidak dapat dihapus",
    });

    const response = await DELETE(buildRequest(), routeParams);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("masih memiliki siswa");
  });
});
