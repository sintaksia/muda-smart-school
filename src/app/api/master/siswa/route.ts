import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  createSiswaManual,
  getSiswaList,
} from "@/src/features/master/services/siswa";
import { createSiswaSchema } from "./SiswaSchema";

// GET /api/master/siswa
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(await getSiswaList());
  } catch (err: unknown) {
    console.error("List siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/siswa - manually create a transfer student account
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = createSiswaSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { student, error } = await createSiswaManual(
      result.data,
      currentUser.id,
    );
    if (error || !student) {
      return NextResponse.json(
        { error: error ?? "Gagal membuat akun siswa" },
        { status: 400 },
      );
    }
    return NextResponse.json(student, { status: 201 });
  } catch (err: unknown) {
    console.error("Create siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
