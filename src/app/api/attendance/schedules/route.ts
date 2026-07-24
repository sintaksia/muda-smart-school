import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { createSchedule } from "@/src/features/attendance/services/schedule";
import { scheduleSchema } from "./ScheduleSchema";

// GET /api/attendance/schedules - active timetable
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const jadwal = await prisma.schedule.findMany({
      where: { isActive: true },
      include: {
        schoolClass: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(jadwal);
  } catch (err: unknown) {
    console.error("List jadwal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/schedules - create with Process 0 validation
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = scheduleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { schedule, errors, warnings } = await createSchedule(result.data);
    if (!schedule) {
      return NextResponse.json(
        { error: errors.join("; "), errors },
        {
          status: 400,
        },
      );
    }
    return NextResponse.json({ jadwal: schedule, warnings }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create jadwal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
