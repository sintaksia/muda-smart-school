import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllRegistrations } from "@/src/features/registration/services";
import type { Pendaftaran } from "@/src/features/registration/services";
import {
  PROGRAM_KEAHLIAN_LABELS,
  STATUS_PENDAFTARAN_LABELS,
} from "@/src/lib/constants";

function toRow(item: Pendaftaran) {
  return {
    "No. Pendaftaran": item.nomorPendaftaran ?? "-",
    "Nama Lengkap": item.namaLengkap,
    NISN: item.nisn,
    NIK: item.nik,
    "No. KK": item.nomorKk,
    "Jenis Kelamin":
      item.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan",
    "Program Keahlian":
      PROGRAM_KEAHLIAN_LABELS[item.programKeahlian] ?? item.programKeahlian,
    Status: STATUS_PENDAFTARAN_LABELS[item.status] ?? item.status,
    "Tempat Lahir": item.tempatLahir,
    "Tanggal Lahir": new Date(item.tanggalLahir).toLocaleDateString("id-ID"),
    "No. HP": item.noHpMurid,
    Email: item.emailMurid ?? "-",
    Alamat: `${item.alamatJalan}, RT ${item.rt}/RW ${item.rw}, ${item.kelurahanDesa}, ${item.kecamatan}, ${item.kotaKabupaten}, ${item.provinsi}`,
    "Kode Pos": item.kodePos ?? "-",
    "Sekolah Asal": item.namaAsalSekolah,
    "NPSN Sekolah": item.npsnAsalSekolah,
    "Tahun Lulus": item.tahunLulus,
    "Nama Ayah": item.namaAyah,
    "Pekerjaan Ayah": item.pekerjaanAyah,
    "Nama Ibu": item.namaIbu,
    "Pekerjaan Ibu": item.pekerjaanIbu,
    "Tanggal Daftar": new Date(item.tanggalPendaftaran).toLocaleDateString(
      "id-ID",
    ),
  };
}

// GET - export all registrations (from page header button)
export async function GET() {
  const registrations = await getAllRegistrations();
  return buildExcelResponse(registrations, "pendaftaran-semua");
}

// POST - export filtered data (from table export button)
export async function POST(request: Request) {
  const body = (await request.json()) as { data: Pendaftaran[] };
  return buildExcelResponse(body.data, "pendaftaran-filtered");
}

function buildExcelResponse(data: Pendaftaran[], filename: string) {
  const rows = data.map(toRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftaran");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}-${date}.xlsx"`,
    },
  });
}
