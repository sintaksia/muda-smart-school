import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { revertPromotion } from "@/src/features/master/services/classPromotion";
import { revertPromotionSchema } from "../ClassPromotionSchema";

// POST /api/master/students/class-promotion/revert - undo the newest promotion
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = revertPromotionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { ok, error } = await revertPromotion(parsed.data.batchId);
    if (!ok) {
      return NextResponse.json(
        { error: error ?? "Gagal membatalkan kenaikan kelas" },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Batalkan kenaikan kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
