import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getSiswaList } from "@/src/features/master/services/siswa";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/siswa", () => ({
  getSiswaList: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/master/siswa/export", () => {
  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns an xlsx attachment for admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getSiswaList).mockResolvedValue([
      {
        nis: "1001",
        nisn: "0012345678",
        programKeahlian: "TEKNIK_OTOMOTIF",
        angkatan: 2026,
        status: "AKTIF",
        user: { name: "Siti", email: "siti@example.com", phone: null },
        kelas: null,
      },
    ] as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
    expect(response.headers.get("Content-Disposition")).toContain("siswa-");
  });
});
