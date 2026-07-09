import { prisma } from "@/src/lib/prisma";
import type { Notification, NotificationType } from "@prisma/client";

export interface NotificationInput {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  refId?: string;
  channel?: string;
}

/**
 * Process 7 — every notification is persisted (who, when, what triggered
 * it) for audit purposes. Never fire-and-forget.
 */
export async function createNotification(
  input: NotificationInput,
): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      refId: input.refId,
      channel: input.channel ?? "IN_APP",
    },
  });
}

export async function notifyUsers(
  userIds: string[],
  payload: Omit<NotificationInput, "userId">,
): Promise<number> {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueIds.length === 0) {
    return 0;
  }
  const result = await prisma.notification.createMany({
    data: uniqueIds.map((userId) => ({
      userId,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      refId: payload.refId,
      channel: payload.channel ?? "IN_APP",
    })),
  });
  return result.count;
}

/** Admin/TU recipients (ADMIN + SUPER_ADMIN). */
export async function getAdminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, status: "ACTIVE" },
    select: { id: true },
  });
  return admins.map((admin) => admin.id);
}

/** Kepala Sekolah / Wakasek recipients (mapped to SUPER_ADMIN). */
export async function getKepsekUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN", status: "ACTIVE" },
    select: { id: true },
  });
  return users.map((user) => user.id);
}

/** User id of a class's wali kelas, if assigned. */
export async function getWaliKelasUserId(
  kelasId: string | null,
): Promise<string | null> {
  if (!kelasId) {
    return null;
  }
  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    select: { waliKelas: { select: { userId: true } } },
  });
  return kelas?.waliKelas?.userId ?? null;
}

export async function getUnreadNotifications(
  userId: string,
): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: { userId, readAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(
  id: string,
  userId: string,
): Promise<Notification | null> {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    return null;
  }
  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}
