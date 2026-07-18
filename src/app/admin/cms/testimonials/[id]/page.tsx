import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { TestimonialForm } from "../_components/TestimonialForm";
import { getTestimonialById } from "@/src/features/cms/services/testimonials";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  const defaultValues = {
    name: testimonial.name,
    role: testimonial.role,
    quote: testimonial.quote,
    type: testimonial.type,
    image: testimonial.image,
    order: testimonial.order,
    isActive: testimonial.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Testimoni"
        description="Ubah data testimoni"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/testimonials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <TestimonialForm defaultValues={defaultValues} testimonialId={id} />
    </div>
  );
}
