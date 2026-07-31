const programKeahlian = [
  "Teknik Otomotif",
  "Pengembangan Perangkat Lunak & GIM",
  "Teknik Jaringan Komputer & Telekomunikasi",
  "Manajemen Perkantoran & Layanan Bisnis",
  "Akuntansi & Keuangan Lembaga",
];

const biayaList = [
  {
    no: 1,
    uraian: "Pendaftaran",
    biaya: [350000, 350000, 350000, 350000, 350000],
  },
  {
    no: 2,
    uraian: "Seragam Program Keahlian",
    biaya: [200000, 200000, 200000, 200000, 200000],
  },
  {
    no: 3,
    uraian: "Seragam Olah Raga",
    biaya: [135000, 135000, 135000, 135000, 135000],
  },
  {
    no: 4,
    uraian: "Seragam Batik",
    biaya: [115000, 115000, 115000, 115000, 115000],
  },
  {
    no: 5,
    uraian: "Seragam Muslim",
    biaya: [175000, 175000, 175000, 175000, 175000],
  },
  {
    no: 6,
    uraian: "Seragam Hizbul Wathan",
    biaya: [185000, 185000, 185000, 185000, 185000],
  },
  {
    no: 7,
    uraian: "Atribut Hizbul Wathan",
    biaya: [75000, 75000, 75000, 75000, 75000],
  },
  {
    no: 8,
    uraian: "Seragam Wearpack",
    biaya: [225000, null, null, null, null],
  },
  {
    no: 9,
    uraian: "Seragam Tapak Suci",
    biaya: [130000, 130000, 130000, 130000, 130000],
  },
  {
    no: 10,
    uraian: "Kartu IPM dan Atribut Sekolah",
    biaya: [100000, 100000, 100000, 100000, 100000],
  },
  {
    no: 11,
    uraian: "Photo Kolektif",
    biaya: [70000, 70000, 70000, 70000, 70000],
  },
  {
    no: 12,
    uraian: "MOPDB dan Kepanduan",
    biaya: [300000, 300000, 300000, 300000, 300000],
  },
  {
    no: 13,
    uraian: "Placement Test",
    biaya: [150000, 150000, 150000, 150000, 150000],
  },
  {
    no: 14,
    uraian: "Biaya Praktik",
    biaya: [1500000, 1200000, 1200000, 1000000, 1000000],
  },
  {
    no: 15,
    uraian: "Dana Sumbangan Pembangunan",
    biaya: [1000000, 1000000, 1000000, 1000000, 1000000],
  },
];

const formatRupiah = (value: number | null) => {
  if (value === null) return "-";
  return value.toLocaleString("id-ID");
};

export default function PersyaratanKeuanganSection() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            Persyaratan <span className="text-yellow-600">Keuangan</span>{" "}
          </h2>
          <p className="text-lg text-neutral-900 max-w-2xl mx-auto">
            Untuk menunjang kelancaran proses pendaftaran di SMK Muhammadiyah 2
            Cibiru, calon peserta didik diharapkan memenuhi persyaratan keuangan
            berikut.{" "}
          </p>
        </div>

        <div className="w-full overflow-x-auto bg-white rounded-md p-6 hover:shadow-sm transition-all duration-300 group border border-neutral-100 hover:border-green-500">
          {/* WRAPPER ROUNDED (KUNCI) */}
          <div className="min-w-[1100px] rounded-md overflow-hidden border border-white bg-white">
            <table className="w-full border-separate border-spacing-0 text-sm">
              {/* HEADER */}
              <thead className="bg-green-500 text-white ">
                <tr>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-center border border-white "
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-center border border-white"
                  >
                    Uraian
                  </th>
                  <th
                    colSpan={5}
                    className="px-4 py-3 text-center border border-white"
                  >
                    Program Keahlian
                  </th>
                </tr>
                <tr className="bg-green-500">
                  {programKeahlian.map((item, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-center border border-white"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {biayaList.map((row, index) => (
                  <tr
                    key={row.no}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-green-50"
                    } hover:bg-green-100 transition`}
                  >
                    <td className="px-4 py-3 text-center border border-white">
                      {row.no}
                    </td>
                    <td className="px-4 py-3 border border-white">
                      {row.uraian}
                    </td>
                    {row.biaya.map((value, i) => (
                      <td
                        key={i}
                        className="px-4 py-3 text-right border border-white"
                      >
                        {formatRupiah(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              {/* FOOTER */}
              <tfoot className="bg-green-600 text-white font-semibold">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-center border border-white"
                  >
                    Jumlah
                  </td>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <td
                      key={i}
                      className="px-4 py-3 text-right border border-white"
                    >
                      {formatRupiah(
                        biayaList.reduce(
                          (total, row) => total + (row.biaya[i] || 0),
                          0,
                        ),
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
