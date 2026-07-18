import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getHeroSlideById,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideStatus,
} from "@/src/features/cms/services/hero-slides";
import { heroSlideSchema } from "@/src/app/admin/cms/hero-slides/_components/HeroSlideSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const slide = await getHeroSlideById(id);

    if (!slide) {
      return NextResponse.json(
        { error: "Hero slide tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data hero slide" },
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
    const validated = heroSlideSchema.parse(body);
    const slide = await updateHeroSlide(id, validated);
    revalidatePath("/admin/cms/hero-slides");
    revalidatePath("/");
    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error updating hero slide:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui hero slide" },
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

    if (typeof body.isActive === "boolean") {
      const slide = await toggleHeroSlideStatus(id, body.isActive);
      revalidatePath("/admin/cms/hero-slides");
      revalidatePath("/");
      return NextResponse.json(slide);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching hero slide:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui hero slide" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteHeroSlide(id);
    revalidatePath("/admin/cms/hero-slides");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { error: "Gagal menghapus hero slide" },
      { status: 500 },
    );
  }
}
