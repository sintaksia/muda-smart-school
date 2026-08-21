import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { cloneClassesToAcademicYear } from "@/src/features/master/services/schoolClass";
import { academicYearSchema } from "../../students/class-promotion/ClassPromotionSchema";

const cloneSchema = z
  .object({
    fromAcademicYear: academicYearSchema,
    toAcademicYear: academicYearSchema,
  })
  .refine((data) => data.fromAcademicYear !== data.toAcademicYear, {
    path: ["toAcademicYear"],
    message: "Tahun ajaran tujuan harus berbeda",
  });

// POST /api/master/classes/clone - prepare next year's classes
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = cloneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await cloneClassesToAcademicYear(
      parsed.data.fromAcademicYear,
      parsed.data.toAcademicYear,
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Clone kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
