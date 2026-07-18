import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getTestimonials,
  createTestimonial,
} from "@/src/features/cms/services/testimonials";
import { testimonialSchema } from "@/src/app/admin/cms/testimonials/_components/TestimonialSchema";

export async function GET() {
  try {
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
    const body = await request.json();
    const validated = testimonialSchema.parse(body);
    const testimonial = await createTestimonial(validated);
    revalidatePath("/admin/cms/testimonials");
    revalidatePath("/");
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat testimoni" },
      { status: 500 },
    );
  }
}
