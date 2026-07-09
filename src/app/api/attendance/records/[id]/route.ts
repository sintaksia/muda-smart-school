import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { overrideAttendance } from "@/src/features/attendance/services/scan";
import { ABSENSI_STATUS_VALUES } from "@/src/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const overrideSchema = z.object({
  status: z
    .enum(
      ABSENSI_STATUS_VALUES as ["HADIR", "TERLAMBAT", "IZIN", "SAKIT", "ALPHA"],
      { message: "Status tidak valid" },
    )
    .optional(),
  catatan: z.string().optional(),
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
      const guru = await prisma.guru.findUnique({
        where: { userId: currentUser.id },
      });
      const record = await prisma.absensiSiswa.findUnique({
        where: { id },
        include: { jadwal: { select: { guruId: true } }, sesi: true },
      });
      if (!record) {
        return NextResponse.json(
          { error: "Data tidak ditemukan" },
          { status: 404 },
        );
      }
      const isSessionTeacher =
        guru &&
        (record.jadwal.guruId === guru.id ||
          record.sesi?.actualGuruId === guru.id);
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
