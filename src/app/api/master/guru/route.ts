import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getTeacherList,
  createTeacher,
} from "@/src/features/master/services/guru";
import { createGuruSchema } from "./GuruSchema";

// GET /api/master/guru
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(await getTeacherList());
  } catch (err: unknown) {
    console.error("List guru error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/guru - create teacher account + profile + qualifications
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = createGuruSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { teacher, error } = await createTeacher(result.data, currentUser.id);
    if (error || !teacher) {
      return NextResponse.json(
        { error: error ?? "Gagal membuat akun guru" },
        { status: 400 },
      );
    }
    return NextResponse.json(teacher, { status: 201 });
  } catch (err: unknown) {
    console.error("Create guru error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
