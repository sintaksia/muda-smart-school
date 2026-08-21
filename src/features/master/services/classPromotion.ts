import { prisma } from "@/src/lib/prisma";
import type { Prisma, PromotionAction, StudentStatus } from "@prisma/client";
import {
  defaultPromotionAction,
  isAcademicYear,
  nextGradeLevel,
  suggestTargetClass,
} from "../utils/promotion";
import { activeAcademicYearUpsert } from "./academicYear";
import type {
  PromotionBatchRow,
  PromotionClassPreview,
  PromotionClassRef,
  PromotionEntryInput,
  PromotionInput,
  PromotionPreview,
  PromotionResult,
} from "../types";

/** A promotion touches every class at once, so give it more than the 5s default. */
const TRANSACTION_TIMEOUT_MS = 30_000;

interface ResolvedEntry {
  studentId: string;
  action: PromotionAction;
  classId: string | null;
  status: StudentStatus;
}

/**
 * Everything the admin needs to plan a promotion: each source class with its
 * active students, a suggested destination, and the destination year's classes
 * to choose from. Reads only — nothing is written until executePromotion.
 */
export async function getPromotionPreview(
  fromAcademicYear: string,
  toAcademicYear: string,
): Promise<PromotionPreview> {
  const [sourceClasses, targetClasses, unplaced] = await Promise.all([
    prisma.schoolClass.findMany({
      where: { academicYear: fromAcademicYear },
      select: {
        id: true,
        name: true,
        gradeLevel: true,
        specialization: true,
        students: {
          where: { status: "ACTIVE" },
          select: { id: true, nis: true, user: { select: { name: true } } },
          orderBy: { nis: "asc" },
        },
      },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    }),
    prisma.schoolClass.findMany({
      where: { academicYear: toAcademicYear },
      select: { id: true, name: true, gradeLevel: true, specialization: true },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    }),
    prisma.student.findMany({
      where: { status: "ACTIVE", classId: null },
      select: { id: true, nis: true, user: { select: { name: true } } },
      orderBy: { nis: "asc" },
    }),
  ]);

  const classes: PromotionClassPreview[] = sourceClasses.map((source) => {
    const targetGradeLevel = nextGradeLevel(source.gradeLevel);
    return {
      id: source.id,
      name: source.name,
      gradeLevel: source.gradeLevel,
      specialization: source.specialization,
      targetGradeLevel,
      suggestedClassId:
        targetGradeLevel === null
          ? null
          : suggestTargetClass(source, targetGradeLevel, targetClasses),
      students: source.students.map((student) => ({
        studentId: student.id,
        name: student.user.name,
        nis: student.nis,
        defaultAction: defaultPromotionAction(source.gradeLevel),
      })),
    };
  });

  return {
    fromAcademicYear,
    toAcademicYear,
    classes,
    targetClasses: targetClasses as PromotionClassRef[],
    unplacedStudents: unplaced.map((student) => ({
      studentId: student.id,
      name: student.user.name,
      nis: student.nis,
    })),
  };
}

/**
 * Turn one planned entry into the concrete class and status it produces.
 * Returns a message instead when the entry cannot be honoured — the caller
 * rejects the whole plan, since a half-applied promotion is worse than none.
 */
function resolveEntry(
  entry: PromotionEntryInput,
  targetClassIds: Set<string>,
  studentName: string,
): { resolved: ResolvedEntry | null; error: string | null } {
  if (entry.action === "GRADUATE" || entry.action === "EXIT") {
    return {
      resolved: {
        studentId: entry.studentId,
        action: entry.action,
        classId: null,
        status:
          entry.action === "GRADUATE"
            ? "GRADUATED"
            : (entry.exitStatus ?? "TRANSFERRED"),
      },
      error: null,
    };
  }

  if (!entry.targetClassId) {
    return { resolved: null, error: `${studentName}: kelas tujuan belum dipilih` };
  }
  if (!targetClassIds.has(entry.targetClassId)) {
    return {
      resolved: null,
      error: `${studentName}: kelas tujuan bukan milik tahun ajaran tujuan`,
    };
  }
  return {
    resolved: {
      studentId: entry.studentId,
      action: entry.action,
      classId: entry.targetClassId,
      status: "ACTIVE",
    },
    error: null,
  };
}

