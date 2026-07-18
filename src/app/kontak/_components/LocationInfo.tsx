import Image from "next/image";
import type { Metadata } from "next";
import { getGalleryByCategory } from "@/src/features/cms/services/gallery";
import { getActiveContacts } from "@/src/features/cms/services/contacts";
import { getActiveSocialLinks } from "@/src/features/cms/services/social-links";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";
import {
  SOCIAL_ICON_PATHS,
  SOCIAL_GRADIENTS,
  SOCIAL_LABELS,
} from "@/src/lib/social-icons";

export const metadata: Metadata = {
  title: "Kontak & Lokasi",
  description:
    "Hubungi SMK Muhammadiyah 2 Cibiru Bandung via WhatsApp, email, atau kunjungi kami di Jl. Cilengkrang II No. 7, Cibiru, Bandung.",
};

export default async function LocationInfo() {
  const [locationImage, contacts, socialLinks, settings] = await Promise.all([
    getGalleryByCategory("FASILITAS"),
    getActiveContacts(),
    getActiveSocialLinks(),
    getSettingsMap(["maps_url"]),
  ]);
  const emailContact = contacts.find((contact) => contact.type === "EMAIL");
  const mapsUrl =
    settings.maps_url ||
    "https://maps.google.com/?q=SMK+Muhammadiyah+2+Cibiru+Bandung";

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </span>
              Lokasi Sekolah
            </h2>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-72">
                {locationImage && locationImage.length > 0 && (
                  <Image
                    src={locationImage[0].image}
                    alt={locationImage[0].title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-primary-900/30" />
              </div>
              <div className="p-6">
                <address className="not-italic text-neutral-700 leading-relaxed mb-4">
                  <strong className="text-neutral-900">
                    SMK Muhammadiyah 2 Cibiru
                  </strong>
                  <br />
                  Jl. Cilengkrang II No. 7<br />
                  Kel. Palasari, Kec. Cibiru
                  <br />
                  Kota Bandung, Jawa Barat 40615
                </address>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
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

          {/* Info Cards */}
          <div className="space-y-6">
            {/* Operating Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Jam Operasional
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">Senin - Jumat</span>
                  <span className="font-semibold text-neutral-900">
                    07.00 - 15.00 WIB
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-600">
                    Sabtu (Ekstrakurikuler)
                  </span>
                  <span className="font-semibold text-neutral-900">
                    07.00 - 12.00 WIB
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-600">Minggu & Hari Libur</span>
                  <span className="font-semibold text-red-500">Tutup</span>
                </div>
              </div>
            </div>

            {/* Other Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                </span>
                Kontak Lainnya
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-neutral-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Website</p>
                    <p className="font-semibold text-neutral-900">
                      smkm2.sch.id
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-neutral-600"
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
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <p className="font-semibold text-neutral-900">
                      {emailContact?.value ?? "info@smkm2.sch.id"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                  Ikuti Kami
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${SOCIAL_GRADIENTS[social.platform]} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={SOCIAL_ICON_PATHS[social.platform]} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {SOCIAL_LABELS[social.platform]}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {social.username ?? social.url}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
