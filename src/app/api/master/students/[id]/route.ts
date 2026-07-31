import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  deleteStudent,
  getStudentById,
  updateStudent,
} from "@/src/features/master/services/student";
import { updateStudentSchema } from "../StudentSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/master/students/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const student = await getStudentById(id);
    if (!student) {
      return NextResponse.json(
        { error: "Siswa tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(student);
  } catch (err: unknown) {
    console.error("Get siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH /api/master/students/[id] - edit profile, placement or status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = updateStudentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { student, error } = await updateStudent(id, result.data);
    if (error || !student) {
      return NextResponse.json(
        { error: error ?? "Gagal memperbarui siswa" },
        { status: 400 },
      );
    }
    return NextResponse.json(student);
  } catch (err: unknown) {
    console.error("Update siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE /api/master/students/[id] - remove the student and their login
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { success, error } = await deleteStudent(id);
    if (!success) {
      return NextResponse.json(
        { error: error ?? "Gagal menghapus siswa" },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
