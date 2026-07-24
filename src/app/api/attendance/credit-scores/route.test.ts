import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  createManualCreditEntry,
  getCreditTotal,
} from "@/src/features/attendance/services/credit";
import type { SessionUser } from "@/src/features/auth/types";
import type { CreditScore, Student } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findUnique: vi.fn() },
    teacher: { findUnique: vi.fn() },
    creditScore: { findMany: vi.fn() },
  },
}));
vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/credit", () => ({
  createManualCreditEntry: vi.fn(),
  getCreditTotal: vi.fn(),
}));

function buildPost(body: unknown): Request {
  return new Request("http://localhost/api/attendance/credit-scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/attendance/credit-scores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scopes students to their own score regardless of query", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.creditScore.findMany).mockResolvedValue([]);
    vi.mocked(getCreditTotal).mockResolvedValue(90);

    const response = await GET(
      new Request(
        "http://localhost/api/attendance/credit-scores?ownerType=STUDENT&ownerId=other",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.total).toBe(90);
    expect(getCreditTotal).toHaveBeenCalledWith("STUDENT", "s1");
  });

  it("blocks teachers from other teachers' scores", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(prisma.teacher.findUnique).mockResolvedValue({
      id: "guru-1",
    } as never);

    const response = await GET(
      new Request(
        "http://localhost/api/attendance/credit-scores?ownerType=TEACHER&ownerId=guru-2",
      ),
    );
    expect(response.status).toBe(403);
  });
});

describe("POST /api/attendance/credit-scores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets a teacher log a student entry", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "guru-user",
      role: "TEACHER",
    } as SessionUser);
    vi.mocked(createManualCreditEntry).mockResolvedValue({
      id: "c1",
    } as CreditScore);

    const response = await POST(
      buildPost({
        ownerType: "STUDENT",
        ownerId: "s1",
        type: "ACHIEVEMENT",
        category: "Akademik",
        points: 10,
      }),
    );

    expect(response.status).toBe(201);
    expect(createManualCreditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ reportedById: "guru-user" }),
    );
  });

  it("reserves teacher entries for SUPER_ADMIN", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildPost({
        ownerType: "TEACHER",
        ownerId: "g1",
        type: "VIOLATION",
        category: "Komplain",
        points: -5,
      }),
    );

    expect(response.status).toBe(403);
    expect(createManualCreditEntry).not.toHaveBeenCalled();
  });

  it("rejects zero points", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    } as SessionUser);

    const response = await POST(
      buildPost({
        ownerType: "STUDENT",
        ownerId: "s1",
        type: "ACHIEVEMENT",
        category: "Akademik",
        points: 0,
      }),
    );
    expect(response.status).toBe(400);
  });
});
