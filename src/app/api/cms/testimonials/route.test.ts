import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import {
  getTestimonials,
  createTestimonial,
} from "@/src/features/cms/services/testimonials";
import type { Testimonial } from "@prisma/client";

vi.mock("@/src/features/cms/services/testimonials", () => ({
  getTestimonials: vi.fn(),
  createTestimonial: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockTestimonial: Testimonial = {
  id: "testimonial-1",
  name: "Rizki Ananda",
  role: "Alumni 2020 - Software Developer",
  quote: "Berkat pendidikan di sini, karir saya berkembang.",
  type: "ALUMNI",
  image: null,
  order: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/cms/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/cms/testimonials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns testimonials", async () => {
    vi.mocked(getTestimonials).mockResolvedValue([mockTestimonial]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("testimonial-1");
  });

  it("returns 500 on service error", async () => {
    vi.mocked(getTestimonials).mockRejectedValue(new Error("db down"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe("POST /api/cms/testimonials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a testimonial with valid data", async () => {
    vi.mocked(createTestimonial).mockResolvedValue(mockTestimonial);

    const response = await POST(
      buildRequest({
        name: "Rizki Ananda",
        role: "Alumni 2020 - Software Developer",
        quote: "Berkat pendidikan di sini, karir saya berkembang.",
        type: "ALUMNI",
        image: null,
        order: 0,
        isActive: true,
      }),
    );

    expect(response.status).toBe(201);
    expect(createTestimonial).toHaveBeenCalledWith({
      name: "Rizki Ananda",
      role: "Alumni 2020 - Software Developer",
      quote: "Berkat pendidikan di sini, karir saya berkembang.",
      type: "ALUMNI",
      image: null,
      order: 0,
      isActive: true,
    });
  });

  it("returns 400 for invalid data", async () => {
    const response = await POST(
      buildRequest({
        name: "",
        role: "",
        quote: "",
        type: "INVALID",
        order: 0,
        isActive: true,
      }),
    );

    expect(response.status).toBe(400);
    expect(createTestimonial).not.toHaveBeenCalled();
  });
});
