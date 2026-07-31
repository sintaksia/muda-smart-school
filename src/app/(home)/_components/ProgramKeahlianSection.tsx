import { getActivePrograms } from "@/src/features/cms/services/programs";
import { ProgramCard } from "@/src/features/cms/components/ProgramCard";

export default async function ProgramKeahlianSection() {
  const programs = await getActivePrograms();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Program <span className="text-primary-600">Keahlian</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilihan kompetensi keahlian yang dapat dipilih sesuai minat dan
            bakat siswa
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}

          {/* CTA Card */}
          <div className="group bg-gradient-to-br from-primary-500 to-primary-700 rounded-md p-6 flex flex-col justify-center items-center text-center text-white hover:shadow-sm transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-sm flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Tertarik Bergabung?</h3>
            <p className="text-white/80 mb-5">
              Daftarkan diri Anda sekarang dan raih masa depan cerah bersama
              kami!
            </p>
            <a
              href="/registrasi"
              className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-sm hover:bg-gray-100 transition-colors"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
