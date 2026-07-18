import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
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
          <Button asChild>
            <Link href="/admin/cms/testimonials/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Testimoni
            </Link>
          </Button>
        }
      />
      <TestimonialTable data={testimonials} />
    </div>
  );
}
