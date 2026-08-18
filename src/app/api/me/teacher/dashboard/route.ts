import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireTeacher } from "@/src/features/auth/utils/api-auth";
import { dateOnlyUtc, toWibParts } from "@/src/features/attendance/utils/time";

// GET /api/me/teacher/dashboard - today's teaching slots for the caller,
// each with its session state so the app can show "open" vs "resume" vs
// "closed". Mirrors src/app/guru/page.tsx.
export async function GET() {
  try {
    const auth = await requireTeacher();
    if ("response" in auth) return auth.response;
    const { teacher } = auth;

    // The school day is defined in WIB, not the server's timezone.
    const { dateISO, dayOfWeek } = toWibParts(new Date());

    const schedules = await prisma.schedule.findMany({
      where: { dayOfWeek, isActive: true, teacherId: teacher.id },
      include: {
        schoolClass: { select: { name: true } },
        subject: { select: { name: true } },
        sessions: { where: { date: dateOnlyUtc(dateISO) } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({
      data: {
        date: dateISO,
        dayOfWeek,
        items: schedules.map((row) => ({
          scheduleId: row.id,
          startTime: row.startTime,
          endTime: row.endTime,
          className: row.schoolClass.name,
          subjectName: row.subject.name,
          // At most one session exists per schedule per date (@@unique).
          sessionId: row.sessions[0]?.id ?? null,
          sessionStatus: row.sessions[0]?.status ?? null,
        })),
      },
    });
  } catch (err: unknown) {
    console.error("Teacher dashboard error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
