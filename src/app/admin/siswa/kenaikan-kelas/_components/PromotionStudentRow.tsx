"use client";

import { SelectField } from "@/src/components/common/SelectField";
import { FILTER_FIELD_CLASS } from "@/src/components/common/formClasses";
import {
  ENTITY_LABELS,
  promotionActionOptions,
  promotionExitStatusOptions,
} from "@/src/lib/constants";
import type { PromotionAction } from "@prisma/client";
import type {
  PromotionExitStatus,
  PromotionPlanEntry,
} from "@/src/features/master/hooks/usePromotionPlan";
import type {
  PromotionClassRef,
  PromotionStudentPreview,
} from "@/src/features/master/types";

interface PromotionStudentRowProps {
  student: PromotionStudentPreview;
  entry: PromotionPlanEntry;
  targetClasses: PromotionClassRef[];
  onActionChange: (studentId: string, action: PromotionAction) => void;
  onTargetChange: (studentId: string, classId: string) => void;
  onExitStatusChange: (
    studentId: string,
    exitStatus: PromotionExitStatus,
  ) => void;
}

export function PromotionStudentRow({
  student,
  entry,
  targetClasses,
  onActionChange,
  onTargetChange,
  onExitStatusChange,
}: PromotionStudentRowProps) {
  const needsTarget = entry.action === "PROMOTE" || entry.action === "RETAIN";
  const missing =
    (needsTarget && !entry.targetClassId) ||
    (entry.action === "EXIT" && !entry.exitStatus);

  return (
    <tr className="border-border border-b last:border-b-0">
      <td className="text-foreground px-4 py-2 font-medium">{student.name}</td>
      <td className="px-4 py-2 text-neutral-600 tabular-nums">{student.nis}</td>
      <td className="px-4 py-2">
        <SelectField
          ariaLabel={`Aksi kenaikan ${student.name}`}
          value={entry.action}
          onChange={(value) =>
            onActionChange(student.studentId, value as PromotionAction)
          }
          className={FILTER_FIELD_CLASS}
          options={promotionActionOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </td>
      <td className="px-4 py-2">
        {needsTarget && (
          <SelectField
            ariaLabel={`${ENTITY_LABELS.CLASS} tujuan ${student.name}`}
            value={entry.targetClassId ?? ""}
            onChange={(value) => onTargetChange(student.studentId, value)}
            className={FILTER_FIELD_CLASS}
            placeholder="Pilih kelas"
            options={targetClasses.map((schoolClass) => ({
              value: schoolClass.id,
              label: schoolClass.name,
            }))}
          />
        )}
        {entry.action === "EXIT" && (
          <SelectField
            ariaLabel={`Status keluar ${student.name}`}
            value={entry.exitStatus ?? ""}
            onChange={(value) =>
              onExitStatusChange(student.studentId, value as PromotionExitStatus)
            }
            className={FILTER_FIELD_CLASS}
            placeholder="Pilih status"
            options={promotionExitStatusOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        )}
        {entry.action === "GRADUATE" && (
          <span className="text-xs text-neutral-500">
            Kelas dilepas otomatis
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-right">
        {missing && (
          <span className="text-destructive text-xs font-semibold">
            Belum lengkap
          </span>
        )}
      </td>
    </tr>
  );
}
