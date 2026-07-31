import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  createStudent,
  getStudentList,
} from "@/src/features/master/services/student";
import { createStudentSchema } from "./StudentSchema";

// GET /api/master/students
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(await getStudentList());
  } catch (err: unknown) {
    console.error("List siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/students - create a student account + profile manually
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = createStudentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { student, error } = await createStudent(result.data, currentUser.id);
    if (error || !student) {
      return NextResponse.json(
        { error: error ?? "Gagal membuat siswa" },
        { status: 400 },
      );
    }
    return NextResponse.json(student, { status: 201 });
  } catch (err: unknown) {
    console.error("Create siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
