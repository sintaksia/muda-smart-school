import Image from "next/image";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";

export default async function HeroSection() {
  const settings = await getSettingsMap([
    "school_name",
    "school_tagline",
    "school_logo",
    "accreditation_grade",
  ]);

  const schoolName = settings.school_name || "SMK Muhammadiyah 2 Cibiru";
  const tagline =
    settings.school_tagline ||
    "Lembaga pendidikan kejuruan yang berkomitmen mencetak generasi muda yang kompeten, berkarakter, dan siap menghadapi tantangan dunia kerja.";
  const logo = settings.school_logo || "/logo.jpg";
  const accreditation = settings.accreditation_grade || "A";

  return (
    <section className="relative bg-primary-900 py-20 md:py-28 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-400 text-sm font-medium">
                Profil Sekolah
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              {schoolName}
            </h1>
            <p className="text-lg md:text-xl text-primary-200 leading-relaxed">
              {tagline}
            </p>
          </div>

          {/* School Badge */}
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-md p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <Image
                  src={logo}
                  alt={`Logo ${schoolName}`}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <div>
                  <p className="text-yellow-400 font-semibold text-sm">
                    Terakreditasi
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {accreditation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
