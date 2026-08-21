"use client";

import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { SelectField } from "@/src/components/common/SelectField";
import { ADMIN_FIELD_CLASS } from "@/src/components/common/formClasses";
import { ENTITY_LABELS } from "@/src/lib/constants";
import type { StudentCard } from "@/src/features/master/services/studentCard";
import { StudentIdCard } from "./StudentIdCard";

interface CardSheetViewProps {
  classOptions: { id: string; name: string }[];
  selectedClassId: string;
  cards: StudentCard[];
}

/** Class picker + the printable sheet. Only the sheet survives printing. */
export function CardSheetView({
  classOptions,
  selectedClassId,
  cards,
}: CardSheetViewProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="border-border rounded-md flex flex-wrap items-end gap-4 border bg-white p-5 print:hidden">
        <label className="block">
          <span className="text-neutral-600 mb-1.5 block text-xs font-semibold">
            {ENTITY_LABELS.CLASS}
          </span>
          <SelectField
            searchable
            ariaLabel={`Pilih ${ENTITY_LABELS.CLASS}`}
            placeholder={`Pilih ${ENTITY_LABELS.CLASS}`}
            value={selectedClassId}
            onChange={(next) =>
              router.push(`/admin/siswa/kartu?classId=${next}`)
            }
            className={`${ADMIN_FIELD_CLASS} w-56`}
            options={classOptions.map((option) => ({
              value: option.id,
              label: option.name,
            }))}
          />
        </label>
        <Button
          type="button"
          onClick={() => window.print()}
          disabled={cards.length === 0}
          className="h-11 gap-2 px-5 font-semibold"
        >
          <Printer className="h-5 w-5" strokeWidth={1.75} />
          Cetak {cards.length > 0 && `(${cards.length})`}
        </Button>
        {selectedClassId && cards.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Belum ada {ENTITY_LABELS.STUDENT.toLowerCase()} aktif di kelas ini.
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <div className="flex flex-wrap gap-4 print:gap-2">
          {cards.map((card) => (
            <StudentIdCard key={card.studentId} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
