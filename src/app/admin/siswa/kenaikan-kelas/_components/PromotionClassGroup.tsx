"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import { Badge } from "@/src/app/admin/_components/Badge";
import {
  ENTITY_LABELS,
  promotionActionOptions,
  SPECIALIZATION_SHORT_LABELS,
} from "@/src/lib/constants";
import type { PromotionAction } from "@prisma/client";
import type { PromotionPlan } from "@/src/features/master/hooks/usePromotionPlan";
import type {
  PromotionClassPreview,
  PromotionClassRef,
} from "@/src/features/master/types";
import { PromotionStudentRow } from "./PromotionStudentRow";

interface PromotionClassGroupProps {
  group: PromotionClassPreview;
  targetClasses: PromotionClassRef[];
  plan: PromotionPlan;
}

/**
 * One source class. The two controls in the header rewrite the whole class at
 * once — that is what keeps a 200-student promotion to a handful of choices;
 * the rows below exist for the exceptions.
 */
export function PromotionClassGroup({
  group,
  targetClasses,
  plan,
}: PromotionClassGroupProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [bulkAction, setBulkAction] = useState<PromotionAction>(
    group.targetGradeLevel === null ? "GRADUATE" : "PROMOTE",
  );
  const [bulkTarget, setBulkTarget] = useState<string>(
    group.suggestedClassId ?? "",
  );

  const bulkNeedsTarget = bulkAction === "PROMOTE" || bulkAction === "RETAIN";

  function applyBulk(action: PromotionAction, targetClassId: string): void {
    setBulkAction(action);
    setBulkTarget(targetClassId);
    plan.applyToClass(group.id, action, targetClassId || null);
  }

  return (
    <section className="border-border rounded-md border bg-white">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="hover:bg-muted flex items-center gap-2 rounded-sm px-1 py-1 text-left"
          aria-expanded={open}
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-neutral-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          )}
          <span className="text-foreground font-semibold">{group.name}</span>
        </button>
        <Badge variant="outline">
          {SPECIALIZATION_SHORT_LABELS[group.specialization]}
        </Badge>
        <span className="text-xs text-neutral-500 tabular-nums">
          {group.students.length} siswa
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SelectField
            ariaLabel={`Aksi seluruh ${group.name}`}
            value={bulkAction}
            onChange={(value) => applyBulk(value as PromotionAction, bulkTarget)}
            className={FILTER_FIELD_CLASS}
            options={promotionActionOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          {bulkNeedsTarget && (
            <SelectField
              ariaLabel={`${ENTITY_LABELS.CLASS} tujuan seluruh ${group.name}`}
              value={bulkTarget}
              onChange={(value) => applyBulk(bulkAction, value)}
              className={FILTER_FIELD_CLASS}
              placeholder="Pilih kelas tujuan"
              searchable
              options={targetClasses.map((schoolClass) => ({
                value: schoolClass.id,
                label: schoolClass.name,
              }))}
            />
          )}
        </div>
      </header>

      {open && (
        <div className="border-border overflow-x-auto border-t">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left text-xs font-semibold uppercase tracking-wide">
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">NIS</th>
                <th className="px-4 py-2">Aksi</th>
                <th className="px-4 py-2">Tujuan</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {group.students.map((student) => {
                const entry = plan.entries.get(student.studentId);
                if (!entry) {
                  return null;
                }
                return (
                  <PromotionStudentRow
                    key={student.studentId}
                    student={student}
                    entry={entry}
                    targetClasses={targetClasses}
                    onActionChange={plan.setStudentAction}
                    onTargetChange={plan.setStudentTarget}
                    onExitStatusChange={plan.setStudentExitStatus}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
