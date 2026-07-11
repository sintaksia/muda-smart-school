"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/app/admin/_components/Badge";
import { SiswaActions } from "./SiswaActions";
import type { SiswaRow } from "./types";
import {
  PROGRAM_KEAHLIAN_COLORS,
  PROGRAM_KEAHLIAN_LABELS,
  PROGRAM_KEAHLIAN_SHORT_LABELS,
  STUDENT_STATUS_BADGES,
  STUDENT_STATUS_LABELS,
} from "@/src/lib/constants";

export const siswaColumns: ColumnDef<SiswaRow>[] = [
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/siswa/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.nama}
        </Link>
        <div className="text-xs text-muted-foreground">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nis",
    header: "NIS",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.nis}</span>
    ),
  },
  {
    accessorKey: "nisn",
    header: "NISN",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.nisn}</span>
    ),
  },
  {
    accessorKey: "programKeahlian",
    header: "Program",
    cell: ({ row }) => {
      const program = row.original.programKeahlian;
      const color = PROGRAM_KEAHLIAN_COLORS[program] ?? "#64748b";
      return (
        <Badge
          variant="outline"
          className="text-xs font-semibold"
          style={{
            color,
            borderColor: color,
            backgroundColor: `${color}1a`,
          }}
          title={PROGRAM_KEAHLIAN_LABELS[program] ?? program}
        >
          {PROGRAM_KEAHLIAN_SHORT_LABELS[program] ?? program}
        </Badge>
      );
    },
  },
  {
    accessorKey: "angkatan",
    header: "Angkatan",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{row.original.angkatan}</span>
    ),
  },
  {
    accessorKey: "kelasNama",
    header: "Kelas",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.kelasNama ?? (
          <span className="text-muted-foreground">Belum ditempatkan</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={STUDENT_STATUS_BADGES[status] ?? "warning"}>
          {STUDENT_STATUS_LABELS[status] ?? status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <SiswaActions siswa={row.original} />,
  },
];