/**
 * Move every planned student into the destination year in one transaction.
 *
 * The plan arrives from the browser, so none of it is trusted: each student is
 * re-read and must still be active and sitting in a class of the source year,
 * and each destination class must belong to the destination year. Updates are
 * grouped by destination so a whole school costs a couple of dozen statements
 * rather than one per student.
 */
export async function executePromotion(
  input: PromotionInput,
  executedById: string,
): Promise<{ result: PromotionResult | null; error: string | null }> {
  const { fromAcademicYear, toAcademicYear, entries } = input;

  if (!isAcademicYear(fromAcademicYear) || !isAcademicYear(toAcademicYear)) {
    return { result: null, error: "Format tahun ajaran: 2026/2027" };
  }
  if (fromAcademicYear === toAcademicYear) {
    return { result: null, error: "Tahun ajaran tujuan harus berbeda" };
  }

  const studentIds = entries.map((entry) => entry.studentId);
  if (new Set(studentIds).size !== studentIds.length) {
    return { result: null, error: "Ada siswa yang tercantum lebih dari sekali" };
  }

  const [students, targetClasses, existingHistories] = await Promise.all([
    prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        classId: true,
        status: true,
        user: { select: { name: true } },
        schoolClass: { select: { academicYear: true } },
      },
    }),
    prisma.schoolClass.findMany({
      where: { academicYear: toAcademicYear },
      select: { id: true },
    }),
    prisma.studentClassHistory.findMany({
      where: { studentId: { in: studentIds }, academicYear: toAcademicYear },
      select: { studentId: true },
    }),
  ]);

  if (students.length !== studentIds.length) {
    return { result: null, error: "Ada siswa yang tidak ditemukan" };
  }
  if (existingHistories.length > 0) {
    return {
      result: null,
      error: `Sebagian siswa sudah dinaikkan ke ${toAcademicYear}. Batalkan proses sebelumnya lebih dulu.`,
    };
  }

  const studentById = new Map(students.map((student) => [student.id, student]));
  const targetClassIds = new Set(targetClasses.map((item) => item.id));
  const resolved: ResolvedEntry[] = [];

  for (const entry of entries) {
    const student = studentById.get(entry.studentId);
    if (!student) {
      return { result: null, error: "Ada siswa yang tidak ditemukan" };
    }
    const name = student.user.name;
    if (student.status !== "ACTIVE") {
      return { result: null, error: `${name}: bukan siswa aktif` };
    }
    if (student.schoolClass?.academicYear !== fromAcademicYear) {
      return {
        result: null,
        error: `${name}: tidak terdaftar di kelas tahun ajaran ${fromAcademicYear}`,
      };
    }
    const { resolved: item, error } = resolveEntry(entry, targetClassIds, name);
    if (error || !item) {
      return { result: null, error: error ?? "Rencana kenaikan tidak valid" };
    }
    resolved.push(item);
  }

  const counts: Record<PromotionAction, number> = {
    PROMOTE: 0,
    RETAIN: 0,
    GRADUATE: 0,
    EXIT: 0,
  };
  for (const item of resolved) {
    counts[item.action] += 1;
  }

  // One updateMany per distinct destination, instead of one update per student.
  const groups = new Map<string, { data: Prisma.StudentUncheckedUpdateManyInput; ids: string[] }>();
  for (const item of resolved) {
    const key = `${item.status}|${item.classId ?? ""}`;
    const group = groups.get(key);
    if (group) {
      group.ids.push(item.studentId);
      continue;
    }
    groups.set(key, {
      data: { status: item.status, classId: item.classId },
      ids: [item.studentId],
    });
  }

  const batchId = await prisma.$transaction(
    async (tx) => {
      const batch = await tx.promotionBatch.create({
        data: {
          fromAcademicYear,
          toAcademicYear,
          promotedCount: counts.PROMOTE,
          retainedCount: counts.RETAIN,
          graduatedCount: counts.GRADUATE,
          exitedCount: counts.EXIT,
          executedById,
        },
        select: { id: true },
      });

      // Snapshot the year being left, unless the backfill already wrote it.
      await tx.studentClassHistory.createMany({
        data: students.map((student) => ({
          studentId: student.id,
          classId: student.classId,
          academicYear: fromAcademicYear,
          status: student.status,
        })),
        skipDuplicates: true,
      });

      for (const group of groups.values()) {
        await tx.student.updateMany({
          where: { id: { in: group.ids } },
          data: group.data,
        });
      }

      await tx.studentClassHistory.createMany({
        data: resolved.map((item) => ({
          studentId: item.studentId,
          classId: item.classId,
          academicYear: toAcademicYear,
          status: item.status,
          action: item.action,
          batchId: batch.id,
        })),
      });

      await tx.schoolSetting.upsert(activeAcademicYearUpsert(toAcademicYear));
      return batch.id;
    },
    { timeout: TRANSACTION_TIMEOUT_MS },
  );

  return {
    result: {
      batchId,
      promoted: counts.PROMOTE,
      retained: counts.RETAIN,
      graduated: counts.GRADUATE,
      exited: counts.EXIT,
    },
    error: null,
  };
}

