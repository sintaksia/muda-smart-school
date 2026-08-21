import { prisma } from "@/src/lib/prisma";
import type { Student } from "@prisma/client";
import type { CardScanInput, CardScanResult } from "../types";
import { getAttendanceSettings } from "./settings";
import { resolveScanStatus } from "./scan";

/**
 * Process 2b — the teacher scans a student's ID card. The mirror of
 * `recordScan`: same validation order and the same lateness rule, but the
 * trusted device is the teacher's, so there is no GPS check and nothing is
 * ever flagged for review.
 */
export async function recordCardScan(
  input: CardScanInput,
  now: Date = new Date(),
): Promise<CardScanResult> {
  const settings = await getAttendanceSettings();

  // 1. Session check
  const session = await prisma.session.findUnique({
    where: { id: input.sessionId },
    include: { schedule: true },
  });
  if (!session || session.status !== "OPEN") {
    return { ok: false, error: "Tidak ada sesi aktif" };
  }

  // 2. Mode check — the school may have card scanning switched off.
  if (settings.scanMode === "STUDENT_SCAN") {
    return {
      ok: false,
      error: "Mode presensi saat ini tidak mengizinkan scan kartu",
    };
  }

  // 3. Card lookup — by token from the QR, or by NIS when the card is at home.
  const student = await findStudent(input);
  if (!student) {
    return {
      ok: false,
      error: input.nis ? "NIS tidak ditemukan" : "Kartu tidak dikenal",
    };
  }

  // 4. Enrollment check
  if (
    student.status !== "ACTIVE" ||
    student.classId !== session.schedule.classId
  ) {
    return { ok: false, error: "Tidak terdaftar di kelas ini" };
  }

  const identity = {
    studentId: student.id,
    studentName: student.user.name,
    nis: student.nis,
  };

  // 5. Duplicate check — idempotent no-op, not an error.
  const existing = await prisma.studentAttendance.findUnique({
    where: {
      scheduleId_studentId_date: {
        scheduleId: session.scheduleId,
        studentId: student.id,
        date: session.date,
      },
    },
  });
  if (existing) {
    return {
      ok: true,
      duplicate: true,
      status: existing.status,
      ...identity,
    };
  }

  // 6. Time evaluation — same grace rule as the student-scan path.
  const status = resolveScanStatus(
    session.date,
    session.schedule.startTime,
    settings.sessionGracePeriodMinutes,
    now,
  );

  await prisma.studentAttendance.create({
    data: {
      scheduleId: session.scheduleId,
      studentId: student.id,
      sessionId: session.id,
      date: session.date,
      status,
      scanTime: now,
      method: "CARD",
    },
  });

  return { ok: true, duplicate: false, status, ...identity };
}

type StudentWithName = Pick<Student, "id" | "nis" | "classId" | "status"> & {
  user: { name: string };
};

async function findStudent(
  input: CardScanInput,
): Promise<StudentWithName | null> {
  const where = input.cardToken
    ? { cardToken: input.cardToken }
    : { nis: input.nis as string };

  return prisma.student.findUnique({
    where,
    select: {
      id: true,
      nis: true,
      classId: true,
      status: true,
      user: { select: { name: true } },
    },
  });
}
