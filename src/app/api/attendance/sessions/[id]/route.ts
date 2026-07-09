import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  closeSession,
  refreshQrToken,
} from "@/src/features/attendance/services/session";
import { markManualAttendance } from "@/src/features/attendance/services/scan";
import { ABSENSI_STATUS_VALUES } from "@/src/lib/constants";

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
      ABSENSI_STATUS_VALUES as ["HADIR", "TERLAMBAT", "IZIN", "SAKIT", "ALPHA"],
      { message: "Status tidak valid" },
    ),
    catatan: z.string().optional(),
  }),
]);

async function authorizeSessionAccess(
  sesiId: string,
): Promise<{ status: number; error?: string }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { status: 401, error: "Unauthorized" };
  }
  if (canAccessAdmin(currentUser.role)) {
    return { status: 200 };
  }
  const guru = await prisma.guru.findUnique({
    where: { userId: currentUser.id },
  });
  if (!guru) {
    return { status: 403, error: "Unauthorized" };
  }
  const sesi = await prisma.sesi.findUnique({
    where: { id: sesiId },
    include: { jadwal: { select: { guruId: true } } },
  });
  if (!sesi) {
    return { status: 404, error: "Sesi tidak ditemukan" };
  }
  const isOwner =
    sesi.jadwal.guruId === guru.id || sesi.actualGuruId === guru.id;
  return isOwner ? { status: 200 } : { status: 403, error: "Unauthorized" };
}

// GET /api/attendance/sessions/[id] - live session view (Process 2)
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeSessionAccess(id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const sesi = await prisma.sesi.findUnique({
      where: { id },
      include: {
        jadwal: {
          include: {
            kelas: {
              include: {
                students: {
                  where: { status: "AKTIF" },
                  include: { user: { select: { name: true } } },
                  orderBy: { nis: "asc" },
                },
              },
            },
            mataPelajaran: { select: { nama: true } },
          },
        },
        absensiSiswa: true,
      },
    });
    if (!sesi) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(sesi);
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
      const { sesi, error } = await closeSession(id);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
      return NextResponse.json(sesi);
    }

    if (result.data.action === "refresh-qr") {
      const sesi = await refreshQrToken(id);
      if (!sesi) {
        return NextResponse.json(
          { error: "Sesi tidak aktif" },
          { status: 400 },
        );
      }
      return NextResponse.json(sesi);
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
