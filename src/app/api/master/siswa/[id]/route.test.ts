import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getSiswaDetail,
  updateSiswa,
} from "@/src/features/master/services/siswa";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/siswa", () => ({
  getSiswaDetail: vi.fn(),
  updateSiswa: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "s1" }) };

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/siswa/s1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/master/siswa/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the student detail", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getSiswaDetail).mockResolvedValue({
      siswa: { id: "s1" },
      absensiSummary: [],
      creditEntries: [],
      creditTotal: 100,
      izinHistory: [],
    } as never);

    const response = await GET(
      new Request("http://localhost/api/master/siswa/s1"),
      routeParams,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.siswa.id).toBe("s1");
  });

  it("returns 404 for a missing student", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getSiswaDetail).mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost/api/master/siswa/s1"),
      routeParams,
    );
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/master/siswa/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await PATCH(buildRequest({ kelasId: "k1" }), routeParams);
    expect(response.status).toBe(403);
  });

  it("assigns the class", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(updateSiswa).mockResolvedValue({
      siswa: { id: "s1", kelasId: "k1" } as Student,
      error: null,
    });

    const response = await PATCH(buildRequest({ kelasId: "k1" }), routeParams);

    expect(response.status).toBe(200);
    expect(updateSiswa).toHaveBeenCalledWith("s1", { kelasId: "k1" });
  });

  it("returns 400 for an invalid status", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await PATCH(
      buildRequest({ status: "MENGHILANG" }),
      routeParams,
    );
    expect(response.status).toBe(400);
    expect(updateSiswa).not.toHaveBeenCalled();
  });
});
