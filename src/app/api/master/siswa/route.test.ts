import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  createSiswaManual,
  getSiswaList,
} from "@/src/features/master/services/siswa";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/siswa", () => ({
  createSiswaManual: vi.fn(),
  getSiswaList: vi.fn(),
}));

const validBody = {
  name: "Siti Aminah",
  email: "siti@example.com",
  password: "rahasia123",
  nis: "1001",
  nisn: "0012345678",
  programKeahlian: "TEKNIK_OTOMOTIF",
  angkatan: 2026,
};

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/siswa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/master/siswa", () => {
  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns the student list for admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getSiswaList).mockResolvedValue([{ id: "s1" }] as Awaited<
      ReturnType<typeof getSiswaList>
    >);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "s1" }]);
  });
});

describe("POST /api/master/siswa", () => {
  it("creates a student manually", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSiswaManual).mockResolvedValue({
      student: { id: "s1" } as Student,
      error: null,
    });

    const response = await POST(buildRequest(validBody));

    expect(response.status).toBe(201);
    expect(createSiswaManual).toHaveBeenCalledWith(
      expect.objectContaining({ nis: "1001" }),
      "admin-1",
    );
  });

  it("returns 400 for an invalid payload", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(buildRequest({ ...validBody, nisn: "12" }));
    expect(response.status).toBe(400);
    expect(createSiswaManual).not.toHaveBeenCalled();
  });

  it("returns 400 when the service fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSiswaManual).mockResolvedValue({
      student: null,
      error: "NIS sudah digunakan siswa lain",
    });

    const response = await POST(buildRequest(validBody));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("NIS sudah digunakan siswa lain");
  });
});
