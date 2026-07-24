import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, PATCH, DELETE } from "./route";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "@/src/features/cms/services/testimonials";
import type { Testimonial } from "@prisma/client";

vi.mock("@/src/features/cms/services/testimonials", () => ({
  getTestimonialById: vi.fn(),
  updateTestimonial: vi.fn(),
  deleteTestimonial: vi.fn(),
  toggleTestimonialStatus: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/src/features/auth/utils/api-auth", () => ({
  requireCmsAccess: vi.fn().mockResolvedValue({
    user: { id: "admin-1", role: "ADMIN" },
  }),
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

const routeParams = { params: Promise.resolve({ id: "testimonial-1" }) };

function buildRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/cms/testimonials/testimonial-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/cms/testimonials/[id]", () => {
  it("returns the testimonial", async () => {
    vi.mocked(getTestimonialById).mockResolvedValue(mockTestimonial);

    const response = await GET(buildRequest("GET"), routeParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("testimonial-1");
  });

  it("returns 404 when not found", async () => {
    vi.mocked(getTestimonialById).mockResolvedValue(null);

    const response = await GET(buildRequest("GET"), routeParams);

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/cms/testimonials/[id]", () => {
  it("updates with valid data", async () => {
    vi.mocked(updateTestimonial).mockResolvedValue(mockTestimonial);

    const response = await PUT(
      buildRequest("PUT", {
        name: "Updated",
        role: "Guru Produktif",
        quote: "Updated quote.",
        type: "TEACHER",
        image: null,
        order: 1,
        isActive: false,
      }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(updateTestimonial).toHaveBeenCalledWith("testimonial-1", {
      name: "Updated",
      role: "Guru Produktif",
      quote: "Updated quote.",
      type: "TEACHER",
      image: null,
      order: 1,
      isActive: false,
    });
  });

  it("returns 400 for invalid data", async () => {
    const response = await PUT(
      buildRequest("PUT", { name: "", role: "", quote: "", order: 0 }),
      routeParams,
    );

    expect(response.status).toBe(400);
    expect(updateTestimonial).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/cms/testimonials/[id]", () => {
  it("toggles status", async () => {
    vi.mocked(toggleTestimonialStatus).mockResolvedValue({
      ...mockTestimonial,
      isActive: false,
    });

    const response = await PATCH(
      buildRequest("PATCH", { isActive: false }),
      routeParams,
    );

    expect(response.status).toBe(200);
    expect(toggleTestimonialStatus).toHaveBeenCalledWith(
      "testimonial-1",
      false,
    );
  });

  it("returns 400 when isActive is missing", async () => {
    const response = await PATCH(buildRequest("PATCH", {}), routeParams);

    expect(response.status).toBe(400);
    expect(toggleTestimonialStatus).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/cms/testimonials/[id]", () => {
  it("deletes the testimonial", async () => {
    vi.mocked(deleteTestimonial).mockResolvedValue(mockTestimonial);

    const response = await DELETE(buildRequest("DELETE"), routeParams);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteTestimonial).toHaveBeenCalledWith("testimonial-1");
  });

  it("returns 500 on service error", async () => {
    vi.mocked(deleteTestimonial).mockRejectedValue(new Error("db down"));

    const response = await DELETE(buildRequest("DELETE"), routeParams);

    expect(response.status).toBe(500);
  });
});
