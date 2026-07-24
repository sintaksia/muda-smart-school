import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  createManualCreditEntry,
  getCreditTotal,
} from "@/src/features/attendance/services/credit";
import { CREDIT_OWNER_TYPE_VALUES } from "@/src/lib/constants";

const manualEntrySchema = z.object({
  ownerType: z.enum(CREDIT_OWNER_TYPE_VALUES as ["STUDENT", "TEACHER"], {
    message: "Tipe pemilik wajib dipilih",
  }),
  ownerId: z.string({ message: "Pemilik wajib dipilih" }).min(1),
  type: z.enum(["ACHIEVEMENT", "VIOLATION"], {
    message: "Tipe entri wajib dipilih",
  }),
  category: z.string({ message: "Kategori wajib dipilih" }).min(1),
  points: z
    .number({ message: "Poin wajib diisi" })
    .int()
    .refine((value) => value !== 0, { message: "Poin tidak boleh 0" }),
  note: z.string().optional(),
  evidence: z.string().optional(),
});

// GET /api/attendance/credit-scores?ownerType=&ownerId= - entries + total
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let ownerType = searchParams.get("ownerType") as
      | "STUDENT"
      | "TEACHER"
      | null;
    let ownerId = searchParams.get("ownerId");

    // Students and teachers may always view their own score.
    if (currentUser.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: currentUser.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      ownerType = "STUDENT";
      ownerId = student.id;
    } else if (currentUser.role === "TEACHER" && !ownerId) {
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (!guru) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      ownerType = "TEACHER";
      ownerId = guru.id;
    }

    if (!ownerType || !ownerId) {
      return NextResponse.json(
        { error: "ownerType dan ownerId wajib diisi" },
        { status: 400 },
      );
    }

    // Teachers may inspect their own students; only Kepsek/admin may
    // inspect other teachers' scores.
    if (currentUser.role === "TEACHER" && ownerType === "TEACHER") {
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (guru?.id !== ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const where =
      ownerType === "STUDENT"
        ? { ownerType, studentId: ownerId }
        : { ownerType, teacherId: ownerId };
    const entries = await prisma.creditScore.findMany({
      where,
      include: {
        reportedBy: { select: { name: true } },
        refSesi: {
          select: {
            date: true,
            jadwal: { select: { mataPelajaran: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const total = await getCreditTotal(ownerType, ownerId);
    return NextResponse.json({ total, entries });
  } catch (err: unknown) {
    console.error("List credit scores error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/credit-scores - manual entry (Process 6)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = manualEntrySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    // Teachers/BK log student entries; teacher entries are reserved for
    // Kepala Sekolah/Wakasek (SUPER_ADMIN).
    if (result.data.ownerType === "STUDENT") {
      const allowed =
        canAccessAdmin(currentUser.role) || currentUser.role === "TEACHER";
      if (!allowed) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const entry = await createManualCreditEntry({
      ...result.data,
      reportedById: currentUser.id,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    console.error("Create credit entry error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
