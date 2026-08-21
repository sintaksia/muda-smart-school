import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  executePromotion,
  getPromotionPreview,
} from "@/src/features/master/services/classPromotion";
import type { SessionUser } from "@/src/features/auth/types";
import type { PromotionPreview } from "@/src/features/master/types";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/master/services/classPromotion", () => ({
  getPromotionPreview: vi.fn(),
  executePromotion: vi.fn(),
}));

const admin = { id: "admin-1", role: "ADMIN" } as SessionUser;

const validPlan = {
  fromAcademicYear: "2025/2026",
  toAcademicYear: "2026/2027",
  entries: [{ studentId: "s1", action: "PROMOTE", targetClassId: "c11" }],
};

function postRequest(body: unknown): Request {
  return new Request("http://localhost/api/master/students/class-promotion", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getCurrentUser).mockResolvedValue(admin);
});

describe("GET /api/master/students/class-promotion", () => {
  it("returns the preview for a valid year pair", async () => {
    vi.mocked(getPromotionPreview).mockResolvedValue({
      classes: [],
    } as unknown as PromotionPreview);

    const response = await GET(
      new Request(
        "http://localhost/api/master/students/class-promotion?from=2025/2026&to=2026/2027",
      ),
    );

    expect(response.status).toBe(200);
    expect(getPromotionPreview).toHaveBeenCalledWith("2025/2026", "2026/2027");
  });

  it("rejects a malformed academic year", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/master/students/class-promotion?from=2025&to=2026/2027",
      ),
    );

    expect(response.status).toBe(400);
    expect(getPromotionPreview).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);

    const response = await GET(
      new Request(
        "http://localhost/api/master/students/class-promotion?from=2025/2026&to=2026/2027",
      ),
    );

    expect(response.status).toBe(403);
    expect(getPromotionPreview).not.toHaveBeenCalled();
  });
});

describe("POST /api/master/students/class-promotion", () => {
  it("runs the promotion and returns the counts", async () => {
    vi.mocked(executePromotion).mockResolvedValue({
      result: {
        batchId: "batch-1",
        promoted: 3,
        retained: 0,
        graduated: 1,
        exited: 0,
      },
      error: null,
    });

    const response = await POST(postRequest(validPlan));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.batchId).toBe("batch-1");
    expect(executePromotion).toHaveBeenCalledWith(
      expect.objectContaining({ toAcademicYear: "2026/2027" }),
      "admin-1",
    );
  });

  it("rejects a PROMOTE entry with no destination class", async () => {
    const response = await POST(
      postRequest({
        ...validPlan,
        entries: [{ studentId: "s1", action: "PROMOTE" }],
      }),
    );

    expect(response.status).toBe(400);
    expect(executePromotion).not.toHaveBeenCalled();
  });

  it("rejects an EXIT entry with no exit status", async () => {
    const response = await POST(
      postRequest({
        ...validPlan,
        entries: [{ studentId: "s1", action: "EXIT" }],
      }),
    );

    expect(response.status).toBe(400);
    expect(executePromotion).not.toHaveBeenCalled();
  });

  it("surfaces a service-level rejection as 400", async () => {
    vi.mocked(executePromotion).mockResolvedValue({
      result: null,
      error: "Ada siswa yang tidak ditemukan",
    });

    const response = await POST(postRequest(validPlan));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Ada siswa yang tidak ditemukan");
  });

  it("returns 403 for non-admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "TEACHER",
    } as SessionUser);

    const response = await POST(postRequest(validPlan));

    expect(response.status).toBe(403);
    expect(executePromotion).not.toHaveBeenCalled();
  });
});
