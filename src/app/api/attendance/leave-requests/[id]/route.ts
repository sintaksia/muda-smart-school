import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { reviewLeaveRequest } from "@/src/features/attendance/services/leaveRequest";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const reviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"], {
    message: "Keputusan tidak valid",
  }),
  reviewNote: z.string().optional(),
});

// PATCH /api/attendance/leave-requests/[id] - approve/reject (wali kelas or admin)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canAccessAdmin(currentUser.role)) {
      const izin = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          student: {
            select: {
              schoolClass: {
                select: { homeroomTeacher: { select: { userId: true } } },
              },
            },
          },
        },
      });
      if (!izin) {
        return NextResponse.json(
          { error: "Pengajuan tidak ditemukan" },
          { status: 404 },
        );
      }
      if (
        izin.student.schoolClass?.homeroomTeacher?.userId !== currentUser.id
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { izin, error } = await reviewLeaveRequest(
      id,
      result.data.decision,
      currentUser.id,
      result.data.reviewNote,
    );
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json(izin);
  } catch (err: unknown) {
    console.error("Review izin error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
