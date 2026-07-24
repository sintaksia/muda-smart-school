import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { openSession } from "@/src/features/attendance/services/session";
import type { SessionUser } from "@/src/features/auth/types";
import type { Teacher, Jadwal, Sesi } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    teacher: { findUnique: vi.fn() },
    jadwal: { findMany: vi.fn(), findUnique: vi.fn() },
    absensiGuru: { findFirst: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/session", () => ({
  openSession: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/attendance/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/attendance/sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await POST(buildRequest({ jadwalId: "j1" }));
    expect(response.status).toBe(401);
  });

  it("returns 403 when a teacher opens someone else's jadwal", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Teacher);
    vi.mocked(prisma.jadwal.findUnique).mockResolvedValue({
      id: "j1",
      guruId: "other-guru",
    } as Jadwal);
    vi.mocked(prisma.absensiGuru.findFirst).mockResolvedValue(null);

    const response = await POST(buildRequest({ jadwalId: "j1" }));

    expect(response.status).toBe(403);
    expect(openSession).not.toHaveBeenCalled();
  });

  it("opens the session for the scheduled teacher", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-1",
    } as Teacher);
    vi.mocked(prisma.jadwal.findUnique).mockResolvedValue({
      id: "j1",
      guruId: "guru-1",
    } as Jadwal);
    vi.mocked(openSession).mockResolvedValue({
      sesi: { id: "sesi-1", status: "OPEN" } as Sesi,
      error: null,
    });

    const response = await POST(buildRequest({ jadwalId: "j1" }));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe("sesi-1");
    expect(openSession).toHaveBeenCalledWith("j1", { byGuruId: "guru-1" });
  });

  it("returns 400 when the service reports an error", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue(null);
    vi.mocked(openSession).mockResolvedValue({
      sesi: null,
      error: "Jadwal bukan untuk hari ini",
    });

    const response = await POST(buildRequest({ jadwalId: "j1" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Jadwal bukan untuk hari ini");
  });
});
