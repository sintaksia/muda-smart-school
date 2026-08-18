import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getNewsById,
  updateNews,
  deleteNews,
  toggleNewsPublished,
} from "@/src/features/cms/services/news";
import { newsSchema } from "@/src/app/admin/cms/news/_components/NewsSchema";
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
    const news = await getNewsById(id);

    if (!news) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data berita" },
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
    const validated = newsSchema.parse(body);
    const news = await updateNews(id, validated);
    revalidatePath("/admin/cms/news");
    revalidatePath("/berita");
    revalidatePath("/");
    return NextResponse.json(news);
  } catch (error) {
    return handleApiError(
      error,
      "Error updating news:",
      "Gagal memperbarui berita",
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isPublished === "boolean") {
      const news = await toggleNewsPublished(id, body.isPublished);
      revalidatePath("/admin/cms/news");
      revalidatePath("/berita");
      revalidatePath("/");
      return NextResponse.json(news);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching news:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui berita" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteNews(id);
    revalidatePath("/admin/cms/news");
    revalidatePath("/berita");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Gagal menghapus berita" },
      { status: 500 },
    );
  }
}
