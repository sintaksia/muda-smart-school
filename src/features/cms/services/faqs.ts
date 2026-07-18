import { prisma } from "@/src/lib/prisma";
import type { Faq } from "@prisma/client";

export type { Faq };

export async function getFaqs() {
  return prisma.faq.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getActiveFaqs() {
  return prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getFaqById(id: string) {
  return prisma.faq.findUnique({
    where: { id },
  });
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export async function createFaq(data: CreateFaqInput) {
  return prisma.faq.create({
    data,
  });
}

export interface UpdateFaqInput {
  question?: string;
  answer?: string;
  order?: number;
  isActive?: boolean;
}

export async function updateFaq(id: string, data: UpdateFaqInput) {
  return prisma.faq.update({
    where: { id },
    data,
  });
}

export async function deleteFaq(id: string) {
  return prisma.faq.delete({ where: { id } });
}

export async function toggleFaqStatus(id: string, isActive: boolean) {
  return prisma.faq.update({
    where: { id },
    data: { isActive },
  });
}
