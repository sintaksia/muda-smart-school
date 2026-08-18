import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllRegistrations } from "@/src/features/registration/services";
import type { Registration } from "@/src/features/registration/services";
import { requireAdminAccess } from "@/src/features/auth/utils/api-auth";
import {
  SPECIALIZATION_LABELS,
  REGISTRATION_STATUS_LABELS,
} from "@/src/lib/constants";

function toRow(item: Registration) {
  return {
    "No. Pendaftaran": item.registrationNumber ?? "-",
    "Nama Lengkap": item.fullName,
    NISN: item.nisn,
    NIK: item.nik,
    "No. KK": item.familyCardNumber,
    "Jenis Kelamin": item.gender === "MALE" ? "Laki-laki" : "Perempuan",
    "Program Keahlian":
      SPECIALIZATION_LABELS[item.specialization] ?? item.specialization,
    Status: REGISTRATION_STATUS_LABELS[item.status] ?? item.status,
    "Tempat Lahir": item.birthPlace,
    "Tanggal Lahir": new Date(item.birthDate).toLocaleDateString("id-ID"),
    "No. HP": item.studentPhone,
    Email: item.studentEmail ?? "-",
    Alamat: `${item.streetAddress}, RT ${item.rt}/RW ${item.rw}, ${item.village}, ${item.district}, ${item.city}, ${item.province}`,
    "Kode Pos": item.postalCode ?? "-",
    "Sekolah Asal": item.previousSchoolName,
    "NPSN Sekolah": item.previousSchoolNpsn,
    "Tahun Lulus": item.graduationYear,
    "Nama Ayah": item.fatherName,
    "Pekerjaan Ayah": item.fatherOccupation,
    "Nama Ibu": item.motherName,
    "Pekerjaan Ibu": item.motherOccupation,
    "Tanggal Daftar": new Date(item.registrationDate).toLocaleDateString(
      "id-ID",
    ),
  };
}

// GET - export all registrations (from page header button)
export async function GET() {
  const authCheck = await requireAdminAccess();
  if ("response" in authCheck) return authCheck.response;

  try {
    const registrations = await getAllRegistrations();
    return buildExcelResponse(registrations, "pendaftaran-semua");
  } catch (err: unknown) {
    console.error("Export registrations error:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor data pendaftaran" },
      { status: 500 },
    );
  }
}

// POST - export filtered data (from table export button)
export async function POST(request: Request) {
  const authCheck = await requireAdminAccess();
  if ("response" in authCheck) return authCheck.response;

  try {
    const body = (await request.json()) as { data: Registration[] };
    if (!Array.isArray(body?.data)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    return buildExcelResponse(body.data, "pendaftaran-filtered");
  } catch (err: unknown) {
    console.error("Export registrations error:", err);
    return NextResponse.json(
      { error: "Gagal mengekspor data pendaftaran" },
      { status: 500 },
    );
  }
}

function buildExcelResponse(data: Registration[], filename: string) {
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
