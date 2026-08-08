"use client";

import { QRCodeSVG } from "qrcode.react";
import { IdCard } from "lucide-react";
import type { StudentCard } from "@/src/features/master/services/studentCard";

/**
 * TEACHER_SCAN direction: the student shows this QR (the same token printed on
 * their ID card) and the teacher scans it from the session screen.
 */
export function StudentQrCard({ card }: { card: StudentCard }) {
  return (
    <section className="border-border rounded-md border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <IdCard className="text-primary-900 h-5 w-5" strokeWidth={1.75} />
        <h3 className="text-foreground text-base font-semibold">
          Kartu Presensi Saya
        </h3>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="border-border rounded-md border bg-white p-4">
          <QRCodeSVG value={card.cardToken} size={220} marginSize={2} />
        </div>
        <p className="text-foreground text-sm font-semibold">{card.name}</p>
        <p className="text-neutral-600 text-xs tabular-nums">
          {card.nis} · {card.className}
        </p>
        <p className="text-neutral-600 text-center text-xs">
          Tunjukkan QR ini ke guru untuk dipindai. Jika kamera guru bermasalah,
          sebutkan NIS di atas.
        </p>
      </div>
    </section>
  );
}
