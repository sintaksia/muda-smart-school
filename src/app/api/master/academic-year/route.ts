import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getActiveAcademicYear,
  setActiveAcademicYear,
} from "@/src/features/master/services/academicYear";
import { academicYearSchema } from "../students/class-promotion/ClassPromotionSchema";

const updateSchema = z.object({ academicYear: academicYearSchema });

// GET /api/master/academic-year - the year the school is currently running
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json({ academicYear: await getActiveAcademicYear() });
  } catch (err: unknown) {
    console.error("Get tahun ajaran aktif error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PUT /api/master/academic-year
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { ok, error } = await setActiveAcademicYear(parsed.data.academicYear);
    if (!ok) {
      return NextResponse.json(
        { error: error ?? "Gagal menyimpan tahun ajaran" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Update tahun ajaran aktif error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
