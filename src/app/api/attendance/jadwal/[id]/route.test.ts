import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT, DELETE } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  updateJadwal,
  deactivateJadwal,
} from "@/src/features/attendance/services/schedule";
import type { SessionUser } from "@/src/features/auth/types";
import type { Jadwal } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/schedule", () => ({
  updateJadwal: vi.fn(),
  deactivateJadwal: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "j1" }) };

const validBody = {
  kelasId: "k1",
  mataPelajaranId: "m1",
  guruId: "g1",
  hari: "SENIN",
  jamMulai: "07:00",
  jamSelesai: "08:30",
};

function buildRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/attendance/jadwal/j1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("PUT /api/attendance/jadwal/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await PUT(buildRequest("PUT", validBody), routeParams);
    expect(response.status).toBe(403);
  });

  it("returns the new effective version", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateJadwal).mockResolvedValue({
      jadwal: { id: "j2" } as Jadwal,
      warnings: [],
      errors: [],
    });

    const response = await PUT(buildRequest("PUT", validBody), routeParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jadwal.id).toBe("j2");
    expect(updateJadwal).toHaveBeenCalledWith("j1", validBody);
  });
});

describe("DELETE /api/attendance/jadwal/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deactivates the entry", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(deactivateJadwal).mockResolvedValue({
      id: "j1",
      isActive: false,
    } as Jadwal);

    const response = await DELETE(buildRequest("DELETE"), routeParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.isActive).toBe(false);
  });

  it("returns 404 for a missing entry", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(deactivateJadwal).mockResolvedValue(null);

    const response = await DELETE(buildRequest("DELETE"), routeParams);
    expect(response.status).toBe(404);
  });
});
