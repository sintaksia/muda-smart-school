import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { deleteSubject } from "@/src/features/master/services/subject";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/subject", () => ({
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "m1" }) };

function buildRequest(): Request {
  return new Request("http://localhost/api/master/subjects/m1", {
    method: "DELETE",
  });
}

describe("DELETE /api/master/subjects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await DELETE(buildRequest(), routeParams);
    expect(response.status).toBe(403);
    expect(deleteSubject).not.toHaveBeenCalled();
  });

  it("returns 400 when the subject is still scheduled", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(deleteSubject).mockResolvedValue({
      ok: false,
      error: "Mapel masih dipakai di jadwal — tidak dapat dihapus",
    });

    const response = await DELETE(buildRequest(), routeParams);
    expect(response.status).toBe(400);
  });
});
