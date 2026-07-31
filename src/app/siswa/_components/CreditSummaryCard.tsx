interface CreditSummaryCardProps {
  total: number;
  name: string;
}

export function CreditSummaryCard({ total, name }: CreditSummaryCardProps) {
  return (
    <section className="rounded-md bg-gradient-to-br from-primary-900 to-primary-950 p-6 text-white">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] opacity-80">
        Skor Kredit · {name}
      </p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight tabular-nums">
        {total}
      </p>
      <p className="mt-1 text-sm opacity-80">
        Jaga kehadiranmu untuk mempertahankan skor.
      </p>
    </section>
  );
}
