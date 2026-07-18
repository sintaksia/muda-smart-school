import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
} from "@/src/features/cms/services/testimonials";
import { testimonialSchema } from "@/src/app/admin/cms/testimonials/_components/TestimonialSchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const testimonial = await getTestimonialById(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimoni tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data testimoni" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = testimonialSchema.parse(body);
    const testimonial = await updateTestimonial(id, validated);
    revalidatePath("/admin/cms/testimonials");
    revalidatePath("/");
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui testimoni" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const testimonial = await toggleTestimonialStatus(id, body.isActive);
      revalidatePath("/admin/cms/testimonials");
      revalidatePath("/");
      return NextResponse.json(testimonial);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching testimonial:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui testimoni" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteTestimonial(id);
    revalidatePath("/admin/cms/testimonials");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Gagal menghapus testimoni" },
      { status: 500 },
    );
  }
}
