import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, PATCH, DELETE } from "./route";
import {
  getFaqById,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "@/src/features/cms/services/faqs";
import type { Faq } from "@prisma/client";

vi.mock("@/src/features/cms/services/faqs", () => ({
  getFaqById: vi.fn(),
  updateFaq: vi.fn(),
  deleteFaq: vi.fn(),
  toggleFaqStatus: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockFaq: Faq = {
  id: "faq-1",
  question: "Bagaimana cara mendaftar?",
  answer: "Melalui halaman pendaftaran online.",
  order: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const routeParams = { params: Promise.resolve({ id: "faq-1" }) };

function buildRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/cms/faqs/faq-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/cms/faqs/[id]", () => {
  it("returns the faq", async () => {
    vi.mocked(getFaqById).mockResolvedValue(mockFaq);

    const response = await GET(buildRequest("GET"), routeParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("faq-1");
  });

  it("returns 404 when not found", async () => {
    vi.mocked(getFaqById).mockResolvedValue(null);

    const response = await GET(buildRequest("GET"), routeParams);

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/cms/faqs/[id]", () => {
  it("updates with valid data", async () => {
    vi.mocked(updateFaq).mockResolvedValue(mockFaq);

    const response = await PUT(
      buildRequest("PUT", {
        question: "Updated?",
        answer: "Updated answer.",
        order: 1,
        isActive: false,
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateFaq).toHaveBeenCalledWith("faq-1", {
      question: "Updated?",
      answer: "Updated answer.",
      order: 1,
      isActive: false,
    });
  });

  it("returns 400 for invalid data", async () => {
    const response = await PUT(
      buildRequest("PUT", { question: "", answer: "", order: 0 }),
      routeParams,
    );

    expect(response.status).toBe(400);
    expect(updateFaq).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/cms/faqs/[id]", () => {
  it("toggles status", async () => {
    vi.mocked(toggleFaqStatus).mockResolvedValue({
      ...mockFaq,
      isActive: false,
    });

    const response = await PATCH(
      buildRequest("PATCH", { isActive: false }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(toggleFaqStatus).toHaveBeenCalledWith("faq-1", false);
  });

  it("returns 400 when isActive is missing", async () => {
    const response = await PATCH(buildRequest("PATCH", {}), routeParams);

    expect(response.status).toBe(400);
    expect(toggleFaqStatus).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/cms/faqs/[id]", () => {
  it("deletes the faq", async () => {
    vi.mocked(deleteFaq).mockResolvedValue(mockFaq);

    const response = await DELETE(buildRequest("DELETE"), routeParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteFaq).toHaveBeenCalledWith("faq-1");
  });

  it("returns 500 on service error", async () => {
    vi.mocked(deleteFaq).mockRejectedValue(new Error("db down"));

    const response = await DELETE(buildRequest("DELETE"), routeParams);

    expect(response.status).toBe(500);
  });
});
