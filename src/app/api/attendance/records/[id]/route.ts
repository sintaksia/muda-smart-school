import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  deleteAttendance,
  overrideAttendance,
} from "@/src/features/attendance/services/scan";
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

/**
 * Admins may touch any record; a teacher only the records of a session they
 * own. Returns the response to send back when access is refused.
 */
async function denyRecordAccess(id: string): Promise<NextResponse | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (canAccessAdmin(currentUser.role)) {
    return null;
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: currentUser.id },
  });
  const record = await prisma.studentAttendance.findUnique({
    where: { id },
    include: { schedule: { select: { teacherId: true } }, session: true },
  });
  if (!record) {
    return NextResponse.json(
      { error: "Data tidak ditemukan" },
      { status: 404 },
    );
  }
  const isSessionTeacher =
    teacher &&
    (record.schedule.teacherId === teacher.id ||
      record.session?.actualTeacherId === teacher.id);
  if (!isSessionTeacher) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

// PATCH /api/attendance/records/[id] - teacher reconciliation override
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const denied = await denyRecordAccess(id);
    if (denied) {
      return denied;
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

// DELETE /api/attendance/records/[id] - remove a mis-scanned record
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const denied = await denyRecordAccess(id);
    if (denied) {
      return denied;
    }

    const removed = await deleteAttendance(id);
    if (!removed) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Delete attendance error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
