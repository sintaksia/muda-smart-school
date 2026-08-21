import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  executePromotion,
  getPromotionPreview,
} from "@/src/features/master/services/classPromotion";
import {
  academicYearSchema,
  classPromotionSchema,
} from "./ClassPromotionSchema";

// GET /api/master/students/class-promotion?from=2025/2026&to=2026/2027
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const from = academicYearSchema.safeParse(searchParams.get("from"));
    const to = academicYearSchema.safeParse(searchParams.get("to"));
    if (!from.success || !to.success) {
      return NextResponse.json(
        { error: "Format tahun ajaran: 2026/2027" },
        { status: 400 },
      );
    }
    if (from.data === to.data) {
      return NextResponse.json(
        { error: "Tahun ajaran tujuan harus berbeda" },
        { status: 400 },
      );
    }

    return NextResponse.json(await getPromotionPreview(from.data, to.data));
  } catch (err: unknown) {
    console.error("Preview kenaikan kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/students/class-promotion - run the promotion
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = classPromotionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { result, error } = await executePromotion(
      parsed.data,
      currentUser.id,
    );
    if (error || !result) {
      return NextResponse.json(
        { error: error ?? "Gagal memproses kenaikan kelas" },
        { status: 400 },
      );
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Kenaikan kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
