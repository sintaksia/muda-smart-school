import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { updateClass, deleteClass } from "@/src/features/master/services/kelas";
import { kelasSchema } from "../KelasSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/master/kelas/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = kelasSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { schoolClass, error } = await updateClass(id, result.data);
    if (error || !schoolClass) {
      return NextResponse.json(
        { error: error ?? "Gagal memperbarui kelas" },
        { status: 400 },
      );
    }
    return NextResponse.json(schoolClass);
  } catch (err: unknown) {
    console.error("Update kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE /api/master/kelas/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { ok, error } = await deleteClass(id);
    if (!ok) {
      return NextResponse.json(
        { error: error ?? "Gagal menghapus kelas" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Delete kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
