import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeSessionAccess } from "@/src/features/attendance/services/sessionAccess";
import { recordCardScan } from "@/src/features/attendance/services/cardScan";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const cardScanSchema = z.union([
  z.object({ cardToken: z.string().min(1), nis: z.undefined().optional() }),
  z.object({ nis: z.string().min(1), cardToken: z.undefined().optional() }),
]);

// POST /api/attendance/sessions/[id]/card-scan - Process 2b, teacher scans a card
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await authorizeSessionAccess(id);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = cardScanSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: "Kartu atau NIS wajib diisi" },
        { status: 400 },
      );
    }

    const scan = await recordCardScan({ sessionId: id, ...result.data });
    if (!scan.ok) {
      return NextResponse.json(scan, { status: 400 });
    }
    return NextResponse.json(scan, { status: scan.duplicate ? 200 : 201 });
  } catch (err: unknown) {
    console.error("Card scan error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
