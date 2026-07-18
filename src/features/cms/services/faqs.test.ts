import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  getFaqs,
  getActiveFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "./faqs";
import type { Faq } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    faq: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
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

describe("faqs service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getFaqs returns all faqs ordered by order", async () => {
    vi.mocked(prisma.faq.findMany).mockResolvedValue([mockFaq]);

    const result = await getFaqs();

    expect(result).toEqual([mockFaq]);
    expect(prisma.faq.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });

  it("getActiveFaqs filters by isActive", async () => {
    vi.mocked(prisma.faq.findMany).mockResolvedValue([mockFaq]);

    const result = await getActiveFaqs();

    expect(result).toEqual([mockFaq]);
    expect(prisma.faq.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  });

  it("getFaqById returns null when not found", async () => {
    vi.mocked(prisma.faq.findUnique).mockResolvedValue(null);

    const result = await getFaqById("missing");

    expect(result).toBeNull();
    expect(prisma.faq.findUnique).toHaveBeenCalledWith({
      where: { id: "missing" },
    });
  });

  it("createFaq creates a faq", async () => {
    vi.mocked(prisma.faq.create).mockResolvedValue(mockFaq);

    const result = await createFaq({
      question: mockFaq.question,
      answer: mockFaq.answer,
    });

    expect(result).toEqual(mockFaq);
    expect(prisma.faq.create).toHaveBeenCalledWith({
      data: { question: mockFaq.question, answer: mockFaq.answer },
    });
  });

  it("updateFaq updates by id", async () => {
    vi.mocked(prisma.faq.update).mockResolvedValue(mockFaq);

    await updateFaq("faq-1", { question: "Updated?" });

    expect(prisma.faq.update).toHaveBeenCalledWith({
      where: { id: "faq-1" },
      data: { question: "Updated?" },
    });
  });

  it("deleteFaq deletes by id", async () => {
    vi.mocked(prisma.faq.delete).mockResolvedValue(mockFaq);

    await deleteFaq("faq-1");

    expect(prisma.faq.delete).toHaveBeenCalledWith({ where: { id: "faq-1" } });
  });

  it("toggleFaqStatus updates isActive", async () => {
    vi.mocked(prisma.faq.update).mockResolvedValue({
      ...mockFaq,
      isActive: false,
    });

    await toggleFaqStatus("faq-1", false);

    expect(prisma.faq.update).toHaveBeenCalledWith({
      where: { id: "faq-1" },
      data: { isActive: false },
    });
  });

  it("propagates errors from prisma", async () => {
    vi.mocked(prisma.faq.findMany).mockRejectedValue(new Error("db down"));

    await expect(getFaqs()).rejects.toThrow("db down");
  });
});
