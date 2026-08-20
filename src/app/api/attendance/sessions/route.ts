import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { openSession } from "@/src/features/attendance/services/session";
import { toWibParts, dateOnlyUtc } from "@/src/features/attendance/utils/time";

const openSessionSchema = z.object({
  scheduleId: z.string({ message: "Jadwal wajib dipilih" }).min(1),
});

// GET /api/attendance/sessions - today's schedule entries + session state
// for the logged-in teacher (or all classes for admins)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dateISO, dayOfWeek } = toWibParts(new Date());

    let teacherFilter: { teacherId?: string } = {};
    if (!canAccessAdmin(currentUser.role)) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (!teacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      teacherFilter = { teacherId: teacher.id };
    }

    const jadwal = await prisma.schedule.findMany({
      where: { dayOfWeek, isActive: true, ...teacherFilter },
      include: {
        schoolClass: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
        sessions: { where: { date: dateOnlyUtc(dateISO) } },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ date: dateISO, jadwal });
  } catch (err: unknown) {
    console.error("List sessions error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/sessions - open a session (Process 1)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = openSessionSchema.safeParse(body);
    if (!result.success) {
      console.warn("Open session validation failed:", result.error.flatten());
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: currentUser.id },
    });

    if (!canAccessAdmin(currentUser.role)) {
      if (!teacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const schedule = await prisma.schedule.findUnique({
        where: { id: result.data.scheduleId },
      });
      if (!schedule) {
        return NextResponse.json(
          { error: "Jadwal tidak ditemukan" },
          { status: 404 },
        );
      }
      // The scheduled teacher — or the assigned substitute — may open.
      if (schedule.teacherId !== teacher.id) {
        const substitution = await prisma.teacherAttendance.findFirst({
          where: {
            scheduleId: schedule.id,
            date: dateOnlyUtc(toWibParts(new Date()).dateISO),
            substituteTeacherId: teacher.id,
          },
        });
        if (!substitution) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }
    }

    const { session, error } = await openSession(result.data.scheduleId, {
      byTeacherId: teacher?.id,
    });
    if (error || !session) {
      return NextResponse.json(
        { error: error ?? "Gagal membuka sesi", sesi: session },
        { status: 400 },
      );
    }
    return NextResponse.json(session, { status: 201 });
  } catch (err: unknown) {
    console.error("Open session error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
