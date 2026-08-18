import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFaqs, createFaq } from "@/src/features/cms/services/faqs";
import { faqSchema } from "@/src/app/admin/cms/faqs/_components/FaqSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET() {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const faqs = await getFaqs();
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching faqs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data FAQ" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = faqSchema.parse(body);
    const faq = await createFaq(validated);
    revalidatePath("/admin/cms/faqs");
    revalidatePath("/kontak");
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Error creating faq:", "Gagal membuat FAQ");
  }
}
