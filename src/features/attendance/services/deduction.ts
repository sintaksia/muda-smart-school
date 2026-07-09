import { prisma } from "@/src/lib/prisma";
import { getAttendanceSettings } from "./settings";
import { createCreditEntry } from "./credit";

export interface DeductionSummary {
  processed: boolean;
  alpa: number;
  terlambat: number;
  izinSakit: number;
}

/** Idempotency guard (cross-cutting rule): one auto deduction per sesi+student. */
async function hasAutoDeduction(
  studentId: string,
  sesiId: string,
): Promise<boolean> {
  const existing = await prisma.creditScore.findFirst({
    where: {
      studentId,
      refSesiId: sesiId,
      source: "AUTO",
      type: "PELANGGARAN",
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
  sesiId: string,
): Promise<DeductionSummary> {
  const summary: DeductionSummary = {
    processed: false,
    alpa: 0,
    terlambat: 0,
    izinSakit: 0,
  };

  const sesi = await prisma.sesi.findUnique({
    where: { id: sesiId },
    include: {
      jadwal: {
        include: {
          kelas: {
            include: { students: { where: { status: "AKTIF" } } },
          },
        },
      },
      absensiSiswa: true,
    },
  });
  if (!sesi) {
    throw new Error("Sesi tidak ditemukan");
  }
  // Teacher absence ≠ student penalty: never deduct for a class that
  // didn't run.
  if (sesi.status === "KELAS_KOSONG") {
    return summary;
  }

  const settings = await getAttendanceSettings();
  const attendanceByStudent = new Map(
    sesi.absensiSiswa.map((record) => [record.studentId, record]),
  );

  for (const student of sesi.jadwal.kelas.students) {
    const record = attendanceByStudent.get(student.id);

    if (record?.status === "HADIR") {
      continue;
    }

    if (record?.status === "TERLAMBAT") {
      if (!(await hasAutoDeduction(student.id, sesi.id))) {
        await createCreditEntry({
          ownerType: "STUDENT",
          studentId: student.id,
          type: "PELANGGARAN",
          category: "Kedisiplinan",
          points: settings.creditPoints.terlambatStudent,
          note: "Terlambat (otomatis)",
          source: "AUTO",
          refSesiId: sesi.id,
        });
        summary.terlambat += 1;
      }
      continue;
    }

    if (record) {
      // IZIN / SAKIT / ALPHA already recorded — no further action here.
      continue;
    }

    // No attendance record at all → pre-approved izin/sakit, else Alpa.
    const izin = await prisma.pengajuanIzin.findFirst({
      where: {
        studentId: student.id,
        status: "APPROVED",
        tanggal: sesi.tanggal,
        OR: [
          { jadwalId: null, sesiId: null },
          { jadwalId: sesi.jadwalId },
          { sesiId: sesi.id },
        ],
      },
    });

    if (izin) {
      await prisma.absensiSiswa.create({
        data: {
          jadwalId: sesi.jadwalId,
          studentId: student.id,
          sesiId: sesi.id,
          tanggal: sesi.tanggal,
          status: izin.jenis === "SAKIT" ? "SAKIT" : "IZIN",
          catatan: "Izin/sakit disetujui sebelum sesi ditutup",
          method: "MANUAL",
        },
      });
      summary.izinSakit += 1;
      continue;
    }

    await prisma.absensiSiswa.create({
      data: {
        jadwalId: sesi.jadwalId,
        studentId: student.id,
        sesiId: sesi.id,
        tanggal: sesi.tanggal,
        status: "ALPHA",
        method: "MANUAL",
      },
    });
    if (!(await hasAutoDeduction(student.id, sesi.id))) {
      await createCreditEntry({
        ownerType: "STUDENT",
        studentId: student.id,
        type: "PELANGGARAN",
        category: "Kedisiplinan",
        points: settings.creditPoints.alpaStudent,
        note: "Alpa (otomatis)",
        source: "AUTO",
        refSesiId: sesi.id,
      });
    }
    summary.alpa += 1;
  }

  summary.processed = true;
  return summary;
}
