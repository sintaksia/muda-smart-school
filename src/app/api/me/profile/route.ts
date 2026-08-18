import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";

// GET /api/me/profile - session user plus the linked domain record.
// Mobile clients call this once after login to decide which home screen to
// route to, so it answers "who am I" for every role in one request.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only one of these can be non-null — Student.userId and Teacher.userId
    // are both unique, and User.role is the discriminator.
    const [student, teacher] = await Promise.all([
      user.role === "STUDENT" ? getStudentByUserId(user.id) : null,
      user.role === "TEACHER" ? getTeacherByUserId(user.id) : null,
    ]);

    return NextResponse.json({ data: { user, student, teacher } });
  } catch (err: unknown) {
    console.error("Get profile error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
