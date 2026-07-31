import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { importStudents } from "@/src/features/master/services/studentImport";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import type { SessionUser } from "@/src/features/auth/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/studentImport", () => ({
  importStudents: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/students/import", {
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

const rows = [{ [STUDENT_SHEET_COLUMNS.name]: "Budi" }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/master/students/import", () => {
  it("imports the rows and returns the summary", async () => {
    asAdmin();
    vi.mocked(importStudents).mockResolvedValue({
      created: 1,
      credentials: [],
      failures: [],
    });

    const response = await POST(buildRequest({ rows }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.created).toBe(1);
    expect(importStudents).toHaveBeenCalledWith(rows, "admin-1");
  });

  it("returns 400 for an empty file", async () => {
    asAdmin();

    const response = await POST(buildRequest({ rows: [] }));

    expect(response.status).toBe(400);
    expect(importStudents).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(buildRequest({ rows }));
    expect(response.status).toBe(403);
  });
});
