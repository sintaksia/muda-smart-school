import { Files } from "lucide-react";

const persyaratanList = [
  "Mengisi formulir pendaftaran yang telah disediakan",
  "Menyerahkan 3 lembar fotokopi ijazah SMP/MTs yang disahkan oleh Kepala Sekolah yang bersangkutan",
  "Menyerahkan 3 lembar fotokopi Surat Tanda Kelulusan",
  "Menyerahkan Surat Keterangan Kelakuan Baik dari sekolah yang bersangkutan",
  "Menyerahkan 3 lembar fotokopi Akta Kelahiran, Kartu Keluarga (KK), dan KTP orang tua",
  "Menyerahkan 3 lembar fotokopi KIP, KPS, KKS, PKH, DTKS (bagi yang memiliki)",
  "Menandatangani Surat Perjanjian Siswa di atas materai Rp10.000",
];

export default function PersyaratanAdministrasiSection() {
  return (
    <section className="py-16 md:py-18 bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Files className="size-8 text-yellow-900" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-2">
            Persyaratan{" "}
            <span className="text-yellow-600">Administrasi</span>{" "}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Berikut ini adalah persyaratan administrasi yang harus dipersiapkan
            oleh calon peserta didik untuk pendaftaran di SMK Muhammadiyah 2
            Cibiru.
          </p>
        </div>

        {/* List Persyaratan */}
        <div className=" bg-white rounded-md p-8 hover:shadow-sm transition-all duration-300 group border border-neutral-100 hover:border-emerald-500 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="lg:col space-y-3 mx-auto">
              {persyaratanList.map((misi, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-neutral-50 rounded-md p-3 border border-neutral-200"
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
        </div>
      </div>
    </section>
  );
}
