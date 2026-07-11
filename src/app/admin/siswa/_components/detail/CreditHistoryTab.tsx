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
  CREDIT_ENTRY_TYPE_BADGES,
  CREDIT_ENTRY_TYPE_LABELS,
} from "@/src/lib/constants";
import { formatDate } from "./DetailItem";
import type { SiswaDetailData } from "./SiswaDetail";

interface CreditHistoryTabProps {
  creditEntries: SiswaDetailData["creditEntries"];
  creditTotal: number;
}

export function CreditHistoryTab({
  creditEntries,
  creditTotal,
}: CreditHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Skor Kredit: <span className="tabular-nums">{creditTotal} poin</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creditEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada catatan skor kredit.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Poin</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.createdAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={CREDIT_ENTRY_TYPE_BADGES[entry.type] ?? "info"}
                    >
                      {CREDIT_ENTRY_TYPE_LABELS[entry.type] ?? entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {entry.note ?? "-"}
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
