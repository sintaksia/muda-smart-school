import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canManageCMS } from "@/src/features/auth/utils/permissions";
import { createStudentFromRegistration } from "@/src/features/student/services/student.service";
import type { User, Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/src/features/auth/utils/permissions", () => ({
  canManageCMS: vi.fn(),
}));

vi.mock("@/src/features/student/services/student.service", () => ({
  createStudentFromRegistration: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  pendaftaranId: "reg-1",
  nis: "999",
  angkatan: 2025,
  password: "Password123",
};

describe("POST /api/students", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when user is not authorized", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      role: "STUDENT",
    } as User);
    vi.mocked(canManageCMS).mockReturnValue(false);

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Unauthorized");
    expect(createStudentFromRegistration).not.toHaveBeenCalled();
  });

  it("returns 400 when validation fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as User);
    vi.mocked(canManageCMS).mockReturnValue(true);

    const response = await POST(
      buildRequest({ ...validBody, password: "short" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Data tidak valid");
    expect(createStudentFromRegistration).not.toHaveBeenCalled();
  });

  it("returns 400 when the service returns an error", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as User);
    vi.mocked(canManageCMS).mockReturnValue(true);
    vi.mocked(createStudentFromRegistration).mockResolvedValue({
      student: null,
      error: "Pendaftaran tidak ditemukan",
    });

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Pendaftaran tidak ditemukan");
  });

  it("returns 201 and the created student on success", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as User);
    vi.mocked(canManageCMS).mockReturnValue(true);
    vi.mocked(createStudentFromRegistration).mockResolvedValue({
      student: { id: "student-1" } as Student,
      error: null,
    });

    const response = await POST(buildRequest(validBody));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual({ id: "student-1" });
    expect(createStudentFromRegistration).toHaveBeenCalledWith(
      validBody,
      "admin-1",
    );
  });
});
