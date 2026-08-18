import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getNews,
  getPublishedNews,
  createNews,
} from "@/src/features/cms/services/news";
import { newsSchema } from "@/src/app/admin/cms/news/_components/NewsSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");

    const news =
      published === "true" ? await getPublishedNews() : await getNews();

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data berita" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = newsSchema.parse(body);
    const news = await createNews(validated);
    revalidatePath("/admin/cms/news");
    revalidatePath("/berita");
    revalidatePath("/");
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return handleApiError(
      error,
      "Error creating news:",
      "Gagal membuat berita",
    );
  }
}
