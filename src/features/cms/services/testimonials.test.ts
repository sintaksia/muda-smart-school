import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  getTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "./testimonials";
import type { Testimonial } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    testimonial: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
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

describe("testimonials service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTestimonials returns all testimonials ordered by order", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([mockTestimonial]);

    const result = await getTestimonials();

    expect(result).toEqual([mockTestimonial]);
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });

  it("getActiveTestimonials filters by isActive", async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([mockTestimonial]);

    const result = await getActiveTestimonials();

    expect(result).toEqual([mockTestimonial]);
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  });

  it("getTestimonialById returns null when not found", async () => {
    vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(null);

    const result = await getTestimonialById("missing");

    expect(result).toBeNull();
    expect(prisma.testimonial.findUnique).toHaveBeenCalledWith({
      where: { id: "missing" },
    });
  });

  it("createTestimonial creates a testimonial", async () => {
    vi.mocked(prisma.testimonial.create).mockResolvedValue(mockTestimonial);

    const result = await createTestimonial({
      name: mockTestimonial.name,
      role: mockTestimonial.role,
      quote: mockTestimonial.quote,
      type: "ALUMNI",
    });

    expect(result).toEqual(mockTestimonial);
    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: {
        name: mockTestimonial.name,
        role: mockTestimonial.role,
        quote: mockTestimonial.quote,
        type: "ALUMNI",
      },
    });
  });

  it("updateTestimonial updates by id", async () => {
    vi.mocked(prisma.testimonial.update).mockResolvedValue(mockTestimonial);

    await updateTestimonial("testimonial-1", { name: "Updated" });

    expect(prisma.testimonial.update).toHaveBeenCalledWith({
      where: { id: "testimonial-1" },
      data: { name: "Updated" },
    });
  });

  it("deleteTestimonial deletes by id", async () => {
    vi.mocked(prisma.testimonial.delete).mockResolvedValue(mockTestimonial);

    await deleteTestimonial("testimonial-1");

    expect(prisma.testimonial.delete).toHaveBeenCalledWith({
      where: { id: "testimonial-1" },
    });
  });

  it("toggleTestimonialStatus updates isActive", async () => {
    vi.mocked(prisma.testimonial.update).mockResolvedValue({
      ...mockTestimonial,
      isActive: false,
    });

    await toggleTestimonialStatus("testimonial-1", false);

    expect(prisma.testimonial.update).toHaveBeenCalledWith({
      where: { id: "testimonial-1" },
      data: { isActive: false },
    });
  });

  it("propagates errors from prisma", async () => {
    vi.mocked(prisma.testimonial.findMany).mockRejectedValue(
      new Error("db down"),
    );

    await expect(getTestimonials()).rejects.toThrow("db down");
  });
});
