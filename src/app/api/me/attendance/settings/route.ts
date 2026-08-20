import { NextResponse } from "next/server";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";

// GET /api/me/attendance/settings - the client-safe slice of the attendance
// master rules, readable by any signed-in user.
//
// The admin route (PUT/GET /api/attendance/settings) owns the whole table;
// this one exists because the apps have to *render* differently per rule —
// who shows the QR, who scans it, whether the token rotates — and both the
// student and the teacher shell need the same answer. Credit points,
// thresholds and MAX_WEEKLY_HOURS stay admin-only: they are policy the client
// never branches on.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getAttendanceSettings();

    return NextResponse.json({
      data: {
        scanMode: settings.scanMode,
        qrMode: settings.qrMode,
        qrTokenTtlSeconds: settings.qrTokenTtlSeconds,
        sessionGracePeriodMinutes: settings.sessionGracePeriodMinutes,
        gpsRadiusMeters: settings.gpsRadiusMeters,
        gpsSchoolLat: settings.gpsSchoolLat,
        gpsSchoolLng: settings.gpsSchoolLng,
      },
    });
  } catch (err: unknown) {
    console.error("Get client attendance settings error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
