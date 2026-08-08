import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  ATTENDANCE_SETTINGS_GROUP,
  ATTENDANCE_SETTING_DEFAULTS,
} from "@/src/features/attendance/services/settings";
import { ATTENDANCE_SETTING_DEFINITIONS } from "@/src/features/attendance/constants";

const updateSchema = z.object({
  settings: z.partialRecord(
    z.enum(Object.keys(ATTENDANCE_SETTING_DEFAULTS) as [string, ...string[]], {
      message: "Kunci pengaturan tidak dikenal",
    }),
    z.string({ message: "Nilai harus berupa teks" }),
  ),
});

// GET /api/attendance/settings - master rules (admin)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const rows = await prisma.schoolSetting.findMany({
      where: { group: ATTENDANCE_SETTINGS_GROUP },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(rows);
  } catch (err: unknown) {
    console.error("Get attendance settings error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// PUT /api/attendance/settings - update master rules (admin)
export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    for (const [key, value] of Object.entries(result.data.settings)) {
      if (typeof value !== "string") {
        continue;
      }
      // Upsert, not update: a rule added in code has no row until it is either
      // seeded or saved here for the first time.
      const definition = ATTENDANCE_SETTING_DEFINITIONS.find(
        (item) => item.key === key,
      );
      await prisma.schoolSetting.upsert({
        where: { key },
        update: { value },
        create: {
          key,
          value,
          label: definition?.label ?? key,
          type: definition?.type ?? "TEXT",
          group: ATTENDANCE_SETTINGS_GROUP,
          order: ATTENDANCE_SETTING_DEFINITIONS.findIndex(
            (item) => item.key === key,
          ),
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Update attendance settings error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
