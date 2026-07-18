import { ContactLocationSection as SharedContactLocationSection } from "@/src/components/common/ContactLocationSection";
import { getGalleryByCategory } from "@/src/features/cms/services/gallery";
import { getActiveContacts } from "@/src/features/cms/services/contacts";
import { getActiveSocialLinks } from "@/src/features/cms/services/social-links";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";

export default async function ContactLocationSection() {
  const [locationImage, contacts, socialLinks, settings] = await Promise.all([
    getGalleryByCategory("FASILITAS"),
    getActiveContacts(),
    getActiveSocialLinks(),
    getSettingsMap(["maps_url"]),
  ]);

  const image =
    locationImage && locationImage.length > 0 ? locationImage[0] : null;
  const whatsappContacts = contacts.filter(
    (contact) => contact.type === "WHATSAPP",
  );
  const instagramLink =
    socialLinks.find((link) => link.platform === "INSTAGRAM") ?? null;

  return (
    <SharedContactLocationSection
      mapImageSrc={image?.image}
      mapImageAlt={image?.title}
      mapsUrl={settings.maps_url || "https://maps.app.goo.gl/KWVHqBTM4Ndg3uP17"}
      whatsappContacts={whatsappContacts}
      instagramLink={instagramLink}
    />
  );
}
