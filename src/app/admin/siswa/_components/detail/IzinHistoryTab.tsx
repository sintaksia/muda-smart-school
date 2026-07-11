"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  IZIN_JENIS_LABELS,
  IZIN_STATUS_BADGES,
  IZIN_STATUS_LABELS,
} from "@/src/lib/constants";
import { formatDate } from "./DetailItem";
import type { SiswaDetailData } from "./SiswaDetail";

interface IzinHistoryTabProps {
  izinHistory: SiswaDetailData["izinHistory"];
}

export function IzinHistoryTab({ izinHistory }: IzinHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Riwayat Pengajuan Izin</CardTitle>
      </CardHeader>
      <CardContent>
        {izinHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada pengajuan izin.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {izinHistory.map((izin) => (
                <TableRow key={izin.id}>
                  <TableCell>{formatDate(izin.tanggal)}</TableCell>
                  <TableCell>
                    {IZIN_JENIS_LABELS[izin.jenis] ?? izin.jenis}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {izin.alasan}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={IZIN_STATUS_BADGES[izin.status] ?? "warning"}
                    >
                      {IZIN_STATUS_LABELS[izin.status] ?? izin.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {izin.reviewNote ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
