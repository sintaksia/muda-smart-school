import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { createSubject } from "@/src/features/master/services/subject";
import type { SessionUser } from "@/src/features/auth/types";
import type { Subject } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/subject", () => ({
  getSubjectList: vi.fn(),
  createSubject: vi.fn(),
}));

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/master/subjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await POST(
      buildRequest({ name: "Matematika", code: "MTK" }),
    );
    expect(response.status).toBe(403);
  });

  it("creates a subject with an uppercased kode", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSubject).mockResolvedValue({
      subject: { id: "m1" } as Subject,
      error: null,
    });

    const response = await POST(
      buildRequest({ name: "Matematika", code: "mtk" }),
    );

    expect(response.status).toBe(201);
    expect(createSubject).toHaveBeenCalledWith(
      expect.objectContaining({ code: "MTK" }),
    );
  });

  it("returns 400 when the service rejects a duplicate", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);
    vi.mocked(createSubject).mockResolvedValue({
      subject: null,
      error: "Kode mapel sudah digunakan",
    });

    const response = await POST(
      buildRequest({ name: "Matematika", code: "MTK" }),
    );
    expect(response.status).toBe(400);
  });
});
