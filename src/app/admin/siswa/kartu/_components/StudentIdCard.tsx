"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import type { StudentCard } from "@/src/features/master/services/studentCard";

/** ID-1 geometry (85.6 × 54 mm) so printed sheets cut to standard card size. */
const CARD_SIZE = "h-[54mm] w-[85.6mm]";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function StudentIdCard({ card }: { card: StudentCard }) {
  return (
    <article
      className={`border-border rounded-md ${CARD_SIZE} flex items-center gap-3 overflow-hidden border bg-white p-3 print:break-inside-avoid`}
    >
      {card.photo ? (
        <Image
          src={card.photo}
          alt={card.name}
          width={96}
          height={128}
          className="rounded-sm h-[32mm] w-[24mm] shrink-0 object-cover"
        />
      ) : (
        <div className="rounded-sm bg-primary-50 text-primary-900 flex h-[32mm] w-[24mm] shrink-0 items-center justify-center text-xl font-bold">
          {initials(card.name)}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
        <div className="min-w-0">
          <p className="text-primary-900 text-[9px] font-bold uppercase tracking-[0.08em]">
            Muda Smart School
          </p>
          <p className="text-foreground mt-1 truncate text-sm font-semibold leading-tight">
            {card.name}
          </p>
          <p className="text-neutral-600 text-[11px] tabular-nums">
            {card.nis} · {card.className}
          </p>
        </div>
      </div>

      <QRCodeSVG value={card.cardToken} size={76} marginSize={0} />
    </article>
  );
}
