import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { authorizeSessionAccess } from "@/src/features/attendance/services/sessionAccess";
import {
  closeSession,
  refreshQrToken,
} from "@/src/features/attendance/services/session";
import { markManualAttendance } from "@/src/features/attendance/services/scan";
import { ATTENDANCE_STATUS_VALUES } from "@/src/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("close") }),
  z.object({ action: z.literal("refresh-qr") }),
  z.object({
    action: z.literal("manual-attendance"),
    studentId: z.string().min(1),
    status: z.enum(
      ATTENDANCE_STATUS_VALUES as [
        "PRESENT",
        "LATE",
        "EXCUSED",
        "SICK",
        "ABSENT",
      ],
      { message: "Status tidak valid" },
    ),
    catatan: z.string().optional(),
  }),
]);

// GET /api/attendance/sessions/[id] - live session view (Process 2)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeSessionAccess(id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        schedule: {
          include: {
            schoolClass: {
              include: {
                students: {
                  where: { status: "ACTIVE" },
                  include: { user: { select: { name: true } } },
                  orderBy: { nis: "asc" },
                },
              },
            },
            subject: { select: { name: true } },
          },
        },
        studentAttendance: true,
      },
    });
    if (!session) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(session);
  } catch (err: unknown) {
    console.error("Get session error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH /api/attendance/sessions/[id] - close / refresh QR / manual mark
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeSessionAccess(id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    if (result.data.action === "close") {
      const { session, error } = await closeSession(id);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
      return NextResponse.json(session);
    }

    if (result.data.action === "refresh-qr") {
      const session = await refreshQrToken(id);
      if (!session) {
        return NextResponse.json(
          { error: "Sesi tidak aktif" },
          { status: 400 },
        );
      }
      return NextResponse.json(session);
    }

    const { record, error } = await markManualAttendance(
      id,
      result.data.studentId,
      result.data.status,
      result.data.catatan,
    );
    if (error && !record) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json(record);
  } catch (err: unknown) {
    console.error("Patch session error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
