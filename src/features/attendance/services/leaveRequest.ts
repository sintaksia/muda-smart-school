import { prisma } from "@/src/lib/prisma";
import type { LeaveRequest } from "@prisma/client";
import type { SubmitLeaveRequestInput } from "../types";
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
export async function submitLeaveRequest(
  input: SubmitLeaveRequestInput,
): Promise<{ izin: LeaveRequest | null; error: string | null }> {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { user: { select: { name: true } } },
  });
  if (!student) {
    return { izin: null, error: "Siswa tidak ditemukan" };
  }

  const settings = await getAttendanceSettings();
  const izin = await prisma.leaveRequest.create({
    data: {
      studentId: input.studentId,
      type: input.type,
      date: dateOnlyUtc(input.date),
      scheduleId: input.scheduleId,
      reason: input.reason,
      attachment: input.attachment,
      submittedById: input.submittedById,
      status: settings.izinSakitApprovalRequired ? "PENDING" : "APPROVED",
    },
  });

  const waliUserId = await getWaliKelasUserId(student.classId);
  const reviewers = waliUserId ? [waliUserId] : await getAdminUserIds();
  await notifyUsers(reviewers, {
    title: "Pengajuan izin/sakit baru",
    body: `${student.user.name} mengajukan ${izin.type.toLowerCase()} untuk ${input.date}.`,
    type: "LEAVE_STATUS",
    refId: izin.id,
  });

  return { izin, error: null };
}

/**
 * Process 5 steps 4–6 — approval before close pre-sets attendance; approval
 * after an Alpa deduction triggers the Process 3 reversal rule; rejection
 * leaves the original record standing.
 */
export async function reviewLeaveRequest(
  izinId: string,
  decision: "APPROVED" | "REJECTED",
  reviewedById: string,
  reviewNote?: string,
): Promise<{ izin: LeaveRequest | null; error: string | null }> {
  const existing = await prisma.leaveRequest.findUnique({
    where: { id: izinId },
    include: { student: true },
  });
  if (!existing) {
    return { izin: null, error: "Pengajuan tidak ditemukan" };
  }
  if (existing.status !== "PENDING") {
    return { izin: existing, error: "Pengajuan sudah diproses" };
  }

  const izin = await prisma.leaveRequest.update({
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
    // sessions and reverse its deduction (audit-safe CORRECTION entry).
    const absentRecords = await prisma.studentAttendance.findMany({
      where: {
        studentId: existing.studentId,
        date: existing.date,
        status: "ABSENT",
        ...(existing.scheduleId ? { scheduleId: existing.scheduleId } : {}),
      },
    });
    for (const record of absentRecords) {
      await prisma.studentAttendance.update({
        where: { id: record.id },
        data: {
          status: existing.type === "SICK" ? "SICK" : "EXCUSED",
          note: "Izin/sakit disetujui setelah sesi ditutup",
        },
      });
      if (record.sessionId) {
        await reverseAutoDeduction(
          existing.studentId,
          record.sessionId,
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
        ? `Pengajuan ${existing.type.toLowerCase()} Anda telah disetujui.`
        : `Pengajuan ${existing.type.toLowerCase()} Anda ditolak.${reviewNote ? ` Alasan: ${reviewNote}` : ""}`,
    type: "LEAVE_STATUS",
    refId: izin.id,
  });

  return { izin, error: null };
}
