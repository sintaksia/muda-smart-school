import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { reportTeacherAbsence } from "@/src/features/attendance/services/teacher-attendance";
import type { SessionUser } from "@/src/features/auth/types";
import type { AbsensiGuru, Guru } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    guru: { findUnique: vi.fn() },
    absensiGuru: { findMany: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/teacher-attendance", () => ({
  reportTeacherAbsence: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/teacher-absence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/attendance/teacher-absence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets a teacher self-report izin (forcing their own guruId)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.guru.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Guru);
    vi.mocked(reportTeacherAbsence).mockResolvedValue({
      records: [{ id: "ag-1" } as AbsensiGuru],
      error: null,
    });

    const response = await POST(
      buildRequest({
        guruId: "someone-else",
        tanggal: "2026-07-09",
        status: "IZIN",
      }),
    );

    expect(response.status).toBe(201);
    expect(reportTeacherAbsence).toHaveBeenCalledWith(
      expect.objectContaining({ guruId: "guru-1", reportedById: "u1" }),
    );
  });

  it("forbids teachers from recording ALPHA themselves", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.guru.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Guru);

    const response = await POST(
      buildRequest({ tanggal: "2026-07-09", status: "ALPHA" }),
    );

    expect(response.status).toBe(403);
    expect(reportTeacherAbsence).not.toHaveBeenCalled();
  });

  it("requires guruId for admin reports", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildRequest({ tanggal: "2026-07-09", status: "SAKIT" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("guruId wajib diisi");
  });
});
