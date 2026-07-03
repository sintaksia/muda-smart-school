import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/src/features/auth/services/users";
import {
  canManageUsers,
  canModifyUser,
  getAllowedRolesToCreate,
} from "@/src/features/auth/utils/permissions";
import { updateUserSchema } from "@/src/app/admin/users/_components/UserSchema";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/auth/users/[id] - Get user by ID
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PUT /api/auth/users/[id] - Update user
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get target user to check permissions
    const targetUser = await getUserById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if current user can modify target user
    if (!canModifyUser(currentUser.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Anda tidak dapat mengubah user dengan role ini" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    // Prevent privilege escalation: actor must be allowed to assign the new role
    if (!getAllowedRolesToCreate(currentUser.role).includes(result.data.role)) {
      return NextResponse.json(
        { error: "Anda tidak dapat memberikan role ini" },
        { status: 403 },
      );
    }

    const { user, error } = await updateUser(id, result.data);

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Gagal mengupdate user" },
        { status: 400 },
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// DELETE /api/auth/users/[id] - Delete user
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prevent self-deletion
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun sendiri" },
        { status: 400 },
      );
    }

    // Get target user to check permissions
    const targetUser = await getUserById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if current user can modify target user
    if (!canModifyUser(currentUser.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus user dengan role ini" },
        { status: 403 },
      );
    }

    const { success, error } = await deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { error: error || "Gagal menghapus user" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
