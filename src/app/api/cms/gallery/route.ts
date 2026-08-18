import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getGallery,
  getActiveGallery,
  createGallery,
} from "@/src/features/cms/services/gallery";
import { gallerySchema } from "@/src/app/admin/cms/gallery/_components/GallerySchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const active = request.nextUrl.searchParams.get("active");
    const gallery =
      active === "true" ? await getActiveGallery() : await getGallery();
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data galeri" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = gallerySchema.parse(body);
    const gallery = await createGallery(validated);
    revalidatePath("/admin/cms/gallery");
    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    return handleApiError(
      error,
      "Error creating gallery:",
      "Gagal membuat galeri",
    );
  }
}
