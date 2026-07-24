import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { reportTeacherAbsence } from "@/src/features/attendance/services/teacher-attendance";

const reportSchema = z.object({
  guruId: z.string().min(1).optional(), // teachers self-report; admin passes it
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal tidak valid" }),
  status: z.enum(["IZIN", "SAKIT", "ALPHA"], {
    message: "Status wajib dipilih",
  }),
  catatan: z.string().optional(),
  jadwalIds: z.array(z.string()).optional(),
});

// GET /api/attendance/teacher-absence?date=YYYY-MM-DD - admin recap
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const where = date ? { tanggal: new Date(`${date}T00:00:00.000Z`) } : {};

    const records = await prisma.absensiGuru.findMany({
      where,
      include: {
        guru: { select: { id: true, user: { select: { name: true } } } },
        substituteGuru: {
          select: { id: true, user: { select: { name: true } } },
        },
        jadwal: {
          select: {
            jamMulai: true,
            jamSelesai: true,
            kelas: { select: { name: true } },
            mataPelajaran: { select: { name: true } },
          },
        },
      },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(records);
  } catch (err: unknown) {
    console.error("List teacher absence error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/teacher-absence - report absence (Process 4)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = reportSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    let guruId = result.data.guruId;
    if (!canAccessAdmin(currentUser.role)) {
      // Self-report path: teachers may only report themselves (not Alpa).
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (!guru || currentUser.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (result.data.status === "ALPHA") {
        return NextResponse.json(
          { error: "Status Alpa hanya dapat dicatat oleh Admin" },
          { status: 403 },
        );
      }
      guruId = guru.id;
    } else if (!guruId) {
      return NextResponse.json(
        { error: "guruId wajib diisi" },
        { status: 400 },
      );
    }

    const { records, error } = await reportTeacherAbsence({
      guruId,
      tanggal: result.data.tanggal,
      status: result.data.status,
      catatan: result.data.catatan,
      reportedById: currentUser.id,
      jadwalIds: result.data.jadwalIds,
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json(records, { status: 201 });
  } catch (err: unknown) {
    console.error("Report teacher absence error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
