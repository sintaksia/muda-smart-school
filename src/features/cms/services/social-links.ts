import { prisma } from "@/src/lib/prisma";
import type { SocialLink, SocialPlatform } from "@prisma/client";

export type { SocialLink };

export async function getSocialLinks() {
  return prisma.socialLink.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getActiveSocialLinks() {
  return prisma.socialLink.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getSocialLinkById(id: string) {
  return prisma.socialLink.findUnique({
    where: { id },
  });
}

export interface CreateSocialLinkInput {
  platform: SocialPlatform;
  url: string;
  username?: string | undefined;
  order?: number;
  isActive?: boolean;
}

export async function createSocialLink(data: CreateSocialLinkInput) {
  return prisma.socialLink.create({
    data,
  });
}

export interface UpdateSocialLinkInput {
  platform?: SocialPlatform;
  url?: string;
  username?: string | null;
  order?: number;
  isActive?: boolean;
}

export async function updateSocialLink(
  id: string,
  data: UpdateSocialLinkInput,
) {
  return prisma.socialLink.update({
    where: { id },
    data,
  });
}

export async function deleteSocialLink(id: string) {
  return prisma.socialLink.delete({
    where: { id },
  });
}

export async function toggleSocialLinkStatus(id: string, isActive: boolean) {
  return prisma.socialLink.update({
    where: { id },
    data: { isActive },
  });
}
