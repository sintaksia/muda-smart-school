import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getNews,
  getPublishedNews,
  createNews,
} from "@/src/features/cms/services/news";
import { newsSchema } from "@/src/app/admin/cms/news/_components/NewsSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET(request: Request) {
  try {
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
    console.error("Error creating news:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat berita" },
      { status: 500 },
    );
  }
}
