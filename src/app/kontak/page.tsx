import Link from "next/link";

import HeroSection from "./_components/HeroSection";
import ContactCards from "./_components/ContactCards";
import LocationInfo from "./_components/LocationInfo";
import FAQSection from "./_components/FAQSection";
import CTABanner from "./_components/CTABanner";
import { getActiveFaqs } from "@/src/features/cms/services/faqs";

export default async function KontakPage() {
  const faqs = await getActiveFaqs();

  return (
    <main className="pt-16">
      <HeroSection />
      <ContactCards />
      <LocationInfo />
      <FAQSection faqs={faqs} />
      <CTABanner />
    </main>
  );
}
