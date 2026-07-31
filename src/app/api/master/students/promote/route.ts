import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { promoteAcceptedRegistrations } from "@/src/features/master/services/studentPromotion";

// POST /api/master/students/promote - sync ACCEPTED registrations into students
export async function POST() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const result = await promoteAcceptedRegistrations(currentUser.id);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Promote pendaftaran error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
