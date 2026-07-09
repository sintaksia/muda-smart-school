import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getUnreadNotifications,
  markNotificationRead,
} from "@/src/features/attendance/services/notifications";

const markReadSchema = z.object({
  id: z.string({ message: "id wajib diisi" }).min(1),
});

// GET /api/attendance/notifications - own unread notifications
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const notifications = await getUnreadNotifications(currentUser.id);
    return NextResponse.json(notifications);
  } catch (err: unknown) {
    console.error("List notifications error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PATCH /api/attendance/notifications - mark one as read
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const result = markReadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }
    const notification = await markNotificationRead(
      result.data.id,
      currentUser.id,
    );
    if (!notification) {
      return NextResponse.json(
        { error: "Notifikasi tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json(notification);
  } catch (err: unknown) {
    console.error("Mark notification error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
