import { NextResponse } from "next/server";
import { getRegistrationById } from "@/src/features/registration/services";
import {
  PROGRAM_KEAHLIAN_LABELS,
  PENDIDIKAN_LABELS,
  STATUS_PENDAFTARAN_LABELS,
} from "@/src/lib/constants";

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
  const statusText = STATUS_PENDAFTARAN_LABELS[reg.status] ?? reg.status;
  const programText =
    PROGRAM_KEAHLIAN_LABELS[reg.programKeahlian] ?? reg.programKeahlian;
  const pendidikanAyah =
    PENDIDIKAN_LABELS[reg.pendidikanAyah] ?? reg.pendidikanAyah;
  const pendidikanIbu =
    PENDIDIKAN_LABELS[reg.pendidikanIbu] ?? reg.pendidikanIbu;
  const pendidikanWali = reg.pendidikanWali
    ? (PENDIDIKAN_LABELS[reg.pendidikanWali] ?? reg.pendidikanWali)
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
      background: #e8e8e8;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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

    /* Margins live on @page so EVERY printed page (incl. page 2) gets them */
    @page { size: A4; margin: 12mm 16mm; }

    /* ── PAGE (base) ── */
    .page {
      background: #fff;
      padding: 14mm 16mm;
    }

    /* On-screen preview only: A4 frame + shadow */
    @media screen {
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 24px auto;
        box-shadow: 0 2px 20px rgba(0,0,0,.12);
      }
    }

    /* Print: @page handles margins, so strip the on-page padding & shadow */
    @media print {
      .print-controls { display: none !important; }
      html, body { background: #fff; }
      .page {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .section { page-break-inside: avoid; }
      .signature-section { page-break-inside: avoid; }
    }

    /* ── KOP SURAT ── */
    .kop {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 4px;
    }
    .kop-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .kop-text {
      flex: 1;
      text-align: center;
      line-height: 1.3;
    }
    .kop-text .org-top    { font-size: 11pt; font-weight: 700; color: #000; }
    .kop-text .org-mid    { font-size: 10.5pt; font-weight: 700; color: #000; }
    .kop-text .school-name { font-size: 15pt; font-weight: 700; color: #000; margin-top: 2px; }
    .kop-text .school-sub  { font-size: 11pt; font-weight: 700; color: #000; }
    .kop-text .school-addr { font-size: 8.5pt; color: #000; margin-top: 3px; }
    .sub-border { height: 2px; background: #000; margin-bottom: 14px; }

    /* ── TITLE ── */
    .doc-title { text-align: center; margin-bottom: 12px; }
    .doc-title h2 {
      font-size: 13pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .5px;
      text-decoration: underline;
    }
    .doc-title p { font-size: 12pt; font-weight: 700; color: #000; margin-top: 3px; }

    /* ── META ── */
    .reg-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: #f0f4ff;
      border: 1px solid #c7cdf0;
      border-radius: 4px;
      padding: 10px 16px;
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
    .section { margin-bottom: 12px; }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #fff;
      background: #32368C;
      padding: 5px 12px;
      letter-spacing: .3px;
    }
    .section-body {
      border: 1px solid #c7cdf0;
      border-top: none;
      padding: 10px 12px;
    }
    .sub-heading {
      font-size: 9.5pt;
      font-weight: 700;
      color: #32368C;
      margin: 12px 0 6px;
      padding-bottom: 3px;
      border-bottom: 1px solid #e2e5f0;
    }
    .sub-heading:first-child { margin-top: 0; }

    /* ── INFO GRID ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #e2e5f0;
      border-bottom: none;
      border-right: none;
    }
    .info-grid + .sub-heading { margin-top: 12px; }
    .info-item {
      padding: 5px 10px;
      border-bottom: 1px solid #e2e5f0;
      border-right: 1px solid #e2e5f0;
    }
    .info-item.full { grid-column: 1 / -1; }
    .label { font-size: 8pt; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: .2px; }
    .value { font-size: 9.5pt; color: #000; margin-top: 2px; min-height: 12pt; }

    /* ── SIGNATURES ── */
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
      padding-top: 12px;
    }
    .sig-block { text-align: left; }
    .sig-block p { font-size: 9.5pt; line-height: 1.5; }
    .sig-line {
      width: 200px;
      border-bottom: 1px solid #000;
      margin: 52px 0 4px;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 22px;
      text-align: center;
      font-size: 8pt;
      color: #888;
      border-top: 1px solid #e0e0e0;
      padding-top: 8px;
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
      <div class="org-top">PIMPINAN DAERAH MUHAMMADIYAH KOTA BANDUNG</div>
      <div class="org-mid">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NONFORMAL</div>
      <div class="school-name">SMK MUHAMMADIYAH 2 CIBIRU</div>
      <div class="school-sub">TERAKREDITASI &ldquo;A&rdquo; ( UNGGUL )</div>
      <div class="school-addr">Sekretariat : Jl. Cilengkrang II No. 7 Tlp. 022-7805502 Kel. Palassari Kec. Cibiru</div>
    </div>
  </div>
  <div class="sub-border"></div>

  <!-- TITLE -->
  <div class="doc-title">
    <h2>FORMULIR MURID BARU</h2>
    <p>TAHUN PELAJARAN 2026 / 2027</p>
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
      <p>Mengetahui :</p>
      <p>Orang Tua / Wali Murid,</p>
      <div class="sig-line"></div>
    </div>
    <div class="sig-block">
      <p>Bandung, &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip; ${new Date().getFullYear()}</p>
      <p>Calon Murid,</p>
      <div class="sig-line"></div>
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
