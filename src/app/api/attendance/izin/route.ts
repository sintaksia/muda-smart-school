import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { submitIzin } from "@/src/features/attendance/services/izin";
import { IZIN_JENIS_VALUES } from "@/src/lib/constants";

const submitSchema = z.object({
  studentId: z.string().min(1).optional(), // admins may submit on behalf
  jenis: z.enum(IZIN_JENIS_VALUES as ["IZIN", "SAKIT"], {
    message: "Jenis wajib dipilih",
  }),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal tidak valid" }),
  jadwalId: z.string().optional(),
  alasan: z.string({ message: "Alasan wajib diisi" }).min(3),
  lampiran: z.string().optional(),
});

// GET /api/attendance/izin - list submissions (role-scoped)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where = {};
    if (currentUser.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      where = { studentId: student.id };
    } else if (!canAccessAdmin(currentUser.role)) {
      // Teacher: submissions from classes they are wali kelas of.
      const guru = await prisma.guru.findUnique({
        where: { userId: currentUser.id },
        include: { kelasWali: { select: { id: true } } },
      });
      if (!guru || guru.kelasWali.length === 0) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      where = {
        student: { kelasId: { in: guru.kelasWali.map((k) => k.id) } },
      };
    }

    const submissions = await prisma.pengajuanIzin.findMany({
      where,
      include: {
        student: {
          select: {
            nis: true,
            kelasId: true,
            user: { select: { name: true } },
            kelas: { select: { nama: true } },
          },
        },
        reviewedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (err: unknown) {
    console.error("List izin error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/izin - submit izin/sakit (Process 5)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    let studentId = result.data.studentId;
    if (currentUser.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      studentId = student.id;
    } else if (!studentId) {
      return NextResponse.json(
        { error: "studentId wajib diisi" },
        { status: 400 },
      );
    }

    const { izin, error } = await submitIzin({
      studentId,
      jenis: result.data.jenis,
      tanggal: result.data.tanggal,
      jadwalId: result.data.jadwalId,
      alasan: result.data.alasan,
      lampiran: result.data.lampiran,
      submittedById: currentUser.id,
    });
    if (error || !izin) {
      return NextResponse.json(
        { error: error ?? "Gagal mengajukan izin" },
        { status: 400 },
      );
    }
    return NextResponse.json(izin, { status: 201 });
  } catch (err: unknown) {
    console.error("Submit izin error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
