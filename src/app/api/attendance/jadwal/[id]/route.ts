import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  updateJadwal,
  deactivateJadwal,
} from "@/src/features/attendance/services/schedule";
import { jadwalSchema } from "../JadwalSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/attendance/jadwal/[id] - effective-dated update (new version)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const { jadwal, errors, warnings } = await updateJadwal(id, result.data);
    if (!jadwal) {
      return NextResponse.json(
        { error: errors.join("; "), errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ jadwal, warnings });
  } catch (err: unknown) {
    console.error("Update jadwal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE /api/attendance/jadwal/[id] - deactivate (history stays intact)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const jadwal = await deactivateJadwal(id);
    if (!jadwal) {
      return NextResponse.json(
        { error: "Jadwal tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(jadwal);
  } catch (err: unknown) {
    console.error("Deactivate jadwal error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
