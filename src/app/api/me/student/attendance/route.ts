import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { requireStudent } from "@/src/features/auth/utils/api-auth";
import { dateOnlyUtc } from "@/src/features/attendance/utils/time";
import { parsePageParams, pageQueryArgs, toPage } from "@/src/lib/pagination";
import type { Prisma } from "@prisma/client";

const dateFilterSchema = z.object({
  from: z.iso.date({ message: "Format tanggal harus YYYY-MM-DD" }).optional(),
  to: z.iso.date({ message: "Format tanggal harus YYYY-MM-DD" }).optional(),
});

// GET /api/me/student/attendance - the caller's own attendance history,
// paginated. The dashboard returns a short recent slice; this is the full
// scrollable list behind it.
export async function GET(request: NextRequest) {
  try {
    const auth = await requireStudent();
    if ("response" in auth) return auth.response;
    const { student } = auth;

    const { searchParams } = request.nextUrl;

    const filters = dateFilterSchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    if (!filters.success) {
      return NextResponse.json(
        {
          error: "Filter tanggal tidak valid",
          details: filters.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { from, to } = filters.data;
    const dateRange: Prisma.DateTimeFilter = {
      ...(from ? { gte: dateOnlyUtc(from) } : {}),
      ...(to ? { lte: dateOnlyUtc(to) } : {}),
    };

    const page = parsePageParams(searchParams);
    const rows = await prisma.studentAttendance.findMany({
      where: {
        studentId: student.id,
        ...(from || to ? { date: dateRange } : {}),
      },
      include: {
        schedule: { select: { subject: { select: { name: true } } } },
      },
      // Tie-break on id so the cursor is stable when several records share a date.
      orderBy: [{ date: "desc" }, { id: "desc" }],
      ...pageQueryArgs(page),
    });

    const { data, nextCursor } = toPage(rows, page);

    return NextResponse.json({
      data: data.map((record) => ({
        id: record.id,
        date: record.date.toISOString().slice(0, 10),
        subjectName: record.schedule.subject.name,
        status: record.status,
      })),
      nextCursor,
    });
  } catch (err: unknown) {
    console.error("Student attendance error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
