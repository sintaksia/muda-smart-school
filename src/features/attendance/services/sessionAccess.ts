import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";

export interface SessionAccessResult {
  status: number;
  error?: string;
  /** Teacher record of the requester, absent for admins. */
  teacherId?: string;
}

/**
 * Who may read or act on a session: any admin, the scheduled teacher, or the
 * substitute who actually opened it. Shared by every session route so the rule
 * lives in one place.
 */
export async function authorizeSessionAccess(
  sessionId: string,
): Promise<SessionAccessResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { status: 401, error: "Unauthorized" };
  }
  if (canAccessAdmin(currentUser.role)) {
    return { status: 200 };
  }
  const teacher = await prisma.teacher.findUnique({
    where: { userId: currentUser.id },
  });
  if (!teacher) {
    return { status: 403, error: "Unauthorized" };
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { schedule: { select: { teacherId: true } } },
  });
  if (!session) {
    return { status: 404, error: "Sesi tidak ditemukan" };
  }
  const isOwner =
    session.schedule.teacherId === teacher.id ||
    session.actualTeacherId === teacher.id;
  return isOwner
    ? { status: 200, teacherId: teacher.id }
    : { status: 403, error: "Unauthorized" };
}
