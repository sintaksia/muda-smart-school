"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/src/app/admin/_components/Badge";
import { Button } from "@/src/components/ui/button";
import {
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_BADGES,
  LEAVE_STATUS_LABELS,
} from "@/src/lib/constants";
import { IzinForm } from "./IzinForm";

interface IzinItem {
  id: string;
  jenis: string;
  tanggal: string;
  alasan: string;
  status: string;
}

interface IzinSectionProps {
  submissions: IzinItem[];
}

export function IzinSection({ submissions }: IzinSectionProps) {
  const [formOpen, setFormOpen] = useState<boolean>(false);

  return (
    <section className="border-border rounded-md border bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-foreground text-base font-semibold">
          Izin / Sakit
        </h3>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajukan
        </Button>
      </div>

      {submissions.length > 0 ? (
        <ul className="border-border border-t pt-2">
          {submissions.map((izin) => (
            <li
              key={izin.id}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {LEAVE_TYPE_LABELS[izin.jenis]} ·{" "}
                  <span className="tabular-nums">{izin.tanggal}</span>
                </p>
                <p className="text-muted-foreground max-w-72 truncate text-xs">
                  {izin.alasan}
                </p>
              </div>
              <Badge variant={LEAVE_STATUS_BADGES[izin.status]}>
                {LEAVE_STATUS_LABELS[izin.status]}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground py-6 text-center text-sm">
          Belum ada pengajuan izin.
        </p>
      )}

      <IzinForm open={formOpen} onOpenChange={setFormOpen} />
    </section>
  );
}
