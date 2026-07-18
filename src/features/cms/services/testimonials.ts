import { prisma } from "@/src/lib/prisma";
import type { TestimonialType } from "@prisma/client";

export interface CreateTestimonialInput {
  name: string;
  role: string;
  quote: string;
  type: TestimonialType;
  image?: string | null;
  order?: number;
  isActive?: boolean;
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getActiveTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function createTestimonial(data: CreateTestimonialInput) {
  return prisma.testimonial.create({ data });
}

export async function updateTestimonial(
  id: string,
  data: UpdateTestimonialInput,
) {
  return prisma.testimonial.update({ where: { id }, data });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

export async function toggleTestimonialStatus(id: string, isActive: boolean) {
  return prisma.testimonial.update({
    where: { id },
    data: { isActive },
  });
}

export type { Testimonial } from "@prisma/client";
