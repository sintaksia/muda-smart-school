import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getUsers, createUser } from "@/src/features/auth/services/users";
import {
  canManageUsers,
  getAllowedRolesToCreate,
} from "@/src/features/auth/utils/permissions";
import { createUserSchema } from "@/src/app/admin/users/_components/UserSchema";

// GET /api/auth/users - List all users
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/auth/users - Create new user
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    // Validate input
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    if (!getAllowedRolesToCreate(currentUser.role).includes(result.data.role)) {
      return NextResponse.json(
        { error: "Anda tidak dapat membuat user dengan role ini" },
        { status: 403 },
      );
    }

    const { user, error } = await createUser(result.data, currentUser.id);

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Gagal membuat user" },
        { status: 400 },
      );
    }

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
