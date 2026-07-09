import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { updateSiswa } from "@/src/features/master/services/siswa";
import { STUDENT_STATUS_VALUES } from "@/src/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSiswaSchema = z.object({
  kelasId: z.string().optional().nullable(),
  status: z
    .enum(STUDENT_STATUS_VALUES as ["AKTIF", "LULUS", "PINDAH", "DROPOUT"], {
      message: "Status tidak valid",
    })
    .optional(),
});

// PATCH /api/master/siswa/[id] - assign class / change status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = updateSiswaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { siswa, error } = await updateSiswa(id, result.data);
    if (error || !siswa) {
      return NextResponse.json(
        { error: error ?? "Gagal memperbarui siswa" },
        { status: 400 },
      );
    }
    return NextResponse.json(siswa);
  } catch (err: unknown) {
    console.error("Update siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
