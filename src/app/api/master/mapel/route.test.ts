import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { createMapel } from "@/src/features/master/services/mapel";
import type { SessionUser } from "@/src/features/auth/types";
import type { MataPelajaran } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/mapel", () => ({
  getMapelList: vi.fn(),
  createMapel: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/mapel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/master/mapel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(
      buildRequest({ nama: "Matematika", kode: "MTK" }),
    );
    expect(response.status).toBe(403);
  });

  it("creates a subject with an uppercased kode", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createMapel).mockResolvedValue({
      mapel: { id: "m1" } as MataPelajaran,
      error: null,
    });

    const response = await POST(
      buildRequest({ nama: "Matematika", kode: "mtk" }),
    );

    expect(response.status).toBe(201);
    expect(createMapel).toHaveBeenCalledWith(
      expect.objectContaining({ kode: "MTK" }),
    );
  });

  it("returns 400 when the service rejects a duplicate", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createMapel).mockResolvedValue({
      mapel: null,
      error: "Kode mapel sudah digunakan",
    });

    const response = await POST(
      buildRequest({ nama: "Matematika", kode: "MTK" }),
    );
    expect(response.status).toBe(400);
  });
});
