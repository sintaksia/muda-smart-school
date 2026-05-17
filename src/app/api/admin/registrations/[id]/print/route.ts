import { NextResponse } from "next/server";
import { getRegistrationById } from "@/src/features/registration/services";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Validasi",
  DIVERIFIKASI: "Terverifikasi",
  DITERIMA: "Diterima",
  DITOLAK: "Ditolak",
};

const PROGRAM_LABEL: Record<string, string> = {
  PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM:
    "Pengembangan Perangkat Lunak dan Gim (PPLG)",
  TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI:
    "Teknik Jaringan Komputer dan Telekomunikasi (TJKT)",
  TEKNIK_OTOMOTIF: "Teknik Kendaraan Ringan Otomotif (TKRO)",
  MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS:
    "Manajemen Perkantoran dan Layanan Bisnis (MPLB)",
  AKUNTANSI_DAN_KEUANGAN_LEMBAGA: "Akuntansi dan Keuangan Lembaga (AKL)",
};

const PENDIDIKAN_LABEL: Record<string, string> = {
  SD: "SD / Sederajat",
  SMP: "SMP / Sederajat",
  SMA: "SMA / Sederajat",
  SMK: "SMK / Sederajat",
  D1: "D1",
  D2: "D2",
  D3: "D3",
  D4: "D4",
  S1: "S1 / Sarjana",
  S2: "S2 / Magister",
  S3: "S3 / Doktor",
  TIDAK_SEKOLAH: "Tidak Sekolah",
};

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function row(
  label: string,
  value: string | null | undefined,
  full = false,
): string {
  return `<div class="info-item${full ? " full" : ""}">
    <div class="label">${label}</div>
    <div class="value">${value || "-"}</div>
  </div>`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reg = await getRegistrationById(id);

  if (!reg) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const statusClass = `status-${reg.status}`;
  const statusText = STATUS_LABEL[reg.status] ?? reg.status;
  const programText = PROGRAM_LABEL[reg.programKeahlian] ?? reg.programKeahlian;
  const pendidikanAyah =
    PENDIDIKAN_LABEL[reg.pendidikanAyah] ?? reg.pendidikanAyah;
  const pendidikanIbu =
    PENDIDIKAN_LABEL[reg.pendidikanIbu] ?? reg.pendidikanIbu;
  const pendidikanWali = reg.pendidikanWali
    ? (PENDIDIKAN_LABEL[reg.pendidikanWali] ?? reg.pendidikanWali)
    : "-";

  const waliSection = reg.namaWali
    ? `<p class="sub-heading">Data Wali ${reg.hubunganWali ? `(${reg.hubunganWali})` : ""}</p>
       <div class="info-grid">
         ${row("Nama Wali", reg.namaWali)}
         ${row("Tahun Lahir", reg.tahunLahirWali?.toString())}
         ${row("Pendidikan", pendidikanWali)}
         ${row("Pekerjaan", reg.pekerjaanWali)}
         ${row("No. Telepon", reg.noTelpWali)}
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Formulir Pendaftaran – ${reg.namaLengkap}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #000;
      background: #f5f5f5;
    }

    /* ── PRINT CONTROLS ── */
    .print-controls {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 999;
    }
    .btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-family: system-ui, sans-serif;
      font-weight: 600;
      transition: opacity .15s;
    }
    .btn:hover { opacity: .85; }
    .btn-back  { background: #fff; border: 1px solid #ccc; color: #333; }
    .btn-print { background: #32368C; border: none; color: #fff; }

    @page { margin: 0; }

    @media print {
      .print-controls { display: none !important; }
      body { background: #fff; }
      .page { margin: 0; padding: 15mm 20mm; box-shadow: none; }
      .section { page-break-inside: avoid; }
    }

    /* ── PAGE ── */
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      padding: 15mm 20mm;
      background: #fff;
      box-shadow: 0 2px 20px rgba(0,0,0,.1);
    }

    /* ── KOP SURAT ── */
    .kop {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid #32368C;
      padding-bottom: 10px;
      margin-bottom: 4px;
    }
    .kop-logo {
      width: 68px;
      height: 68px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .kop-text .school-name {
      font-size: 16pt;
      font-weight: 700;
      color: #32368C;
      line-height: 1.2;
    }
    .kop-text .school-sub { font-size: 9pt; color: #444; margin-top: 2px; }
    .kop-text .school-addr { font-size: 8.5pt; color: #555; margin-top: 3px; }
    .sub-border { height: 2px; background: #F2C94C; margin-bottom: 14px; }

    /* ── TITLE ── */
    .doc-title { text-align: center; margin-bottom: 12px; }
    .doc-title h2 {
      font-size: 13pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      text-decoration: underline;
    }
    .doc-title p { font-size: 9.5pt; color: #333; margin-top: 3px; }

    /* ── META ── */
    .reg-meta {
      display: flex;
      justify-content: space-between;
      background: #f0f4ff;
      border: 1px solid #c7cdf0;
      border-radius: 4px;
      padding: 8px 14px;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    .meta-label { font-size: 8pt; color: #555; font-weight: 600; display: block; }
    .meta-value { font-weight: 700; color: #32368C; margin-top: 1px; display: block; }

    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 8.5pt;
      font-weight: 700;
    }
    .status-PENDING      { background: #FFF3CD; color: #856404; border: 1px solid #F2C94C; }
    .status-DITERIMA     { background: #D1F0E8; color: #155724; border: 1px solid #4CAF93; }
    .status-DITOLAK      { background: #FDECEA; color: #842029; border: 1px solid #dc3545; }
    .status-DIVERIFIKASI { background: #D0EAFF; color: #0c5460; border: 1px solid #0dcaf0; }

    /* ── SECTION ── */
    .section { margin-bottom: 14px; }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #fff;
      background: #32368C;
      padding: 4px 10px;
    }
    .section-body {
      border: 1px solid #c7cdf0;
      border-top: none;
      padding: 8px 10px;
    }
    .sub-heading {
      font-size: 9.5pt;
      font-weight: 700;
      color: #32368C;
      margin: 8px 0 4px;
    }
    .sub-heading:first-child { margin-top: 0; }

    /* ── INFO GRID ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      margin-bottom: 4px;
    }
    .info-item {
      padding: 4px 8px;
      border-bottom: 1px dotted #ddd;
    }
    .info-item:nth-child(odd) { border-right: 1px solid #e8e8e8; }
    .info-item.full { grid-column: 1 / -1; }
    .label { font-size: 8pt; color: #555; font-weight: 600; }
    .value { font-size: 9.5pt; color: #000; margin-top: 1px; }

    /* ── SIGNATURES ── */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
    }
    .sig-block { text-align: center; }
    .sig-block p { font-size: 9pt; }
    .sig-line {
      width: 130px;
      border-bottom: 1px solid #000;
      margin: 48px auto 4px;
    }
    .sig-name { font-size: 9pt; font-weight: 700; }
    .sig-role { font-size: 8pt; color: #555; }

    /* ── FOOTER ── */
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 8pt;
      color: #888;
      border-top: 1px solid #e0e0e0;
      padding-top: 6px;
    }
  </style>
</head>
<body>

<!-- Print Controls -->
<div class="print-controls">
  <button class="btn btn-back" onclick="window.close()">&#8592; Kembali</button>
  <button class="btn btn-print" onclick="window.print()">&#128424; Cetak / Simpan PDF</button>
</div>

<div class="page">

  <!-- KOP SURAT -->
  <div class="kop">
    <img class="kop-logo" src="/logo.jpg" alt="Logo SMK Muhammadiyah 2 Cibiru" />
    <div class="kop-text">
      <div class="school-name">SMK Muhammadiyah 2 Cibiru</div>
      <div class="school-sub">Sekolah Menengah Kejuruan &bull; Terakreditasi A (Unggul)</div>
      <div class="school-addr">Jl. Raya Cibiru, Cibiru, Bandung, Jawa Barat &bull; smkmuhammadiyah2cibiru.sch.id</div>
    </div>
  </div>
  <div class="sub-border"></div>

  <!-- TITLE -->
  <div class="doc-title">
    <h2>Formulir Data Pendaftaran Peserta Didik Baru</h2>
    <p>Penerimaan Peserta Didik Baru (PPDB) Tahun Pelajaran 2026/2027</p>
  </div>

  <!-- META -->
  <div class="reg-meta">
    <div>
      <span class="meta-label">No. Pendaftaran</span>
      <span class="meta-value">${reg.nomorPendaftaran ?? "-"}</span>
    </div>
    <div>
      <span class="meta-label">Tanggal Pendaftaran</span>
      <span class="meta-value">${formatDate(reg.tanggalPendaftaran)}</span>
    </div>
    <div>
      <span class="meta-label">Status</span>
      <span class="status-badge ${statusClass}">${statusText}</span>
    </div>
  </div>

  <!-- SECTION 1: DATA PRIBADI -->
  <div class="section">
    <div class="section-title">1. Data Pribadi Calon Peserta Didik</div>
    <div class="section-body">
      <div class="info-grid">
        ${row("Nama Lengkap", reg.namaLengkap)}
        ${row("Jenis Kelamin", reg.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan")}
        ${row("Program Keahlian", programText, true)}
        ${row("NISN", reg.nisn)}
        ${row("NIK", reg.nik)}
        ${row("No. KK", reg.nomorKk)}
        ${row("Tempat Lahir", reg.tempatLahir)}
        ${row("Tanggal Lahir", formatDate(reg.tanggalLahir))}
        ${row("No. HP Siswa", reg.noHpMurid)}
        ${row("Email Siswa", reg.emailMurid)}
      </div>
    </div>
  </div>

  <!-- SECTION 2: ALAMAT -->
  <div class="section">
    <div class="section-title">2. Alamat Tempat Tinggal</div>
    <div class="section-body">
      <div class="info-grid">
        ${row("Alamat Jalan", reg.alamatJalan, true)}
        ${row("RT", reg.rt)}
        ${row("RW", reg.rw)}
        ${row("Kelurahan / Desa", reg.kelurahanDesa)}
        ${row("Kecamatan", reg.kecamatan)}
        ${row("Kota / Kabupaten", reg.kotaKabupaten)}
        ${row("Provinsi", reg.provinsi)}
        ${row("Kode Pos", reg.kodePos)}
      </div>
    </div>
  </div>

  <!-- SECTION 3: ORANG TUA -->
  <div class="section">
    <div class="section-title">3. Data Orang Tua / Wali</div>
    <div class="section-body">
      <p class="sub-heading">Data Ayah</p>
      <div class="info-grid">
        ${row("Nama Ayah", reg.namaAyah)}
        ${row("Tahun Lahir", reg.tahunLahirAyah?.toString())}
        ${row("Pendidikan", pendidikanAyah)}
        ${row("Pekerjaan", reg.pekerjaanAyah)}
        ${row("No. Telepon", reg.noTelpAyah)}
      </div>

      <p class="sub-heading">Data Ibu</p>
      <div class="info-grid">
        ${row("Nama Ibu", reg.namaIbu)}
        ${row("Tahun Lahir", reg.tahunLahirIbu?.toString())}
        ${row("Pendidikan", pendidikanIbu)}
        ${row("Pekerjaan", reg.pekerjaanIbu)}
        ${row("No. Telepon", reg.noTelpIbu)}
      </div>

      ${waliSection}
    </div>
  </div>

  <!-- SECTION 4: SEKOLAH ASAL -->
  <div class="section">
    <div class="section-title">4. Sekolah Asal</div>
    <div class="section-body">
      <div class="info-grid">
        ${row("Nama Sekolah", reg.namaAsalSekolah)}
        ${row("NPSN", reg.npsnAsalSekolah)}
        ${row("Alamat Sekolah", reg.alamatAsalSekolah, true)}
        ${row("Tahun Lulus", reg.tahunLulus.toString())}
      </div>
    </div>
  </div>

  <!-- TANDA TANGAN -->
  <div class="signature-section">
    <div class="sig-block">
      <p>Mengetahui,</p>
      <p>Orang Tua / Wali Peserta Didik</p>
      <div class="sig-line"></div>
      <p class="sig-name">( ________________________________ )</p>
    </div>
    <div class="sig-block">
      <p>Bandung, ${printDate}</p>
      <p>Peserta Didik</p>
      <div class="sig-line"></div>
      <p class="sig-name">( ${reg.namaLengkap} )</p>
    </div>
    <div class="sig-block">
      <p>Mengesahkan,</p>
      <p>Kepala Sekolah</p>
      <div class="sig-line"></div>
      <p class="sig-name">( ________________________________ )</p>
      <p class="sig-role">NIP. ________________________</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    Dokumen ini dicetak oleh sistem PPDB SMK Muhammadiyah 2 Cibiru &bull;
    Dicetak pada ${printDate}
  </div>

</div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