/**
 * Undo one promotion by restoring each student from their source-year history
 * row. Only the newest run can be undone, and only while it is the newest —
 * anything built on top of the new year (schedules, sessions, attendance) is
 * not rolled back, so this is a way out of a misclick, not a routine step.
 */
export async function revertPromotion(
  batchId: string,
): Promise<{ ok: boolean; error: string | null }> {
  const batch = await prisma.promotionBatch.findUnique({
    where: { id: batchId },
    select: { id: true, fromAcademicYear: true, revertedAt: true },
  });
  if (!batch) {
    return { ok: false, error: "Proses kenaikan tidak ditemukan" };
  }
  if (batch.revertedAt) {
    return { ok: false, error: "Proses kenaikan ini sudah dibatalkan" };
  }

  // Undoing an older run would restore students over a newer placement.
  const latest = await prisma.promotionBatch.findFirst({
    where: { revertedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (latest && latest.id !== batchId) {
    return {
      ok: false,
      error: "Hanya proses kenaikan terakhir yang dapat dibatalkan",
    };
  }

  const histories = await prisma.studentClassHistory.findMany({
    where: { batchId },
    select: { studentId: true },
  });
  if (histories.length === 0) {
    return { ok: false, error: "Tidak ada data siswa pada proses kenaikan ini" };
  }

  const studentIds = histories.map((history) => history.studentId);
  const previous = await prisma.studentClassHistory.findMany({
    where: {
      studentId: { in: studentIds },
      academicYear: batch.fromAcademicYear,
    },
    select: { studentId: true, classId: true, status: true },
  });
  if (previous.length !== studentIds.length) {
    return {
      ok: false,
      error: "Riwayat kelas sebelum kenaikan tidak lengkap — pembatalan dibatalkan",
    };
  }

  const groups = new Map<string, { data: Prisma.StudentUncheckedUpdateManyInput; ids: string[] }>();
  for (const row of previous) {
    const key = `${row.status}|${row.classId ?? ""}`;
    const group = groups.get(key);
    if (group) {
      group.ids.push(row.studentId);
      continue;
    }
    groups.set(key, {
      data: { status: row.status, classId: row.classId },
      ids: [row.studentId],
    });
  }

  await prisma.$transaction(
    async (tx) => {
      for (const group of groups.values()) {
        await tx.student.updateMany({
          where: { id: { in: group.ids } },
          data: group.data,
        });
      }
      await tx.studentClassHistory.deleteMany({ where: { batchId } });
      await tx.promotionBatch.update({
        where: { id: batchId },
        data: { revertedAt: new Date() },
      });
      await tx.schoolSetting.upsert(
        activeAcademicYearUpsert(batch.fromAcademicYear),
      );
    },
    { timeout: TRANSACTION_TIMEOUT_MS },
  );

  return { ok: true, error: null };
}

export async function getPromotionBatches(): Promise<PromotionBatchRow[]> {
  const batches = await prisma.promotionBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fromAcademicYear: true,
      toAcademicYear: true,
      promotedCount: true,
      retainedCount: true,
      graduatedCount: true,
      exitedCount: true,
      revertedAt: true,
      createdAt: true,
      executedBy: { select: { name: true } },
    },
  });
  return batches.map(({ executedBy, ...batch }) => ({
    ...batch,
    executedByName: executedBy?.name ?? null,
  }));
}
