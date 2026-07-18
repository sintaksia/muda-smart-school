import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  toggleAchievementStatus,
  toggleAchievementHighlight,
} from "@/src/features/cms/services/achievements";
import { achievementSchema } from "@/src/app/admin/cms/achievements/_components/AchievementSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const achievement = await getAchievementById(id);

    if (!achievement) {
      return NextResponse.json(
        { error: "Prestasi tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error fetching achievement:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data prestasi" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();
    const validated = achievementSchema.parse(body);
    const achievement = await updateAchievement(id, validated);
    revalidatePath("/admin/cms/achievements");
    revalidatePath("/");
    revalidatePath("/profil");
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error updating achievement:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui prestasi" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();

    // Handle toggle status
    if (typeof body.isActive === "boolean") {
      const achievement = await toggleAchievementStatus(id, body.isActive);
      revalidatePath("/admin/cms/achievements");
      revalidatePath("/");
      revalidatePath("/profil");
      return NextResponse.json(achievement);
    }

    // Handle toggle highlight
    if (typeof body.isHighlight === "boolean") {
      const achievement = await toggleAchievementHighlight(
        id,
        body.isHighlight,
      );
      revalidatePath("/admin/cms/achievements");
      revalidatePath("/");
      revalidatePath("/profil");
      return NextResponse.json(achievement);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching achievement:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui prestasi" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteAchievement(id);
    revalidatePath("/admin/cms/achievements");
    revalidatePath("/");
    revalidatePath("/profil");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json(
      { error: "Gagal menghapus prestasi" },
      { status: 500 },
    );
  }
}
