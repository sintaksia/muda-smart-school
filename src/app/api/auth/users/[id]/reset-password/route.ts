import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getUserById,
  resetUserPassword,
} from "@/src/features/auth/services/users";
import {
  canManageUsers,
  canModifyUser,
} from "@/src/features/auth/utils/permissions";
import { resetPasswordSchema } from "@/src/lib/validation";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/auth/users/[id]/reset-password - Reset user password
export async function POST(request: Request, { params }: RouteParams) {
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
        { error: "Anda tidak dapat mengubah password user dengan role ini" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { success, error } = await resetUserPassword(
      id,
      result.data.password,
    );

    if (!success) {
      return NextResponse.json(
        { error: error || "Gagal reset password" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
