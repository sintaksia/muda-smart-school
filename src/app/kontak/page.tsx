import Link from "next/link";

import HeroSection from "./_components/HeroSection";
import ContactCards from "./_components/ContactCards";
import LocationInfo from "./_components/LocationInfo";
import FAQSection from "./_components/FAQSection";
import CTABanner from "./_components/CTABanner";
import { getActiveFaqs } from "@/src/features/cms/services/faqs";
import { getActiveContacts } from "@/src/features/cms/services/contacts";
import { toWhatsAppLink } from "@/src/lib/contact-icons";

export default async function KontakPage() {
  const [faqs, contacts] = await Promise.all([
    getActiveFaqs(),
    getActiveContacts(),
  ]);
  const whatsappContact = contacts.find(
    (contact) => contact.type === "WHATSAPP",
  );

  return (
    <main className="pt-16">
      <HeroSection />
      <ContactCards />
      <LocationInfo />
      <FAQSection
        faqs={faqs}
        whatsappHref={
          whatsappContact ? toWhatsAppLink(whatsappContact.value) : undefined
        }
      />
      <CTABanner />
    </main>
  );
}
