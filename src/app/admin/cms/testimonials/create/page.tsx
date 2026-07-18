import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PageHeader } from "@/src/app/admin/_components/PageHeader";
import { TestimonialForm } from "../_components/TestimonialForm";

export default function CreateTestimonialPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Testimoni"
        description="Buat testimoni baru"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/cms/testimonials">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
        }
      />
      <TestimonialForm />
    </div>
  );
}
