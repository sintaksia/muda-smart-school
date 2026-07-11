import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { bulkUpdateSiswa } from "@/src/features/master/services/siswa";
import { bulkSiswaSchema } from "../SiswaSchema";

// POST /api/master/siswa/bulk - kenaikan kelas (PROMOTE) or kelulusan (GRADUATE)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = bulkSiswaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { count, error } = await bulkUpdateSiswa(result.data);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ count });
  } catch (err: unknown) {
    console.error("Bulk siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
