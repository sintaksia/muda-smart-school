import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  ensureCardTokens,
  regenerateCardToken,
} from "@/src/features/master/services/studentCard";

const mintSchema = z.object({
  classId: z.string({ message: "Kelas wajib dipilih" }).min(1),
});

const regenerateSchema = z.object({
  studentId: z.string({ message: "Siswa wajib dipilih" }).min(1),
});

// POST /api/master/students/cards - mint missing card tokens for a class
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = mintSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const minted = await ensureCardTokens(result.data.classId);
    return NextResponse.json({ minted });
  } catch (err: unknown) {
    console.error("Mint student cards error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH /api/master/students/cards - reissue one student's card, revoking the old one
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = regenerateSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { student, error } = await regenerateCardToken(result.data.studentId);
    if (error || !student) {
      return NextResponse.json(
        { error: error ?? "Gagal menerbitkan ulang kartu" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Regenerate student card error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
