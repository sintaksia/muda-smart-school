import { prisma } from "@/src/lib/prisma";
import type {
  CreditEntryType,
  CreditOwnerType,
  CreditScore,
  CreditSource,
} from "@prisma/client";
import type { AttendanceSettings, ManualCreditInput } from "../types";
import { getAttendanceSettings } from "./settings";
import {
  getKepsekUserIds,
  getWaliKelasUserId,
  getAdminUserIds,
  notifyUsers,
} from "./notifications";

export interface CreditEntryInput {
  ownerType: CreditOwnerType;
  studentId?: string;
  guruId?: string;
  type: CreditEntryType;
  category: string;
  points: number;
  note?: string;
  evidence?: string;
  source: CreditSource;
  refSesiId?: string;
  reportedById?: string;
}

/** Running total = configurable base + sum of all entry points. */
export async function getCreditTotal(
  ownerType: CreditOwnerType,
  ownerId: string,
  settings?: AttendanceSettings,
): Promise<number> {
  const resolved = settings ?? (await getAttendanceSettings());
  const where =
    ownerType === "STUDENT"
      ? { ownerType, studentId: ownerId }
      : { ownerType, guruId: ownerId };
  const aggregate = await prisma.creditScore.aggregate({
    where,
    _sum: { points: true },
  });
  return resolved.creditScoreBase + (aggregate._sum.points ?? 0);
}

/**
 * Process 7 — fire threshold notifications only when the score crosses a
 * threshold with this entry (not on every entry below it).
 */
async function checkThresholds(
  ownerType: CreditOwnerType,
  ownerId: string,
  totalBefore: number,
  totalAfter: number,
  settings: AttendanceSettings,
  refId?: string,
): Promise<void> {
  const { creditScoreThresholdWarning, creditScoreThresholdCritical } =
    settings;
  const crossedWarning =
    totalAfter <= creditScoreThresholdWarning &&
    totalBefore > creditScoreThresholdWarning;
  const crossedCritical =
    totalAfter <= creditScoreThresholdCritical &&
    totalBefore > creditScoreThresholdCritical;

  if (!crossedWarning && !crossedCritical) {
    return;
  }

  if (ownerType === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: ownerId },
      select: { kelasId: true, userId: true, user: { select: { name: true } } },
    });
    if (!student) {
      return;
    }
    const waliUserId = await getWaliKelasUserId(student.kelasId);
    if (crossedCritical) {
      // BK is mapped to ADMIN; parent notification goes to the student's
      // own account until a parent role exists (flagged in docs).
      const bkIds = await getAdminUserIds();
      await notifyUsers(
        [...(waliUserId ? [waliUserId] : []), ...bkIds, student.userId],
        {
          title: "Skor kredit kritis",
          body: `Skor kredit ${student.user.name} mencapai ${totalAfter} (ambang kritis ${creditScoreThresholdCritical}). Perlu tindak lanjut BK.`,
          type: "CREDIT_CRITICAL",
          refId,
        },
      );
    } else if (waliUserId) {
      await notifyUsers([waliUserId], {
        title: "Peringatan skor kredit",
        body: `Skor kredit ${student.user.name} mencapai ${totalAfter} (ambang peringatan ${creditScoreThresholdWarning}).`,
        type: "CREDIT_WARNING",
        refId,
      });
    }
    return;
  }

  const guru = await prisma.guru.findUnique({
    where: { id: ownerId },
    select: { user: { select: { name: true } } },
  });
  const kepsekIds = await getKepsekUserIds();
  await notifyUsers(kepsekIds, {
    title: crossedCritical
      ? "Skor kredit guru kritis"
      : "Peringatan skor kredit guru",
    body: `Skor kredit guru ${guru?.user.name ?? ownerId} mencapai ${totalAfter}.`,
    type: crossedCritical ? "CREDIT_CRITICAL" : "CREDIT_WARNING",
    refId,
  });
}

/**
 * Append-only write. CreditScore rows are immutable (cross-cutting rule);
 * corrections are new KOREKSI entries, never edits or deletes.
 */
export async function createCreditEntry(
  input: CreditEntryInput,
): Promise<CreditScore> {
  if (input.ownerType === "STUDENT" && !input.studentId) {
    throw new Error("studentId wajib untuk ownerType STUDENT");
  }
  if (input.ownerType === "TEACHER" && !input.guruId) {
    throw new Error("guruId wajib untuk ownerType TEACHER");
  }

  const settings = await getAttendanceSettings();
  const ownerId =
    input.ownerType === "STUDENT"
      ? (input.studentId as string)
      : (input.guruId as string);
  const totalBefore = await getCreditTotal(input.ownerType, ownerId, settings);

  const entry = await prisma.creditScore.create({
    data: {
      ownerType: input.ownerType,
      studentId: input.ownerType === "STUDENT" ? input.studentId : null,
      guruId: input.ownerType === "TEACHER" ? input.guruId : null,
      type: input.type,
      category: input.category,
      points: input.points,
      note: input.note,
      evidence: input.evidence,
      source: input.source,
      refSesiId: input.refSesiId,
      reportedById: input.reportedById,
    },
  });

  await checkThresholds(
    input.ownerType,
    ownerId,
    totalBefore,
    totalBefore + input.points,
    settings,
    entry.id,
  );

  return entry;
}

/** Process 6 — manual entry by Guru/BK (students) or Kepsek (teachers). */
export async function createManualCreditEntry(
  input: ManualCreditInput,
): Promise<CreditScore> {
  return createCreditEntry({
    ownerType: input.ownerType,
    studentId: input.ownerType === "STUDENT" ? input.ownerId : undefined,
    guruId: input.ownerType === "TEACHER" ? input.ownerId : undefined,
    type: input.type,
    category: input.category,
    points: input.points,
    note: input.note,
    evidence: input.evidence,
    source: "MANUAL",
    reportedById: input.reportedById,
  });
}

/**
 * Process 3 reversal rule — offset an auto deduction with a KOREKSI entry
 * (+points of the original), preserving the audit trail. Idempotent: a
 * second call for the same sesi/student is a no-op.
 */
export async function reverseAutoDeduction(
  studentId: string,
  sesiId: string,
  reportedById?: string,
): Promise<CreditScore | null> {
  const original = await prisma.creditScore.findFirst({
    where: {
      studentId,
      refSesiId: sesiId,
      source: "AUTO",
      type: "PELANGGARAN",
    },
  });
  if (!original) {
    return null;
  }
  const existingKoreksi = await prisma.creditScore.findFirst({
    where: { studentId, refSesiId: sesiId, type: "KOREKSI" },
  });
  if (existingKoreksi) {
    return null;
  }
  return createCreditEntry({
    ownerType: "STUDENT",
    studentId,
    type: "KOREKSI",
    category: original.category,
    points: -original.points,
    note: "Koreksi: izin/sakit disetujui setelah sesi ditutup",
    source: "AUTO",
    refSesiId: sesiId,
    reportedById,
  });
}
