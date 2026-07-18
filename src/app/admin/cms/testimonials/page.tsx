import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { CreateButton } from "@/src/app/admin/_components/CreateButton";
import { TestimonialTable } from "./_components/TestimonialTable";
import { getTestimonials } from "@/src/features/cms/services/testimonials";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimoni"
        description="Kelola testimoni alumni, orang tua, guru, dan mitra"
        action={
          <CreateButton
            href="/admin/cms/testimonials/create"
            label="Tambah Testimoni"
          />
        }
      />
      <TestimonialTable data={testimonials} />
    </div>
  );
}
