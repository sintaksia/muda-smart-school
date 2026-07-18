import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { getFaqs, createFaq } from "@/src/features/cms/services/faqs";
import type { Faq } from "@prisma/client";

vi.mock("@/src/features/cms/services/faqs", () => ({
  getFaqs: vi.fn(),
  createFaq: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/src/features/auth/utils/api-auth", () => ({
  requireCmsAccess: vi.fn().mockResolvedValue({
    user: { id: "admin-1", role: "ADMIN" },
  }),
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

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/cms/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/cms/faqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns faqs", async () => {
    vi.mocked(getFaqs).mockResolvedValue([mockFaq]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("faq-1");
  });

  it("returns 500 on service error", async () => {
    vi.mocked(getFaqs).mockRejectedValue(new Error("db down"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe("POST /api/cms/faqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a faq with valid data", async () => {
    vi.mocked(createFaq).mockResolvedValue(mockFaq);

    const response = await POST(
      buildRequest({
        question: "Bagaimana cara mendaftar?",
        answer: "Melalui halaman pendaftaran online.",
        order: 0,
        isActive: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(createFaq).toHaveBeenCalledWith({
      question: "Bagaimana cara mendaftar?",
      answer: "Melalui halaman pendaftaran online.",
      order: 0,
      isActive: true,
    });
  });

  it("returns 400 for invalid data", async () => {
    const response = await POST(
      buildRequest({ question: "", answer: "", order: 0, isActive: true }),
    );

    expect(response.status).toBe(400);
    expect(createFaq).not.toHaveBeenCalled();
  });
});
