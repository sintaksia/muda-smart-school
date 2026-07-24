import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { createJadwal } from "@/src/features/attendance/services/schedule";
import { jadwalSchema } from "./JadwalSchema";

// GET /api/attendance/jadwal - active timetable
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const jadwal = await prisma.jadwal.findMany({
      where: { isActive: true },
      include: {
        kelas: { select: { id: true, name: true } },
        mataPelajaran: { select: { id: true, name: true } },
        guru: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
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

// POST /api/attendance/jadwal - create with Process 0 validation
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = jadwalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { jadwal, errors, warnings } = await createJadwal(result.data);
    if (!jadwal) {
      return NextResponse.json(
        { error: errors.join("; "), errors },
        {
          status: 400,
        },
      );
    }
    return NextResponse.json({ jadwal, warnings }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create jadwal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
