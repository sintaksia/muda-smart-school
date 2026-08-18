import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";
import type { Prisma } from "@prisma/client";

// GET /api/me/schedule - the caller's own weekly timetable.
//
// Role-scoped: a student gets their class's timetable, a teacher gets the
// slots they teach. Deliberately distinct from GET /api/attendance/schedules,
// which returns the entire school's timetable to any authenticated user.
//
// Not paginated — a weekly timetable is inherently bounded.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where: Prisma.ScheduleWhereInput;

    if (user.role === "STUDENT") {
      const student = await getStudentByUserId(user.id);
      if (!student) {
        return NextResponse.json(
          { error: "Akun ini tidak terhubung ke data siswa" },
          { status: 403 },
        );
      }
      // A student not yet placed in a class has no timetable, not an error.
      if (!student.classId) {
        return NextResponse.json({ data: [] });
      }
      where = { isActive: true, classId: student.classId };
    } else if (user.role === "TEACHER") {
      const teacher = await getTeacherByUserId(user.id);
      if (!teacher) {
        return NextResponse.json(
          { error: "Akun ini tidak terhubung ke data guru" },
          { status: 403 },
        );
      }
      where = { isActive: true, teacherId: teacher.id };
    } else {
      // Admins have the full timetable at /api/attendance/schedules.
      return NextResponse.json(
        { error: "Endpoint ini hanya untuk siswa dan guru" },
        { status: 403 },
      );
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        schoolClass: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { user: { select: { name: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({
      data: schedules.map((row) => ({
        scheduleId: row.id,
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        className: row.schoolClass.name,
        subjectName: row.subject.name,
        teacherName: row.teacher.user.name,
      })),
    });
  } catch (err: unknown) {
    console.error("Me schedule error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
