import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getMapelList,
  createMapel,
} from "@/src/features/master/services/mapel";
import { mapelSchema } from "./MapelSchema";

// GET /api/master/mapel
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(await getMapelList());
  } catch (err: unknown) {
    console.error("List mapel error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/mapel
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = mapelSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { mapel, error } = await createMapel(result.data);
    if (error || !mapel) {
      return NextResponse.json(
        { error: error ?? "Gagal membuat mapel" },
        { status: 400 },
      );
    }
    return NextResponse.json(mapel, { status: 201 });
  } catch (err: unknown) {
    console.error("Create mapel error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
