import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { updateMapel, deleteMapel } from "@/src/features/master/services/mapel";
import { mapelSchema } from "../MapelSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/master/mapel/[id]
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = mapelSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { mapel, error } = await updateMapel(id, result.data);
    if (error || !mapel) {
      return NextResponse.json(
        { error: error ?? "Gagal memperbarui mapel" },
        { status: 400 },
      );
    }
    return NextResponse.json(mapel);
  } catch (err: unknown) {
    console.error("Update mapel error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE /api/master/mapel/[id]
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { ok, error } = await deleteMapel(id);
    if (!ok) {
      return NextResponse.json(
        { error: error ?? "Gagal menghapus mapel" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Delete mapel error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
