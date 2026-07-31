import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  createStudent,
  getStudentList,
} from "@/src/features/master/services/student";
import type { SessionUser } from "@/src/features/auth/types";
import type { Student } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/student", () => ({
  getStudentList: vi.fn(),
  createStudent: vi.fn(),
}));

const validBody = {
  name: "Budi Santoso",
  email: "budi@contoh.sch.id",
  nis: "2024001",
  nisn: "0091234567",
  specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
  angkatan: 2024,
};

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/students", {
    method: "POST",
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

describe("GET /api/master/students", () => {
  it("returns the list for an admin", async () => {
    asAdmin();
    vi.mocked(getStudentList).mockResolvedValue([]);

    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await GET();
    expect(response.status).toBe(403);
    expect(getStudentList).not.toHaveBeenCalled();
  });
});

describe("POST /api/master/students", () => {
  it("creates a student", async () => {
    asAdmin();
    vi.mocked(createStudent).mockResolvedValue({
      student: { id: "s1" } as Student,
      error: null,
    });

    const response = await POST(buildRequest(validBody));

    expect(response.status).toBe(201);
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ nis: "2024001" }),
      "admin-1",
    );
  });

  it("returns 400 for an invalid email", async () => {
    asAdmin();

    const response = await POST(
      buildRequest({ ...validBody, email: "bukan-email" }),
    );

    expect(response.status).toBe(400);
    expect(createStudent).not.toHaveBeenCalled();
  });

  it("surfaces a duplicate NIS as 400", async () => {
    asAdmin();
    vi.mocked(createStudent).mockResolvedValue({
      student: null,
      error: "NIS sudah digunakan siswa lain",
    });

    const response = await POST(buildRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("NIS sudah digunakan siswa lain");
  });

  it("returns 403 when not signed in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const response = await POST(buildRequest(validBody));
    expect(response.status).toBe(403);
  });
});
