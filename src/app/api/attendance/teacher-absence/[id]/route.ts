import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { assignSubstitute } from "@/src/features/attendance/services/teacher-attendance";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const assignSchema = z.object({
  substituteTeacherId: z
    .string({ message: "Guru pengganti wajib dipilih" })
    .min(1),
});

// PATCH /api/attendance/teacher-absence/[id] - assign substitute (admin)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = assignSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { record, error } = await assignSubstitute(
      id,
      result.data.substituteTeacherId,
    );
    if (error || !record) {
      return NextResponse.json(
        { error: error ?? "Gagal menugaskan pengganti" },
        { status: 400 },
      );
    }
    return NextResponse.json(record);
  } catch (err: unknown) {
    console.error("Assign substitute error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
