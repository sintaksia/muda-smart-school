import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { reviewIzin } from "@/src/features/attendance/services/izin";
import type { SessionUser } from "@/src/features/auth/types";
import type { PengajuanIzin } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    pengajuanIzin: { findUnique: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/izin", () => ({
  reviewIzin: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/izin/izin-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: "izin-1" }) };

describe("PATCH /api/attendance/izin/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the wali kelas approve", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "wali-user",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.pengajuanIzin.findUnique).mockResolvedValue({
      id: "izin-1",
      student: { schoolClass: { homeroomTeacher: { userId: "wali-user" } } },
    } as unknown as PengajuanIzin);
    vi.mocked(reviewIzin).mockResolvedValue({
      izin: { id: "izin-1", status: "APPROVED" } as PengajuanIzin,
      error: null,
    });

    const response = await PATCH(
      buildRequest({ decision: "APPROVED" }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(reviewIzin).toHaveBeenCalledWith(
      "izin-1",
      "APPROVED",
      "wali-user",
      undefined,
    );
  });

  it("rejects a teacher who is not the wali kelas", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "other-teacher",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.pengajuanIzin.findUnique).mockResolvedValue({
      id: "izin-1",
      student: { schoolClass: { homeroomTeacher: { userId: "wali-user" } } },
    } as unknown as PengajuanIzin);

    const response = await PATCH(
      buildRequest({ decision: "APPROVED" }),
      routeParams,
    );
    expect(response.status).toBe(403);
    expect(reviewIzin).not.toHaveBeenCalled();
  });

  it("returns 400 when the service reports an error", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(reviewIzin).mockResolvedValue({
      izin: null,
      error: "Pengajuan sudah diproses",
    });

    const response = await PATCH(
      buildRequest({ decision: "REJECTED", reviewNote: "x" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Pengajuan sudah diproses");
  });
});
