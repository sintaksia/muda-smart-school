import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireStudent } from "@/src/features/auth/utils/api-auth";
import { getCreditTotal } from "@/src/features/attendance/services/credit";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";
import { getStudentCard } from "@/src/features/master/services/studentCard";

const RECENT_ATTENDANCE_LIMIT = 20;
const RECENT_LEAVE_LIMIT = 10;

/** Dates are stored as UTC midnight; clients only need the calendar day. */
function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// GET /api/me/student/dashboard - everything the student home screen needs.
// Mirrors src/app/siswa/page.tsx, which assembles the same data server-side.
export async function GET() {
  try {
    const auth = await requireStudent();
    if ("response" in auth) return auth.response;
    const { student } = auth;

    const settings = await getAttendanceSettings();

    const [creditTotal, recentAttendance, recentLeaveRequests, card] =
      await Promise.all([
        getCreditTotal("STUDENT", student.id, settings),
        prisma.studentAttendance.findMany({
          where: { studentId: student.id },
          include: {
            schedule: { select: { subject: { select: { name: true } } } },
          },
          orderBy: { date: "desc" },
          take: RECENT_ATTENDANCE_LIMIT,
        }),
        prisma.leaveRequest.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: "desc" },
          take: RECENT_LEAVE_LIMIT,
        }),
        // In STUDENT_SCAN mode the student scans the teacher's QR, so there is
        // no card to render.
        settings.scanMode === "STUDENT_SCAN"
          ? Promise.resolve(null)
          : getStudentCard(student.id),
      ]);

    return NextResponse.json({
      data: {
        creditTotal,
        scanMode: settings.scanMode,
        card,
        recentAttendance: recentAttendance.map((record) => ({
          id: record.id,
          date: toDateOnly(record.date),
          subjectName: record.schedule.subject.name,
          status: record.status,
        })),
        recentLeaveRequests: recentLeaveRequests.map((leave) => ({
          id: leave.id,
          type: leave.type,
          date: toDateOnly(leave.date),
          reason: leave.reason,
          status: leave.status,
        })),
      },
    });
  } catch (err: unknown) {
    console.error("Student dashboard error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
