import { prisma } from "@/src/lib/prisma";
import type { PengajuanIzin } from "@prisma/client";
import type { SubmitIzinInput } from "../types";
import { reverseAutoDeduction } from "./credit";
import {
  createNotification,
  getWaliKelasUserId,
  getAdminUserIds,
  notifyUsers,
} from "./notifications";
import { getAttendanceSettings } from "./settings";
import { dateOnlyUtc } from "../utils/time";

/**
 * Process 5 — izin/sakit submission by student or parent, before or during
 * a session. Routed to Wali Kelas (or Admin) while approval is required.
 */
export async function submitIzin(
  input: SubmitIzinInput,
): Promise<{ izin: PengajuanIzin | null; error: string | null }> {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { user: { select: { name: true } } },
  });
  if (!student) {
    return { izin: null, error: "Siswa tidak ditemukan" };
  }

  const settings = await getAttendanceSettings();
  const izin = await prisma.pengajuanIzin.create({
    data: {
      studentId: input.studentId,
      jenis: input.jenis,
      tanggal: dateOnlyUtc(input.tanggal),
      jadwalId: input.jadwalId,
      alasan: input.alasan,
      lampiran: input.lampiran,
      submittedById: input.submittedById,
      status: settings.izinSakitApprovalRequired ? "PENDING" : "APPROVED",
    },
  });

  const waliUserId = await getWaliKelasUserId(student.classId);
  const reviewers = waliUserId ? [waliUserId] : await getAdminUserIds();
  await notifyUsers(reviewers, {
    title: "Pengajuan izin/sakit baru",
    body: `${student.user.name} mengajukan ${izin.jenis.toLowerCase()} untuk ${input.tanggal}.`,
    type: "IZIN_STATUS",
    refId: izin.id,
  });

  return { izin, error: null };
}

/**
 * Process 5 steps 4–6 — approval before close pre-sets attendance; approval
 * after an Alpa deduction triggers the Process 3 reversal rule; rejection
 * leaves the original record standing.
 */
export async function reviewIzin(
  izinId: string,
  decision: "APPROVED" | "REJECTED",
  reviewedById: string,
  reviewNote?: string,
): Promise<{ izin: PengajuanIzin | null; error: string | null }> {
  const existing = await prisma.pengajuanIzin.findUnique({
    where: { id: izinId },
    include: { student: true },
  });
  if (!existing) {
    return { izin: null, error: "Pengajuan tidak ditemukan" };
  }
  if (existing.status !== "PENDING") {
    return { izin: existing, error: "Pengajuan sudah diproses" };
  }

  const izin = await prisma.pengajuanIzin.update({
    where: { id: izinId },
    data: {
      status: decision,
      reviewedById,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  if (decision === "APPROVED") {
    // Late approval: fix any Alpa already recorded for the covered
    // sessions and reverse its deduction (audit-safe KOREKSI entry).
    const alphaRecords = await prisma.absensiSiswa.findMany({
      where: {
        studentId: existing.studentId,
        tanggal: existing.tanggal,
        status: "ALPHA",
        ...(existing.jadwalId ? { jadwalId: existing.jadwalId } : {}),
      },
    });
    for (const record of alphaRecords) {
      await prisma.absensiSiswa.update({
        where: { id: record.id },
        data: {
          status: existing.jenis === "SAKIT" ? "SAKIT" : "IZIN",
          catatan: "Izin/sakit disetujui setelah sesi ditutup",
        },
      });
      if (record.sesiId) {
        await reverseAutoDeduction(
          existing.studentId,
          record.sesiId,
          reviewedById,
        );
      }
    }
  }

  await createNotification({
    userId: existing.student.userId,
    title:
      decision === "APPROVED"
        ? "Pengajuan izin disetujui"
        : "Pengajuan izin ditolak",
    body:
      decision === "APPROVED"
        ? `Pengajuan ${existing.jenis.toLowerCase()} Anda telah disetujui.`
        : `Pengajuan ${existing.jenis.toLowerCase()} Anda ditolak.${reviewNote ? ` Alasan: ${reviewNote}` : ""}`,
    type: "IZIN_STATUS",
    refId: izin.id,
  });

  return { izin, error: null };
}
