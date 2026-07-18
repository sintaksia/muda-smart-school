import { ContactLocationSection as SharedContactLocationSection } from "@/src/components/common/ContactLocationSection";
import { getActiveContacts } from "@/src/features/cms/services/contacts";
import { getActiveSocialLinks } from "@/src/features/cms/services/social-links";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";

export default async function ContactLocationSection() {
  const [contacts, socialLinks, settings] = await Promise.all([
    getActiveContacts(),
    getActiveSocialLinks(),
    getSettingsMap([
      "maps_url",
      "address_line1",
      "address_line2",
      "address_line3",
      "postal_code",
    ]),
  ]);

  const whatsappContacts = contacts.filter(
    (contact) => contact.type === "WHATSAPP",
  );
  const instagramLink =
    socialLinks.find((link) => link.platform === "INSTAGRAM") ?? null;

  return (
    <SharedContactLocationSection
      className="mt-20"
      mapImageSrc="/gambar-4.jpg"
      mapImageAlt="Lokasi Sekolah"
      mapsUrl={settings.maps_url || "https://maps.google.com"}
      addressLine1={settings.address_line1 || undefined}
      addressLine2={settings.address_line2 || undefined}
      addressLine3={settings.address_line3 || undefined}
      postalCode={settings.postal_code || undefined}
      whatsappContacts={whatsappContacts}
      instagramLink={instagramLink}
    />
  );
}
