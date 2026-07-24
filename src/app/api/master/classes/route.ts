import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getClassList,
  createClass,
} from "@/src/features/master/services/schoolClass";
import { classSchema } from "./ClassSchema";

// GET /api/master/classes
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.json(await getClassList());
  } catch (err: unknown) {
    console.error("List kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/master/classes
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await request.json();
    const result = classSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const { schoolClass, error } = await createClass(result.data);
    if (error || !schoolClass) {
      return NextResponse.json(
        { error: error ?? "Gagal membuat kelas" },
        { status: 400 },
      );
    }
    return NextResponse.json(schoolClass, { status: 201 });
  } catch (err: unknown) {
    console.error("Create kelas error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
