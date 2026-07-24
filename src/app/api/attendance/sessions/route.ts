import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { openSession } from "@/src/features/attendance/services/session";
import { toWibParts, dateOnlyUtc } from "@/src/features/attendance/utils/time";

const openSessionSchema = z.object({
  jadwalId: z.string({ message: "Jadwal wajib dipilih" }).min(1),
});

// GET /api/attendance/sessions - today's schedule entries + session state
// for the logged-in teacher (or all classes for admins)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dateISO, hari } = toWibParts(new Date());
    if (!hari) {
      return NextResponse.json({ date: dateISO, jadwal: [] });
    }

    let guruFilter: { guruId?: string } = {};
    if (!canAccessAdmin(currentUser.role)) {
      const guru = await prisma.teacher.findUnique({
        where: { userId: currentUser.id },
      });
      if (!guru) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      guruFilter = { guruId: guru.id };
    }

    const jadwal = await prisma.jadwal.findMany({
      where: { hari, isActive: true, ...guruFilter },
      include: {
        kelas: { select: { id: true, name: true } },
        mataPelajaran: { select: { id: true, name: true } },
        guru: { select: { id: true, user: { select: { name: true } } } },
        sesi: { where: { tanggal: dateOnlyUtc(dateISO) } },
      },
      orderBy: { jamMulai: "asc" },
    });

    return NextResponse.json({ date: dateISO, jadwal });
  } catch (err: unknown) {
    console.error("List sessions error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// POST /api/attendance/sessions - open a session (Process 1)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = openSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const guru = await prisma.teacher.findUnique({
      where: { userId: currentUser.id },
    });

    if (!canAccessAdmin(currentUser.role)) {
      if (!guru) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const jadwal = await prisma.jadwal.findUnique({
        where: { id: result.data.jadwalId },
      });
      if (!jadwal) {
        return NextResponse.json(
          { error: "Jadwal tidak ditemukan" },
          { status: 404 },
        );
      }
      // The scheduled teacher — or the assigned substitute — may open.
      if (jadwal.guruId !== guru.id) {
        const substitution = await prisma.absensiGuru.findFirst({
          where: {
            jadwalId: jadwal.id,
            tanggal: dateOnlyUtc(toWibParts(new Date()).dateISO),
            substituteGuruId: guru.id,
          },
        });
        if (!substitution) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }
    }

    const { sesi, error } = await openSession(result.data.jadwalId, {
      byGuruId: guru?.id,
    });
    if (error || !sesi) {
      return NextResponse.json(
        { error: error ?? "Gagal membuka sesi", sesi },
        { status: 400 },
      );
    }
    return NextResponse.json(sesi, { status: 201 });
  } catch (err: unknown) {
    console.error("Open session error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
