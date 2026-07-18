import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAchievements,
  createAchievement,
} from "@/src/features/cms/services/achievements";
import { achievementSchema } from "@/src/app/admin/cms/achievements/_components/AchievementSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const achievements = await getAchievements();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data prestasi" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = achievementSchema.parse(body);
    const achievement = await createAchievement(validated);
    revalidatePath("/admin/cms/achievements");
    revalidatePath("/");
    revalidatePath("/profil");
    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error("Error creating achievement:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat prestasi" },
      { status: 500 },
    );
  }
}
