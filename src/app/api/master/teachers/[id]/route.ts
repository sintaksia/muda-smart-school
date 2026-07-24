import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { updateTeacher } from "@/src/features/master/services/guru";
import { updateGuruSchema } from "../GuruSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/master/guru/[id] - update profile + subject qualifications
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = updateGuruSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { teacher, error } = await updateTeacher(id, result.data);
    if (error || !teacher) {
      return NextResponse.json(
        { error: error ?? "Gagal memperbarui guru" },
        { status: 400 },
      );
    }
    return NextResponse.json(teacher);
  } catch (err: unknown) {
    console.error("Update guru error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
