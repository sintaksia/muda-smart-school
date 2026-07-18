import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getFaqById,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "@/src/features/cms/services/faqs";
import { faqSchema } from "@/src/app/admin/cms/faqs/_components/FaqSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const faq = await getFaqById(id);

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching faq:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data FAQ" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = faqSchema.parse(body);
    const faq = await updateFaq(id, validated);
    revalidatePath("/admin/cms/faqs");
    revalidatePath("/kontak");
    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error updating faq:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui FAQ" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const faq = await toggleFaqStatus(id, body.isActive);
      revalidatePath("/admin/cms/faqs");
      revalidatePath("/kontak");
      return NextResponse.json(faq);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching faq:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui FAQ" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteFaq(id);
    revalidatePath("/admin/cms/faqs");
    revalidatePath("/kontak");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting faq:", error);
    return NextResponse.json({ error: "Gagal menghapus FAQ" }, { status: 500 });
  }
}
