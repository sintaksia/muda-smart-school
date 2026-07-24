import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { reportTeacherAbsence } from "@/src/features/attendance/services/teacher-attendance";

const reportSchema = z.object({
  teacherId: z.string().min(1).optional(), // teachers self-report; admin passes it
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal tidak valid" }),
  status: z.enum(["EXCUSED", "SICK", "ABSENT"], {
    message: "Status wajib dipilih",
  }),
  note: z.string().optional(),
  scheduleIds: z.array(z.string()).optional(),
});

// GET /api/attendance/teacher-absence?date=YYYY-MM-DD - admin recap
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const where = date ? { date: new Date(`${date}T00:00:00.000Z`) } : {};

    const records = await prisma.teacherAttendance.findMany({
      where,
      include: {
        guru: { select: { id: true, user: { select: { name: true } } } },
        substituteGuru: {
          select: { id: true, user: { select: { name: true } } },
        },
        jadwal: {
          select: {
            startTime: true,
            endTime: true,
            kelas: { select: { name: true } },
            mataPelajaran: { select: { name: true } },
          },
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(records);
  } catch (err: unknown) {
    console.error("List teacher absence error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/teacher-absence - report absence (Process 4)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = reportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    let teacherId = result.data.teacherId;
    if (!canAccessAdmin(currentUser.role)) {
      // Self-report path: teachers may only report themselves (not Alpa).
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (!guru || currentUser.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (result.data.status === "ABSENT") {
        return NextResponse.json(
          { error: "Status Alpa hanya dapat dicatat oleh Admin" },
          { status: 403 },
        );
      }
      teacherId = guru.id;
    } else if (!teacherId) {
      return NextResponse.json(
        { error: "guruId wajib diisi" },
        { status: 400 },
      );
    }

    const { records, error } = await reportTeacherAbsence({
      teacherId,
      date: result.data.date,
      status: result.data.status,
      note: result.data.note,
      reportedById: currentUser.id,
      scheduleIds: result.data.scheduleIds,
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json(records, { status: 201 });
  } catch (err: unknown) {
    console.error("Report teacher absence error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
