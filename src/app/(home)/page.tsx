import type { Metadata } from "next";
import HeroBanner from "./_components/HeroBanner";
import ProgramKeahlianSection from "./_components/ProgramKeahlianSection";
import AwardsSection from "./_components/AwardsSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import NewsSection from "./_components/NewsSection";
import CTABanner from "./_components/CTABanner";
import Footer from "./_components/Footer";
import { getActiveHeroSlides } from "@/src/features/cms/services/hero-slides";
import { getActiveTestimonials } from "@/src/features/cms/services/testimonials";

export const metadata: Metadata = {
  title: {
    absolute: "SMK Muhammadiyah 2 Cibiru | SMK Unggulan Bandung",
  },
  description:
    "SMK Muhammadiyah 2 Cibiru Bandung dengan 5 jurusan unggulan: PPLG, TJKT, Otomotif, MPLB, dan AKL. Daftar sekarang dan mulai masa depanmu!",
};

export default async function Beranda() {
  const slides = await getActiveHeroSlides();
  const testimonials = await getActiveTestimonials();

  return (
    <main className="pt-16">
      <h1 className="sr-only">
        SMK Muhammadiyah 2 Cibiru - Sekolah Kejuruan Unggulan di Bandung
      </h1>
      <HeroBanner slides={slides} />
      <ProgramKeahlianSection />
      <AwardsSection />
      <TestimonialsSection testimonials={testimonials} />
      <NewsSection />
      <CTABanner />
      <Footer />
    </main>
  );
}
