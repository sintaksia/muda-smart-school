import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { recordScan } from "@/src/features/attendance/services/scan";

const scanSchema = z.object({
  token: z.string({ message: "Token wajib diisi" }).min(1),
  gpsLat: z.number({ message: "Koordinat tidak valid" }).optional(),
  gpsLng: z.number({ message: "Koordinat tidak valid" }).optional(),
});

// POST /api/attendance/scan - student QR scan (Process 2)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = scanSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const scan = await recordScan({
      token: result.data.token,
      studentUserId: currentUser.id,
      gpsLat: result.data.gpsLat,
      gpsLng: result.data.gpsLng,
    });

    if (!scan.ok) {
      return NextResponse.json({ error: scan.error }, { status: 400 });
    }
    return NextResponse.json(scan, { status: 201 });
  } catch (err: unknown) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
