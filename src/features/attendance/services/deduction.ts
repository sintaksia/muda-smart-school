import { prisma } from "@/src/lib/prisma";
import { getAttendanceSettings } from "./settings";
import { createCreditEntry } from "./credit";

export interface DeductionSummary {
  processed: boolean;
  alpa: number;
  terlambat: number;
  izinSakit: number;
}

/** Idempotency guard (cross-cutting rule): one auto deduction per session+student. */
async function hasAutoDeduction(
  studentId: string,
  sessionId: string,
): Promise<boolean> {
  const existing = await prisma.creditScore.findFirst({
    where: {
      studentId,
      refSessionId: sessionId,
      source: "AUTO",
      type: "VIOLATION",
    },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Process 3 — student credit auto-deduction, triggered when a session
 * closes. Safe to re-run: existing deductions are never duplicated.
 */
export async function processSessionDeductions(
  sessionId: string,
): Promise<DeductionSummary> {
  const summary: DeductionSummary = {
    processed: false,
    alpa: 0,
    terlambat: 0,
    izinSakit: 0,
  };

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      schedule: {
        include: {
          schoolClass: {
            include: { students: { where: { status: "ACTIVE" } } },
          },
        },
      },
      studentAttendance: true,
    },
  });
  if (!session) {
    throw new Error("Sesi tidak ditemukan");
  }
  // Teacher absence ≠ student penalty: never deduct for a class that
  // didn't run.
  if (session.status === "NO_CLASS") {
    return summary;
  }

  const settings = await getAttendanceSettings();
  const attendanceByStudent = new Map(
    session.studentAttendance.map((record) => [record.studentId, record]),
  );

  for (const student of session.schedule.schoolClass.students) {
    const record = attendanceByStudent.get(student.id);

    if (record?.status === "PRESENT") {
      continue;
    }

    if (record?.status === "LATE") {
      if (!(await hasAutoDeduction(student.id, session.id))) {
        await createCreditEntry({
          ownerType: "STUDENT",
          studentId: student.id,
          type: "VIOLATION",
          category: "Kedisiplinan",
          points: settings.creditPoints.terlambatStudent,
          note: "Terlambat (otomatis)",
          source: "AUTO",
          refSessionId: session.id,
        });
        summary.terlambat += 1;
      }
      continue;
    }

    if (record) {
      // EXCUSED / SICK / ABSENT already recorded — no further action here.
      continue;
    }

    // No attendance record at all → pre-approved izin/sakit, else Absent.
    const izin = await prisma.leaveRequest.findFirst({
      where: {
        studentId: student.id,
        status: "APPROVED",
        date: session.date,
        OR: [
          { scheduleId: null, sessionId: null },
          { scheduleId: session.scheduleId },
          { sessionId: session.id },
        ],
      },
    });

    if (izin) {
      await prisma.studentAttendance.create({
        data: {
          scheduleId: session.scheduleId,
          studentId: student.id,
          sessionId: session.id,
          date: session.date,
          status: izin.type === "SICK" ? "SICK" : "EXCUSED",
          note: "Izin/sakit disetujui sebelum sesi ditutup",
          method: "MANUAL",
        },
      });
      summary.izinSakit += 1;
      continue;
    }

    await prisma.studentAttendance.create({
      data: {
        scheduleId: session.scheduleId,
        studentId: student.id,
        sessionId: session.id,
        date: session.date,
        status: "ABSENT",
        method: "MANUAL",
      },
    });
    if (!(await hasAutoDeduction(student.id, session.id))) {
      await createCreditEntry({
        ownerType: "STUDENT",
        studentId: student.id,
        type: "VIOLATION",
        category: "Kedisiplinan",
        points: settings.creditPoints.alpaStudent,
        note: "Alpa (otomatis)",
        source: "AUTO",
        refSessionId: session.id,
      });
    }
    summary.alpa += 1;
  }

  summary.processed = true;
  return summary;
}
