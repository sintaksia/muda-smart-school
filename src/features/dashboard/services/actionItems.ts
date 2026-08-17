import { prisma } from "@/src/lib/prisma";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";
import {
  EMPTY_ADMIN_ACTION_COUNTS,
  type AdminActionItemKey,
} from "../constants";

export type AdminActionCounts = Record<AdminActionItemKey, number>;

/**
 * Count students whose running credit score has reached the critical threshold.
 *
 * Uses one grouped aggregate rather than calling getCreditTotal() per student
 * (that would be N+1). Students with no entries at all sit at the base score,
 * which is above the threshold by definition, so they are correctly absent
 * from the grouped result.
 */
async function countCriticalCreditStudents(): Promise<number> {
  const [settings, grouped] = await Promise.all([
    getAttendanceSettings(),
    prisma.creditScore.groupBy({
      by: ["studentId"],
      where: { ownerType: "STUDENT", studentId: { not: null } },
      _sum: { points: true },
    }),
  ]);

  return grouped.filter(
    (row) =>
      settings.creditScoreBase + (row._sum.points ?? 0) <=
      settings.creditScoreThresholdCritical,
  ).length;
}

/**
 * Live counts for the admin dashboard action center — the work waiting on an
 * admin right now.
 *
 * Never throws: a failing query degrades to zeroes so one bad aggregate cannot
 * blank the whole dashboard card.
 */
export async function getAdminActionItems(): Promise<AdminActionCounts> {
  try {
    const [registrationPending, leavePending, creditCritical] =
      await Promise.all([
        prisma.registration.count({ where: { status: "PENDING" } }),
        prisma.leaveRequest.count({ where: { status: "PENDING" } }),
        countCriticalCreditStudents(),
      ]);

    return {
      REGISTRATION_PENDING: registrationPending,
      LEAVE_PENDING: leavePending,
      CREDIT_CRITICAL: creditCritical,
    };
  } catch (error: unknown) {
    console.error("[dashboard] gagal memuat item tindakan admin", error);
    return { ...EMPTY_ADMIN_ACTION_COUNTS };
  }
}
