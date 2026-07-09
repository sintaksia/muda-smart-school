import { NextResponse } from "next/server";
import { autoCloseDueSessions } from "@/src/features/attendance/services/session";
import { detectMissedSessions } from "@/src/features/attendance/services/teacher-attendance";

/**
 * POST /api/cron/attendance — background tick (call every few minutes via
 * Vercel Cron / external scheduler). Auto-closes overdue sessions
 * (Process 1 step 5) and detects unreported teacher no-shows (Process 4).
 * Secured by the CRON_SECRET bearer token.
 */
export async function POST(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const closed = await autoCloseDueSessions(now);
    const missedTeacherSessions = await detectMissedSessions(now);

    return NextResponse.json({ closed, missedTeacherSessions });
  } catch (err: unknown) {
    console.error("Attendance cron error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
