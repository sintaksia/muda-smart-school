import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getHeroSlides,
  getActiveHeroSlides,
  createHeroSlide,
} from "@/src/features/cms/services/hero-slides";
import { heroSlideSchema } from "@/src/app/admin/cms/hero-slides/_components/HeroSlideSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const active = request.nextUrl.searchParams.get("active");
    const slides =
      active === "true" ? await getActiveHeroSlides() : await getHeroSlides();
    return NextResponse.json(slides);
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data hero slide" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = heroSlideSchema.parse(body);
    const slide = await createHeroSlide(validated);
    revalidatePath("/admin/cms/hero-slides");
    revalidatePath("/");
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return handleApiError(
      error,
      "Error creating hero slide:",
      "Gagal membuat hero slide",
    );
  }
}
