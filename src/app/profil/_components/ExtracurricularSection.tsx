import { getActiveExtracurriculars } from "@/src/features/cms/services/extracurriculars";
import { ekskulCategories } from "@/src/app/admin/cms/extracurriculars/_components/ExtracurricularSchema";

const getCategoryLabel = (category: string): string => {
  return ekskulCategories.find((c) => c.value === category)?.label || category;
};

export default async function ExtracurricularSection() {
  const extracurriculars = await getActiveExtracurriculars();

  if (extracurriculars.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Ekstrakurikuler
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Kembangkan <span className="text-yellow-600">Bakat & Minat</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Berbagai kegiatan ekstrakurikuler untuk mengembangkan potensi siswa
            di luar akademik
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {extracurriculars.map((ekskul) => (
            <div
              key={ekskul.id}
              className="bg-white rounded-md p-5 border border-yellow-200 hover:border-yellow-400 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {ekskul.icon ? (
                    <svg
                      className="w-6 h-6 text-yellow-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={ekskul.icon}
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-yellow-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 text-sm">
                    {ekskul.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {getCategoryLabel(ekskul.category)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
