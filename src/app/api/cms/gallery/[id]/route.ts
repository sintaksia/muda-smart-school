import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getGalleryById,
  updateGallery,
  deleteGallery,
  toggleGalleryStatus,
} from "@/src/features/cms/services/gallery";
import { gallerySchema } from "@/src/app/admin/cms/gallery/_components/GallerySchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const gallery = await getGalleryById(id);

    if (!gallery) {
      return NextResponse.json(
        { error: "Galeri tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data galeri" },
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
    const validated = gallerySchema.parse(body);
    const gallery = await updateGallery(id, validated);
    revalidatePath("/admin/cms/gallery");
    return NextResponse.json(gallery);
  } catch (error) {
    return handleApiError(
      error,
      "Error updating gallery:",
      "Gagal memperbarui galeri",
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
      const gallery = await toggleGalleryStatus(id, body.isActive);
      revalidatePath("/admin/cms/gallery");
      return NextResponse.json(gallery);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching gallery:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui galeri" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteGallery(id);
    revalidatePath("/admin/cms/gallery");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: "Gagal menghapus galeri" },
      { status: 500 },
    );
  }
}
