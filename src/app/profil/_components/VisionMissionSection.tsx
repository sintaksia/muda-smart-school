import { getActiveAchievements } from "@/src/features/cms/services/achievements";
import { getSettingsMap } from "@/src/features/cms/services/school-settings";
import type { Achievement } from "@/src/features/cms/services/achievements";

const defaultMissions = [
  "Memotivasi Peserta Didik dalam meningkatkan pengetahuan dan wawasan intelektual.",
  "Memiliki kemampuan ilmu pengetahuan, penguasaan teknologi, daya analitik, kreatif, inovatif, profesional dan berwawasan luas.",
  "Meningkatkan keahlian (skill), terampil dalam kompetensi keahlian di bidangnya masing-masing.",
  "Mengembangkan potensi Peserta Didik melalui kegiatan ekstrakurikuler dan pembinaan kedisiplinan.",
  "Meningkatkan daya saing untuk siap memasuki lapangan dunia usaha/industri.",
  "Menumbuhkembangkan jiwa wirausaha yang tangguh dalam bidangnya masing-masing.",
];

const defaultVision =
  "Mewujudkan lulusan yang cerdas, berkualitas, terampil, kompetitif, berjiwa wirausaha, berkemajuan, dan berakhlak karimah.";

export default async function VisionMissionSection() {
  const [allPrestasi, settings]: [Achievement[], Record<string, string>] =
    await Promise.all([
      getActiveAchievements(),
      getSettingsMap(["vision_text", "missions"]),
    ]);

  const prestasiList = allPrestasi.slice(0, 12);

  const visionText = settings.vision_text || defaultVision;

  let misiList: string[] = defaultMissions;
  try {
    const parsed: unknown = settings.missions
      ? JSON.parse(settings.missions)
      : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      misiList = parsed as string[];
    }
  } catch {
    // keep defaults
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Vision - Compact Quote Style */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-yellow-900"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <div>
              <span className="text-primary-300 text-sm font-medium">
                Visi Sekolah
              </span>
              <p className="text-white text-lg md:text-xl font-medium leading-relaxed mt-1">
                {visionText}
              </p>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-400 rounded-full"></span>
            Misi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {misiList.map((misi, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-200"
              >
                <span className="w-6 h-6 bg-yellow-400 rounded text-yellow-900 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {misi}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Row */}
        {prestasiList.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
              Prestasi Siswa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {prestasiList.map((prestasi) => (
                <div
                  key={prestasi.id}
                  className="bg-white rounded-lg p-4 border border-neutral-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prestasi.level === "NATIONAL" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                    >
                      {prestasi.level}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-800 text-sm">
                    {prestasi.title}
                  </h3>
                  <p className="text-neutral-500 text-xs mt-1">
                    {prestasi.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
