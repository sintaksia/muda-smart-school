import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { submitLeaveRequest } from "@/src/features/attendance/services/leaveRequest";
import { LEAVE_TYPE_VALUES } from "@/src/lib/constants";

const submitSchema = z.object({
  studentId: z.string().min(1).optional(), // admins may submit on behalf
  type: z.enum(LEAVE_TYPE_VALUES as ["PERMISSION", "SICK"], {
    message: "Jenis wajib dipilih",
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal tidak valid" }),
  scheduleId: z.string().optional(),
  reason: z.string({ message: "Alasan wajib diisi" }).min(3),
  attachment: z.string().optional(),
});

// GET /api/attendance/leave-requests - list submissions (role-scoped)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where = {};
    if (currentUser.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      where = { studentId: student.id };
    } else if (!canAccessAdmin(currentUser.role)) {
      // Teacher: submissions from classes they are wali kelas of.
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
        include: { homeroomClasses: { select: { id: true } } },
      });
      if (!guru || guru.homeroomClasses.length === 0) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      where = {
        student: { classId: { in: guru.homeroomClasses.map((k) => k.id) } },
      };
    }

    const submissions = await prisma.leaveRequest.findMany({
      where,
      include: {
        student: {
          select: {
            nis: true,
            classId: true,
            user: { select: { name: true } },
            schoolClass: { select: { name: true } },
          },
        },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (err: unknown) {
    console.error("List izin error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/leave-requests - submit izin/sakit (Process 5)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    let studentId = result.data.studentId;
    if (currentUser.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      studentId = student.id;
    } else if (!studentId) {
      return NextResponse.json(
        { error: "studentId wajib diisi" },
        { status: 400 },
      );
    }

    const { izin, error } = await submitLeaveRequest({
      studentId,
      type: result.data.type,
      date: result.data.date,
      scheduleId: result.data.scheduleId,
      reason: result.data.reason,
      attachment: result.data.attachment,
      submittedById: currentUser.id,
    });
    if (error || !izin) {
      return NextResponse.json(
        { error: error ?? "Gagal mengajukan izin" },
        { status: 400 },
      );
    }
    return NextResponse.json(izin, { status: 201 });
  } catch (err: unknown) {
    console.error("Submit izin error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
