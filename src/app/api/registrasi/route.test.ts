import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Pendaftaran, User } from "@prisma/client";
import { GET, POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getAllRegistrations,
  getRegistrationsByStatus,
  createRegistration,
} from "@/src/features/registration/services";
import { validRegistrasiBody } from "@/src/features/registration/services/registration.schema.test";

vi.mock("@/src/lib/prisma", () => ({ prisma: {} }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/src/features/auth/utils/permissions", () => ({
  canAccessAdmin: vi.fn(),
}));

vi.mock("@/src/features/registration/services", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/src/features/registration/services")
    >();
  return {
    ...actual,
    getAllRegistrations: vi.fn(),
    getRegistrationsByStatus: vi.fn(),
    createRegistration: vi.fn(),
  };
});

function buildGetRequest(query = ""): NextRequest {
  return new NextRequest(`http://localhost/api/registrasi${query}`);
}

function buildPostRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/registrasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function mockAdmin(): void {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "admin-1",
    role: "ADMIN",
  } as User);
  vi.mocked(canAccessAdmin).mockReturnValue(true);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/registrasi", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await GET(buildGetRequest());

    expect(response.status).toBe(401);
    expect(getAllRegistrations).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-admin user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      role: "STUDENT",
    } as User);
    vi.mocked(canAccessAdmin).mockReturnValue(false);

    const response = await GET(buildGetRequest());

    expect(response.status).toBe(403);
    expect(getAllRegistrations).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid status filter", async () => {
    mockAdmin();

    const response = await GET(buildGetRequest("?status=SALAH"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Status "SALAH" tidak valid');
  });

  it("returns all registrations for an admin", async () => {
    mockAdmin();
    vi.mocked(getAllRegistrations).mockResolvedValue([
      { id: "reg-1" },
    ] as Awaited<ReturnType<typeof getAllRegistrations>>);

    const response = await GET(buildGetRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it("filters by a valid status", async () => {
    mockAdmin();
    vi.mocked(getRegistrationsByStatus).mockResolvedValue([]);

    const response = await GET(buildGetRequest("?status=PENDING"));

    expect(response.status).toBe(200);
    expect(getRegistrationsByStatus).toHaveBeenCalledWith("PENDING");
    expect(getAllRegistrations).not.toHaveBeenCalled();
  });
});

describe("POST /api/registrasi", () => {
  it("returns 400 for an invalid body", async () => {
    const response = await POST(
      buildPostRequest({ ...validRegistrasiBody, nisn: "abc" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Data tidak valid");
    expect(createRegistration).not.toHaveBeenCalled();
  });

  it("returns 201 with the created registration (public, no auth needed)", async () => {
    vi.mocked(createRegistration).mockResolvedValue({
      id: "reg-1",
    } as Pendaftaran);

    const response = await POST(buildPostRequest(validRegistrasiBody));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBe("reg-1");
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it("returns 409 when NISN/NIK is already registered", async () => {
    vi.mocked(createRegistration).mockRejectedValue(
      new Error("NISN atau NIK sudah terdaftar"),
    );

    const response = await POST(buildPostRequest(validRegistrasiBody));
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("NISN atau NIK sudah terdaftar");
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(createRegistration).mockRejectedValue(new Error("db down"));

    const response = await POST(buildPostRequest(validRegistrasiBody));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Gagal membuat pendaftaran");
  });
});
