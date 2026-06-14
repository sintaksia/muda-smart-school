import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canManageCMS } from "@/src/features/auth/utils/permissions";
import { createStudentFromRegistration } from "@/src/features/student/services/student.service";
import { createStudentFromRegistrationSchema } from "./StudentSchema";

// POST /api/students - Create a student account from an accepted registration
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageCMS(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const result = createStudentFromRegistrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { student, error } = await createStudentFromRegistration(
      result.data,
      currentUser.id,
    );

    if (error || !student) {
      return NextResponse.json(
        { error: error || "Gagal membuat akun siswa" },
        { status: 400 },
      );
    }

    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    console.error("Create student error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
