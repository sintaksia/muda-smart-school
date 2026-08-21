"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/app/admin/_components/Badge";
import { RegistrationActions } from "./RegistrationActions";
import type { RegistrationWithStudent } from "@/src/features/registration/services";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_SHORT_LABELS,
  SPECIALIZATION_COLORS,
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_BADGES,
} from "@/src/lib/constants";
import { formatTanggal } from "@/src/lib/date";

const getStatusLabel = (status: string): string =>
  REGISTRATION_STATUS_LABELS[status] ?? status;

const getProgramLabel = (program: string): string =>
  SPECIALIZATION_LABELS[program] ?? program;

const getProgramShortLabel = (program: string): string =>
  SPECIALIZATION_SHORT_LABELS[program] ?? program;

export const registrationColumns: ColumnDef<RegistrationWithStudent>[] = [
  {
    accessorKey: "registrationNumber",
    header: "No. Pendaftaran",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.registrationNumber || "-"}
      </span>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Nama Lengkap",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.fullName}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.studentPhone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Program",
    cell: ({ row }) => {
      const program = row.original.specialization;
      const color = SPECIALIZATION_COLORS[program] ?? "#64748b";
      return (
        <Badge
          variant="outline"
          className="text-xs font-semibold"
          style={{
            color,
            borderColor: color,
            backgroundColor: `${color}1a`,
          }}
          title={getProgramLabel(program)}
        >
          {getProgramShortLabel(program)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "JK",
    cell: ({ row }) => (
      <span className="text-sm" title={GENDER_LABELS[row.original.gender]}>
        {GENDER_LABELS[row.original.gender]?.charAt(0) ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "previousSchoolName",
    header: "Sekolah Asal",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.original.previousSchoolName}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = REGISTRATION_STATUS_BADGES[status] ?? "warning";

      return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
    },
  },
  {
    accessorKey: "registrationDate",
    header: "Tanggal Daftar",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatTanggal(row.original.registrationDate)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
  },
];
