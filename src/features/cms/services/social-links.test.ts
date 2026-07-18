import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  getSocialLinks,
  getActiveSocialLinks,
  getSocialLinkById,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  toggleSocialLinkStatus,
} from "./social-links";
import type { SocialLink } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    socialLink: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockSocialLink: SocialLink = {
  id: "social-1",
  platform: "INSTAGRAM",
  url: "https://instagram.com/smkmuda2cibiru",
  username: "@smkmuda2cibiru",
  order: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("social-links service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSocialLinks returns all social links ordered by order", async () => {
    vi.mocked(prisma.socialLink.findMany).mockResolvedValue([mockSocialLink]);

    const result = await getSocialLinks();

    expect(result).toEqual([mockSocialLink]);
    expect(prisma.socialLink.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });

  it("getActiveSocialLinks filters by isActive", async () => {
    vi.mocked(prisma.socialLink.findMany).mockResolvedValue([mockSocialLink]);

    const result = await getActiveSocialLinks();

    expect(result).toEqual([mockSocialLink]);
    expect(prisma.socialLink.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  });

  it("getSocialLinkById returns null when not found", async () => {
    vi.mocked(prisma.socialLink.findUnique).mockResolvedValue(null);

    const result = await getSocialLinkById("missing");

    expect(result).toBeNull();
    expect(prisma.socialLink.findUnique).toHaveBeenCalledWith({
      where: { id: "missing" },
    });
  });

  it("createSocialLink creates a social link", async () => {
    vi.mocked(prisma.socialLink.create).mockResolvedValue(mockSocialLink);

    const result = await createSocialLink({
      platform: "INSTAGRAM",
      url: mockSocialLink.url,
      username: mockSocialLink.username ?? undefined,
    });

    expect(result).toEqual(mockSocialLink);
    expect(prisma.socialLink.create).toHaveBeenCalledWith({
      data: {
        platform: "INSTAGRAM",
        url: mockSocialLink.url,
        username: mockSocialLink.username,
      },
    });
  });

  it("updateSocialLink updates by id", async () => {
    vi.mocked(prisma.socialLink.update).mockResolvedValue(mockSocialLink);

    await updateSocialLink("social-1", { url: "https://instagram.com/new" });

    expect(prisma.socialLink.update).toHaveBeenCalledWith({
      where: { id: "social-1" },
      data: { url: "https://instagram.com/new" },
    });
  });

  it("deleteSocialLink deletes by id", async () => {
    vi.mocked(prisma.socialLink.delete).mockResolvedValue(mockSocialLink);

    await deleteSocialLink("social-1");

    expect(prisma.socialLink.delete).toHaveBeenCalledWith({
      where: { id: "social-1" },
    });
  });

  it("toggleSocialLinkStatus updates isActive", async () => {
    vi.mocked(prisma.socialLink.update).mockResolvedValue({
      ...mockSocialLink,
      isActive: false,
    });

    await toggleSocialLinkStatus("social-1", false);

    expect(prisma.socialLink.update).toHaveBeenCalledWith({
      where: { id: "social-1" },
      data: { isActive: false },
    });
  });

  it("propagates errors from prisma", async () => {
    vi.mocked(prisma.socialLink.findMany).mockRejectedValue(
      new Error("db down"),
    );

    await expect(getSocialLinks()).rejects.toThrow("db down");
  });
});
