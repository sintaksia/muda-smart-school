import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Pendaftaran, User } from "@prisma/client";
import { GET, PATCH, PUT, DELETE } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getRegistrationById,
  deleteRegistration,
  updateRegistrationStatus,
  updateRegistration,
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
    getRegistrationById: vi.fn(),
    deleteRegistration: vi.fn(),
    updateRegistrationStatus: vi.fn(),
    updateRegistration: vi.fn(),
  };
});

const routeParams = { params: Promise.resolve({ id: "reg-1" }) };

function buildRequest(method: string, body?: unknown): NextRequest {
  return new NextRequest("http://localhost/api/registrasi/reg-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
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

describe("auth guard", () => {
  it.each([
    ["GET", () => GET(buildRequest("GET"), routeParams)],
    [
      "PATCH",
      () => PATCH(buildRequest("PATCH", { status: "DITERIMA" }), routeParams),
    ],
    ["PUT", () => PUT(buildRequest("PUT", validRegistrasiBody), routeParams)],
    ["DELETE", () => DELETE(buildRequest("DELETE"), routeParams)],
  ])("%s returns 401 when unauthenticated", async (_method, call) => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await call();

    expect(response.status).toBe(401);
    expect(getRegistrationById).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-admin user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      role: "STUDENT",
    } as User);
    vi.mocked(canAccessAdmin).mockReturnValue(false);

    const response = await GET(buildRequest("GET"), routeParams);

    expect(response.status).toBe(403);
  });
});

describe("GET /api/registrasi/[id]", () => {
  it("returns 404 when the registration does not exist", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue(null);

    const response = await GET(buildRequest("GET"), routeParams);

    expect(response.status).toBe(404);
  });

  it("returns the registration when found", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue({
      id: "reg-1",
    } as Awaited<ReturnType<typeof getRegistrationById>>);

    const response = await GET(buildRequest("GET"), routeParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("reg-1");
  });
});

describe("PATCH /api/registrasi/[id]", () => {
  it("returns 400 for an invalid status", async () => {
    mockAdmin();

    const response = await PATCH(
      buildRequest("PATCH", { status: "NGACO" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Status tidak valid");
    expect(updateRegistrationStatus).not.toHaveBeenCalled();
  });

  it("updates a valid status", async () => {
    mockAdmin();
    vi.mocked(updateRegistrationStatus).mockResolvedValue({
      id: "reg-1",
      status: "DITERIMA",
    } as Pendaftaran);

    const response = await PATCH(
      buildRequest("PATCH", { status: "DITERIMA" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("DITERIMA");
    expect(updateRegistrationStatus).toHaveBeenCalledWith("reg-1", "DITERIMA");
  });
});

describe("PUT /api/registrasi/[id]", () => {
  it("returns 404 when the registration does not exist", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue(null);

    const response = await PUT(
      buildRequest("PUT", validRegistrasiBody),
      routeParams,
    );

    expect(response.status).toBe(404);
    expect(updateRegistration).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid body", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue({
      id: "reg-1",
    } as Awaited<ReturnType<typeof getRegistrationById>>);

    const response = await PUT(
      buildRequest("PUT", { ...validRegistrasiBody, nik: "123" }),
      routeParams,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Data tidak valid");
    expect(updateRegistration).not.toHaveBeenCalled();
  });

  it("updates the registration with converted data", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue({
      id: "reg-1",
    } as Awaited<ReturnType<typeof getRegistrationById>>);
    vi.mocked(updateRegistration).mockResolvedValue({
      id: "reg-1",
    } as Pendaftaran);

    const response = await PUT(
      buildRequest("PUT", validRegistrasiBody),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateRegistration).toHaveBeenCalledWith(
      "reg-1",
      expect.objectContaining({
        namaLengkap: "Budi Santoso",
        tahunLahirAyah: 1980,
        emailMurid: null,
      }),
    );
  });
});

describe("DELETE /api/registrasi/[id]", () => {
  it("returns 404 when the registration does not exist", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue(null);

    const response = await DELETE(buildRequest("DELETE"), routeParams);

    expect(response.status).toBe(404);
    expect(deleteRegistration).not.toHaveBeenCalled();
  });

  it("deletes an existing registration", async () => {
    mockAdmin();
    vi.mocked(getRegistrationById).mockResolvedValue({
      id: "reg-1",
    } as Awaited<ReturnType<typeof getRegistrationById>>);
    vi.mocked(deleteRegistration).mockResolvedValue({
      id: "reg-1",
    } as Pendaftaran);

    const response = await DELETE(buildRequest("DELETE"), routeParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(deleteRegistration).toHaveBeenCalledWith("reg-1");
  });
});
