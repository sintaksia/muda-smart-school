import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { getSiswaList } from "@/src/features/master/services/siswa";
import {
  PROGRAM_KEAHLIAN_LABELS,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";

type SiswaRow = Awaited<ReturnType<typeof getSiswaList>>[number];

function toRow(item: SiswaRow) {
  return {
    Nama: item.user.name,
    NIS: item.nis,
    NISN: item.nisn,
    "Program Keahlian":
      PROGRAM_KEAHLIAN_LABELS[item.programKeahlian] ?? item.programKeahlian,
    Angkatan: item.angkatan,
    Kelas: item.kelas?.nama ?? "-",
    "Tahun Ajaran": item.kelas?.tahunAjaran ?? "-",
    Status: STUDENT_STATUS_LABELS[item.status] ?? item.status,
    Email: item.user.email,
    "No. HP": item.user.phone ?? "-",
  };
}

// GET /api/master/siswa/export - download the student list as xlsx
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const siswaList = await getSiswaList();
    const worksheet = XLSX.utils.json_to_sheet(siswaList.map(toRow));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const date = new Date().toISOString().split("T")[0];

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="siswa-${date}.xlsx"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export siswa error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
