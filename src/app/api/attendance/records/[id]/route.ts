import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { overrideAttendance } from "@/src/features/attendance/services/scan";
import { ATTENDANCE_STATUS_VALUES } from "@/src/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const overrideSchema = z.object({
  status: z
    .enum(
      ATTENDANCE_STATUS_VALUES as [
        "PRESENT",
        "LATE",
        "EXCUSED",
        "SICK",
        "ABSENT",
      ],
      { message: "Status tidak valid" },
    )
    .optional(),
  note: z.string().optional(),
  clearReview: z.boolean().optional(),
});

// PATCH /api/attendance/records/[id] - teacher reconciliation override
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canAccessAdmin(currentUser.role)) {
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      const record = await prisma.studentAttendance.findUnique({
        where: { id },
        include: { jadwal: { select: { teacherId: true } }, sesi: true },
      });
      if (!record) {
        return NextResponse.json(
          { error: "Data tidak ditemukan" },
          { status: 404 },
        );
      }
      const isSessionTeacher =
        guru &&
        (record.jadwal.teacherId === guru.id ||
          record.sesi?.actualTeacherId === guru.id);
      if (!isSessionTeacher) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const result = overrideSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await overrideAttendance(id, result.data);
    if (!updated) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("Override attendance error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
