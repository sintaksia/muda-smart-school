import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getTestimonials,
  createTestimonial,
} from "@/src/features/cms/services/testimonials";
import { testimonialSchema } from "@/src/app/admin/cms/testimonials/_components/TestimonialSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET() {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const testimonials = await getTestimonials();
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data testimoni" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = testimonialSchema.parse(body);
    const testimonial = await createTestimonial(validated);
    revalidatePath("/admin/cms/testimonials");
    revalidatePath("/");
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    return handleApiError(
      error,
      "Error creating testimonial:",
      "Gagal membuat testimoni",
    );
  }
}
