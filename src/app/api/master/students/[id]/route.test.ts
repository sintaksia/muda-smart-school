import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE, GET, PATCH } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  deleteStudent,
  getStudentById,
  updateStudent,
} from "@/src/features/master/services/student";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/student", () => ({
  getStudentById: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
}));

const routeParams = { params: Promise.resolve({ id: "s1" }) };

function buildRequest(body: unknown, method = "PATCH"): Request {
  const url = "http://localhost/api/master/students/s1";
  if (method === "GET") return new Request(url);
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function asAdmin(): void {
  vi.mocked(getCurrentUser).mockResolvedValue({
    id: "admin-1",
    role: "ADMIN",
  } as SessionUser);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/master/students/[id]", () => {
  it("returns 404 when the student does not exist", async () => {
    asAdmin();
    vi.mocked(getStudentById).mockResolvedValue(null);

    const response = await GET(buildRequest(null, "GET"), routeParams);
    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/master/students/[id]", () => {
  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await PATCH(buildRequest({ classId: "k1" }), routeParams);
    expect(response.status).toBe(403);
  });

  it("assigns the class", async () => {
    asAdmin();
    vi.mocked(updateStudent).mockResolvedValue({
      student: { id: "s1", classId: "k1" } as Student,
      error: null,
    });

    const response = await PATCH(buildRequest({ classId: "k1" }), routeParams);

    expect(response.status).toBe(200);
    expect(updateStudent).toHaveBeenCalledWith("s1", { classId: "k1" });
  });

  it("accepts a full profile edit", async () => {
    asAdmin();
    vi.mocked(updateStudent).mockResolvedValue({
      student: { id: "s1" } as Student,
      error: null,
    });

    const response = await PATCH(
      buildRequest({
        name: "Budi Santoso",
        nis: "2024001",
        gender: "MALE",
        birthDate: "2009-05-01",
        fatherName: "Ahmad",
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateStudent).toHaveBeenCalledWith(
      "s1",
      expect.objectContaining({ gender: "MALE", birthDate: "2009-05-01" }),
    );
  });

  it("returns 400 for an invalid status", async () => {
    asAdmin();

    const response = await PATCH(
      buildRequest({ status: "MENGHILANG" }),
      routeParams,
    );
    expect(response.status).toBe(400);
    expect(updateStudent).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid birth date", async () => {
    asAdmin();

    const response = await PATCH(
      buildRequest({ birthDate: "01-05-2009" }),
      routeParams,
    );
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/master/students/[id]", () => {
  it("deletes the student", async () => {
    asAdmin();
    vi.mocked(deleteStudent).mockResolvedValue({ success: true, error: null });

    const response = await DELETE(buildRequest(null, "DELETE"), routeParams);

    expect(response.status).toBe(200);
    expect(deleteStudent).toHaveBeenCalledWith("s1");
  });

  it("returns 400 when the student still has history", async () => {
    asAdmin();
    vi.mocked(deleteStudent).mockResolvedValue({
      success: false,
      error: "Siswa sudah memiliki riwayat absensi/poin/izin.",
    });

    const response = await DELETE(buildRequest(null, "DELETE"), routeParams);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("riwayat");
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await DELETE(buildRequest(null, "DELETE"), routeParams);
    expect(response.status).toBe(403);
  });
});
