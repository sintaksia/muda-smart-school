import Image from "next/image";
import type { Contact, SocialLink } from "@prisma/client";
import { toWhatsAppLink, CONTACT_ICON_PATHS } from "@/src/lib/contact-icons";
import { SOCIAL_ICON_PATHS, SOCIAL_GRADIENTS } from "@/src/lib/social-icons";

interface ContactLocationSectionProps {
  className?: string;
  mapImageSrc?: string;
  mapImageAlt?: string;
  mapsUrl: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  postalCode?: string;
  whatsappContacts: Pick<Contact, "id" | "name" | "value">[];
  instagramLink?: Pick<SocialLink, "platform" | "url" | "username"> | null;
}

export function ContactLocationSection({
  className = "",
  mapImageSrc,
  mapImageAlt,
  mapsUrl,
  addressLine1 = "Jl. Cilengkrang II No. 7",
  addressLine2 = "Kel. Palasari, Kec. Cibiru",
  addressLine3 = "Kota Bandung, Jawa Barat",
  postalCode = "40615",
  whatsappContacts,
  instagramLink,
}: ContactLocationSectionProps) {
  return (
    <section
      className={`py-16 md:py-24 bg-primary-900 text-white ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Location */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Lokasi Kami
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Kunjungi <span className="text-green-400">Sekolah Kami</span>
            </h2>
            <address className="not-italic text-lg text-primary-200 leading-relaxed mb-8">
              {addressLine1}
              <br />
              {addressLine2}
              <br />
              {addressLine3}
              <br />
              {postalCode}
            </address>

            {/* Map Placeholder */}
            <div className="relative h-64 rounded-md overflow-hidden border-4 border-white/10">
              {mapImageSrc && (
                <Image
                  src={mapImageSrc}
                  alt={mapImageAlt ?? "Lokasi Sekolah"}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-primary-900/40 flex items-center justify-center">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary-900 font-semibold px-6 py-3 rounded-sm hover:bg-primary-50 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right - Contact */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Hubungi Kami
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ada <span className="text-yellow-400">Pertanyaan?</span>
            </h2>
            <p className="text-primary-200 mb-8">
              Silakan hubungi kami melalui kontak di bawah ini untuk informasi
              lebih lanjut.
            </p>

            <div className="space-y-4">
              {whatsappContacts.map((contact) => (
                <a
                  key={contact.id}
                  href={toWhatsAppLink(contact.value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-md p-4 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={CONTACT_ICON_PATHS.WHATSAPP} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{contact.name}</p>
                    <p className="text-primary-300">{contact.value}</p>
                  </div>
                </a>
              ))}

              {instagramLink && (
                <a
                  href={instagramLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white/10 hover:bg-white/20 rounded-md p-4 transition-colors group"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${SOCIAL_GRADIENTS[instagramLink.platform]} rounded-sm flex items-center justify-center`}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={SOCIAL_ICON_PATHS[instagramLink.platform]} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Instagram</p>
                    <p className="text-primary-300">
                      {instagramLink.username
                        ? `@${instagramLink.username}`
                        : instagramLink.url}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
