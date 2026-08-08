import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Student } from "@prisma/client";
import type { SessionUser } from "@/src/features/auth/types";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  ensureCardTokens,
  regenerateCardToken,
} from "@/src/features/master/services/studentCard";
import { POST, PATCH } from "./route";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/studentCard", () => ({
  ensureCardTokens: vi.fn(),
  regenerateCardToken: vi.fn(),
}));

function buildRequest(body: unknown, method: string): Request {
  return new Request("http://localhost/api/master/students/cards", {
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

describe("POST /api/master/students/cards", () => {
  it("mints tokens for the class", async () => {
    asAdmin();
    vi.mocked(ensureCardTokens).mockResolvedValue(3);

    const response = await POST(buildRequest({ classId: "class-1" }, "POST"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ minted: 3 });
    expect(ensureCardTokens).toHaveBeenCalledWith("class-1");
  });

  it("rejects a non-admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "teacher-1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(buildRequest({ classId: "class-1" }, "POST"));

    expect(response.status).toBe(403);
    expect(ensureCardTokens).not.toHaveBeenCalled();
  });

  it("rejects a missing classId", async () => {
    asAdmin();

    const response = await POST(buildRequest({}, "POST"));

    expect(response.status).toBe(400);
    expect(ensureCardTokens).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/master/students/cards", () => {
  it("reissues one student's card", async () => {
    asAdmin();
    vi.mocked(regenerateCardToken).mockResolvedValue({
      student: { id: "s1" } as Student,
      error: null,
    });

    const response = await PATCH(buildRequest({ studentId: "s1" }, "PATCH"));

    expect(response.status).toBe(200);
    expect(regenerateCardToken).toHaveBeenCalledWith("s1");
  });

  it("returns 404 when the student does not exist", async () => {
    asAdmin();
    vi.mocked(regenerateCardToken).mockResolvedValue({
      student: null,
      error: "Siswa tidak ditemukan",
    });

    const response = await PATCH(
      buildRequest({ studentId: "missing" }, "PATCH"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Siswa tidak ditemukan",
    });
  });
});
