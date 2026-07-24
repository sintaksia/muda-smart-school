"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { EMPLOYMENT_STATUS_LABELS } from "@/src/lib/constants";
import { GuruForm } from "./GuruForm";

export interface GuruRow {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  employmentStatus: string;
  subjects: string[];
  homeroomClasses: string[];
}

interface GuruManagerProps {
  guruList: GuruRow[];
  mapelOptions: { id: string; name: string }[];
}

export function GuruManager({ guruList, mapelOptions }: GuruManagerProps) {
  const [formOpen, setFormOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 px-5 text-sm font-semibold text-white"
        >
          <Plus className="h-5 w-5" strokeWidth={1.75} />
          Tambah Guru
        </Button>
      </div>

      <GuruForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mapelOptions={mapelOptions}
      />

      <section className="border-hairline rounded-card border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-hairline text-ink-muted border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              {guruList.map((guru) => (
                <tr
                  key={guru.id}
                  className="border-hairline border-b last:border-b-0"
                >
                  <td className="px-5 py-3">
                    <p className="text-ink font-semibold">{guru.name}</p>
                    {guru.nip && (
                      <p className="text-ink-muted text-xs tabular-nums">
                        NIP {guru.nip}
                      </p>
                    )}
                  </td>
                  <td className="text-ink-secondary px-4 py-3">{guru.email}</td>
                  <td className="text-ink-secondary px-4 py-3">
                    {EMPLOYMENT_STATUS_LABELS[guru.employmentStatus]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-64 flex-wrap gap-1">
                      {guru.subjects.length > 0 ? (
                        guru.subjects.map((name) => (
                          <span
                            key={name}
                            className="bg-brand-50 text-brand rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-warning text-xs font-semibold">
                          Belum ada kualifikasi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-ink-secondary px-4 py-3">
                    {guru.homeroomClasses.join(", ") || "—"}
                  </td>
                </tr>
              ))}
              {guruList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-ink-muted px-5 py-12 text-center"
                  >
                    Belum ada guru. Tambahkan akun guru pertama.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
