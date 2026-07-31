import { FilePenLine } from "lucide-react";

const informasiGelombang = [
  {
    name: "Gelombang 1",
    date: "19 Januari 2026 - 31 Maret 2026",
    discount: "50%",
    descriptions: "Discount Dana Sumbangan Pembangunan Sebesar 50%",
  },
  {
    name: "Gelombang 2",
    date: "1 April 2026 - 26 Juni 2026",
    discount: "25%",
    descriptions: "Discount Dana Sumbangan Pembangunan Sebesar 25%",
  },
  {
    name: "Gelombang 3",
    date: "27 Juni 2026 - Juli 2026",
    discount: "",
    descriptions:
      "Pendaftaran reguler tanpa potongan Dana Sumbangan Pembangunan.",
  },
];

export default function GelombangPendaftaran() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-340 mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-32 relative z-20">
          {informasiGelombang.map((gelombang, index) => (
            <span
              key={gelombang.name}
              className="bg-white rounded-md p-6 hover:shadow-sm transition-all duration-300 group border border-neutral-100 hover:border-yellow-500"
            >
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">
                    {gelombang.name}
                  </h3>
                  <p className="text-lg font-bold text-green-500 group-hover:text-yellow-600 transition-colors">
                    {gelombang.date}
                  </p>
                  <p className="text-sm text-neutral-900 mt-2">
                    {gelombang.descriptions}
                  </p>
                </div>
                <div className="w-16 h-16 bg-yellow-300 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  {gelombang.discount ? (
                    <span className="text-xl font-bold text-green-900">
                      {gelombang.discount}
                    </span>
                  ) : (
                    <FilePenLine className="size-8 text-green-900" />
                  )}
                </div>
              </div>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
