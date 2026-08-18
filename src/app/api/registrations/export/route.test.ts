import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getAllRegistrations } from "@/src/features/registration/services";
import type { SessionUser } from "@/src/features/auth/types";
import type { Registration } from "@/src/features/registration/services";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/registration/services", () => ({
  getAllRegistrations: vi.fn(),
}));

const registration = {
  registrationNumber: "REG-001",
  fullName: "Budi Santoso",
  nisn: "1234567890",
  nik: "3201010101010001",
  familyCardNumber: "3201010101010002",
  gender: "MALE",
  specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
  status: "PENDING",
  birthPlace: "Bandung",
  birthDate: new Date("2008-01-01"),
  studentPhone: "08123456789",
  studentEmail: null,
  streetAddress: "Jl. Merdeka 1",
  rt: "01",
  rw: "02",
  village: "Sukamaju",
  district: "Coblong",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40123",
  previousSchoolName: "SMPN 1",
  previousSchoolNpsn: "20200001",
  graduationYear: 2024,
  fatherName: "Ayah",
  fatherOccupation: "Wiraswasta",
  motherName: "Ibu",
  motherOccupation: "Guru",
  registrationDate: new Date("2024-06-01"),
} as unknown as Registration;

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/registrations/export", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("GET /api/registrations/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(getAllRegistrations).not.toHaveBeenCalled();
  });

  // The export sheet carries applicant PII (NIK, family card number, full
  // address, parent details) — non-admin roles must never reach the data.
  it.each(["TEACHER", "STUDENT"] as const)(
    "returns 403 for %s",
    async (role) => {
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: "u1",
        role,
      } as SessionUser);

      const response = await GET();

      expect(response.status).toBe(403);
      expect(getAllRegistrations).not.toHaveBeenCalled();
    },
  );

  it("returns an xlsx attachment for an admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getAllRegistrations).mockResolvedValue([registration]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
    expect(response.headers.get("Content-Disposition")).toContain(
      "pendaftaran-semua",
    );
  });

  it("returns 500 when the lookup fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(getAllRegistrations).mockRejectedValue(new Error("db down"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe("POST /api/registrations/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await POST(postRequest({ data: [registration] }));

    expect(response.status).toBe(401);
  });

  it("returns 400 when data is not an array", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(postRequest({ data: "nope" }));

    expect(response.status).toBe(400);
  });

  it("returns an xlsx attachment for an admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "SUPER_ADMIN",
    } as SessionUser);

    const response = await POST(postRequest({ data: [registration] }));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      "pendaftaran-filtered",
    );
  });
});
