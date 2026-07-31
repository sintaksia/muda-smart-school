import Image from "next/image";
import { version } from "../../../../package.json";
import { getActiveContacts } from "@/src/features/cms/services/contacts";
import { getActiveSocialLinks } from "@/src/features/cms/services/social-links";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";
import { CONTACT_ICON_PATHS, CONTACT_ICON_FILL } from "@/src/lib/contact-icons";
import { SOCIAL_ICON_PATHS } from "@/src/lib/social-icons";

export default async function Footer() {
  const [contacts, socialLinks, settings] = await Promise.all([
    getActiveContacts(),
    getActiveSocialLinks(),
    getSettingsMap([
      "address_line1",
      "address_line2",
      "address_line3",
      "postal_code",
    ]),
  ]);

  const addressLine1 = settings.address_line1 || "Jl. Cilengkrang II No. 7";
  const addressLine2 = settings.address_line2 || "Kel. Palasari, Kec. Cibiru";
  const addressLine3 = settings.address_line3 || "Kota Bandung, Jawa Barat";
  const postalCode = settings.postal_code || "40615";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src="/logo.jpg"
                alt="Logo SMK Muhammadiyah 2 Cibiru"
                width={64}
                height={64}
                className="rounded-sm"
              />
              <div>
                <h3 className="text-xl font-bold">SMK Muhammadiyah 2 Cibiru</h3>
                <p className="text-gray-400 text-sm">Terakreditasi A</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Lembaga pendidikan kejuruan yang berkomitmen mencetak lulusan
              kompeten, berkarakter Islami, dan siap bersaing di era global.
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-400"
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
              Lokasi
            </h4>
            <address className="text-gray-400 not-italic leading-relaxed">
              {addressLine1}
              <br />
              {addressLine2}
              <br />
              {addressLine3}
              <br />
              {postalCode}
            </address>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-400"
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
              Kontak
            </h4>
            <ul className="space-y-3 text-gray-400">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-gray-500 shrink-0"
                    fill={
                      CONTACT_ICON_FILL[contact.type] === "fill"
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={CONTACT_ICON_PATHS[contact.type]}
                    />
                  </svg>
                  {contact.value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <p className="text-gray-500 text-sm">
              &copy; 2026 SMK Muhammadiyah 2 Cibiru. All rights reserved.
            </p>
            <span className="text-xs font-mono text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
              v{version}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                aria-label={social.platform}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={SOCIAL_ICON_PATHS[social.platform]} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
