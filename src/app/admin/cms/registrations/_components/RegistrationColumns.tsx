"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/app/admin/_components/Badge";
import { RegistrationActions } from "./RegistrationActions";
// import { formatTanggal, getStatusColor, getStatusLabel } from "@/src/features/registration/services";
import type { PendaftaranWithStudent } from "@/src/features/registration/services";

// --- UTILS LOKAL (Client Safe) ---
const formatTanggal = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "Menunggu";
    case "DIVERIFIKASI":
      return "Terverifikasi";
    case "DITERIMA":
      return "Diterima";
    case "DITOLAK":
      return "Ditolak";
    default:
      return status;
  }
};

const getProgramLabel = (program: string): string => {
  const programLabels: Record<string, string> = {
    TEKNIK_OTOMOTIF: "Teknik Otomotif",
    PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM: "Pemrograman PL & Gim",
    TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI:
      "Teknik Jaringan & Telekomunikasi",
    MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS: "Manajemen Perkantoran",
    AKUNTANSI_DAN_KEUANGAN_LEMBAGA: "Akuntansi & Keuangan",
  };
  return programLabels[program] || program;
};
// --- END UTILS ---

export const registrationColumns: ColumnDef<PendaftaranWithStudent>[] = [
  {
    accessorKey: "nomorPendaftaran",
    header: "No. Pendaftaran",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.nomorPendaftaran || "-"}
      </span>
    ),
  },
  {
    accessorKey: "namaLengkap",
    header: "Nama Lengkap",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.namaLengkap}</div>
        <div className="text-xs text-muted-foreground">{row.original.nisn}</div>
      </div>
    ),
  },
  {
    accessorKey: "programKeahlian",
    header: "Program",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {getProgramLabel(row.original.programKeahlian)}
      </Badge>
    ),
  },
  {
    accessorKey: "jenisKelamin",
    header: "JK",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
      </span>
    ),
  },
  {
    accessorKey: "namaAsalSekolah",
    header: "Sekolah Asal",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.original.namaAsalSekolah}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "success" | "warning" | "info" | "destructive" = "warning";

      switch (status) {
        case "DITERIMA":
          variant = "success";
          break;
        case "DIVERIFIKASI":
          variant = "info";
          break;
        case "DITOLAK":
          variant = "destructive";
          break;
        case "PENDING":
        default:
          variant = "warning";
      }

      return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
    },
  },
  {
    accessorKey: "tanggalPendaftaran",
    header: "Tanggal Daftar",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatTanggal(row.original.tanggalPendaftaran)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
  },
];
