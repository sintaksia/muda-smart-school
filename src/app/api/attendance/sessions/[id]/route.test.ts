import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  closeSession,
  refreshQrToken,
} from "@/src/features/attendance/services/session";
import { markManualAttendance } from "@/src/features/attendance/services/scan";
import type { SessionUser } from "@/src/features/auth/types";
import type { AbsensiSiswa, Sesi } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    guru: { findUnique: vi.fn() },
    sesi: { findUnique: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/session", () => ({
  closeSession: vi.fn(),
  refreshQrToken: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/scan", () => ({
  markManualAttendance: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/sessions/sesi-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: "sesi-1" }) };

describe("PATCH /api/attendance/sessions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
  });

  it("closes the session", async () => {
    vi.mocked(closeSession).mockResolvedValue({
      sesi: { id: "sesi-1", status: "CLOSED" } as Sesi,
      error: null,
    });

    const response = await PATCH(
      buildRequest({ action: "close" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("CLOSED");
    expect(closeSession).toHaveBeenCalledWith("sesi-1");
  });

  it("refreshes the QR token", async () => {
    vi.mocked(refreshQrToken).mockResolvedValue({
      id: "sesi-1",
      qrToken: "new",
    } as Sesi);

    const response = await PATCH(
      buildRequest({ action: "refresh-qr" }),
      routeParams,
    );
    const data = await response.json();

    expect(data.qrToken).toBe("new");
  });

  it("records manual attendance", async () => {
    vi.mocked(markManualAttendance).mockResolvedValue({
      record: { id: "abs-1" } as AbsensiSiswa,
      error: null,
    });

    const response = await PATCH(
      buildRequest({
        action: "manual-attendance",
        studentId: "s1",
        status: "IZIN",
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(markManualAttendance).toHaveBeenCalledWith(
      "sesi-1",
      "s1",
      "IZIN",
      undefined,
    );
  });

  it("rejects an unknown action", async () => {
    const response = await PATCH(
      buildRequest({ action: "explode" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });

  it("returns 403 for a teacher who does not own the session", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.guru.findUnique).mockResolvedValue({
      id: "guru-1",
    } as never);
    vi.mocked(prisma.sesi.findUnique).mockResolvedValue({
      id: "sesi-1",
      actualGuruId: "other",
      jadwal: { guruId: "other" },
    } as unknown as Sesi);

    const response = await PATCH(
      buildRequest({ action: "close" }),
      routeParams,
    );
    expect(response.status).toBe(403);
    expect(closeSession).not.toHaveBeenCalled();
  });
});
