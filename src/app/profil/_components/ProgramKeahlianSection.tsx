import { getActivePrograms } from "@/src/features/cms/services/programs";
import { ProgramCard } from "@/src/features/cms/components/ProgramCard";

export default async function ProgramKeahlianSection() {
  const programs = await getActivePrograms();

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Program Keahlian
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Pilihan <span className="text-primary-600">Kompetensi</span>{" "}
            Keahlian
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
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
              className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-sm hover:bg-neutral-100 transition-colors"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
