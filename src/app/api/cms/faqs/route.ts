import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFaqs, createFaq } from "@/src/features/cms/services/faqs";
import { faqSchema } from "@/src/app/admin/cms/faqs/_components/FaqSchema";

export async function GET() {
  try {
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
    const body = await request.json();
    const validated = faqSchema.parse(body);
    const faq = await createFaq(validated);
    revalidatePath("/admin/cms/faqs");
    revalidatePath("/kontak");
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Error creating faq:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}
