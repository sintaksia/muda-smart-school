"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePromotionPlan } from "@/src/features/master/hooks/usePromotionPlan";
import { usePromotionRunner } from "@/src/features/master/hooks/usePromotionRunner";
import { nextAcademicYear } from "@/src/features/master/utils/promotion";
import type { PromotionBatchRow } from "@/src/features/master/types";
import { PromotionClassGroup } from "./PromotionClassGroup";
import { PromotionConfirmDialog } from "./PromotionConfirmDialog";
import { PromotionHistoryTable } from "./PromotionHistoryTable";
import { PromotionSetupBar } from "./PromotionSetupBar";
import { PromotionSummaryBar } from "./PromotionSummaryBar";
import { PromotionUnplacedNotice } from "./PromotionUnplacedNotice";

interface PromotionManagerProps {
  activeAcademicYear: string;
  batches: PromotionBatchRow[];
}

function defaultTargetYear(activeAcademicYear: string): string {
  try {
    return nextAcademicYear(activeAcademicYear);
  } catch {
    return "";
  }
}

export function PromotionManager({
  activeAcademicYear,
  batches,
}: PromotionManagerProps) {
  const router = useRouter();
  const [fromAcademicYear, setFromAcademicYear] =
    useState<string>(activeAcademicYear);
  const [toAcademicYear, setToAcademicYear] = useState<string>(() =>
    defaultTargetYear(activeAcademicYear),
  );
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const runner = usePromotionRunner();
  const plan = usePromotionPlan(runner.preview);
  const { preview } = runner;

  async function handleRun(): Promise<void> {
    const ok = await runner.runPromotion({
      fromAcademicYear,
      toAcademicYear,
      entries: plan.toPayload(),
    });
    if (ok) {
      setConfirmOpen(false);
      setFromAcademicYear(toAcademicYear);
      setToAcademicYear(defaultTargetYear(toAcademicYear));
      router.refresh();
    }
  }

  async function handleRevert(batchId: string): Promise<void> {
    if (await runner.revertBatch(batchId)) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <PromotionSetupBar
        fromAcademicYear={fromAcademicYear}
        toAcademicYear={toAcademicYear}
        onFromChange={setFromAcademicYear}
        onToChange={setToAcademicYear}
        onLoadPreview={() =>
          runner.loadPreview(fromAcademicYear, toAcademicYear)
        }
        onPrepareClasses={() =>
          runner.prepareClasses(fromAcademicYear, toAcademicYear)
        }
        loadingPreview={runner.loadingPreview}
        preparingClasses={runner.preparing}
        targetClassCount={preview ? preview.targetClasses.length : null}
      />

      {preview && preview.classes.length === 0 && (
        <p className="border-border text-muted-foreground rounded-md border bg-white p-5 text-sm">
          Tidak ada kelas aktif di tahun ajaran {fromAcademicYear}.
        </p>
      )}

      {preview && preview.unplacedStudents.length > 0 && (
        <PromotionUnplacedNotice students={preview.unplacedStudents} />
      )}

      {preview?.classes.map((group) => (
        <PromotionClassGroup
          key={group.id}
          group={group}
          targetClasses={preview.targetClasses}
          plan={plan}
        />
      ))}

      {preview && plan.totalStudents > 0 && (
        <PromotionSummaryBar
          counts={plan.counts}
          totalStudents={plan.totalStudents}
          incompleteCount={plan.incompleteCount}
          running={runner.running}
          onRun={() => setConfirmOpen(true)}
        />
      )}

      <PromotionHistoryTable
        batches={batches}
        revertingId={runner.revertingId}
        onRevert={handleRevert}
      />

      <PromotionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fromAcademicYear={fromAcademicYear}
        toAcademicYear={toAcademicYear}
        counts={plan.counts}
        totalStudents={plan.totalStudents}
        running={runner.running}
        onConfirm={handleRun}
      />
    </div>
  );
}
