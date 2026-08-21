"use client";

import { useCallback, useMemo, useState } from "react";
import type { PromotionAction } from "@prisma/client";
import { PROMOTION_ACTIONS_NEEDING_CLASS } from "@/src/lib/constants";
import type { PromotionEntryInput, PromotionPreview } from "../types";

export type PromotionExitStatus = "TRANSFERRED" | "DROPPED_OUT";

export interface PromotionPlanEntry {
  action: PromotionAction;
  targetClassId: string | null;
  exitStatus: PromotionExitStatus | null;
}

export interface PromotionPlan {
  entries: Map<string, PromotionPlanEntry>;
  counts: Record<PromotionAction, number>;
  /** Entries still missing a destination class or an exit status. */
  incompleteCount: number;
  isComplete: boolean;
  totalStudents: number;
  setStudentAction: (studentId: string, action: PromotionAction) => void;
  setStudentTarget: (studentId: string, targetClassId: string) => void;
  setStudentExitStatus: (
    studentId: string,
    exitStatus: PromotionExitStatus,
  ) => void;
  applyToClass: (
    sourceClassId: string,
    action: PromotionAction,
    targetClassId: string | null,
  ) => void;
  toPayload: () => PromotionEntryInput[];
}

function needsClass(action: PromotionAction): boolean {
  return (PROMOTION_ACTIONS_NEEDING_CLASS as readonly string[]).includes(action);
}

function isEntryComplete(entry: PromotionPlanEntry): boolean {
  if (needsClass(entry.action)) {
    return Boolean(entry.targetClassId);
  }
  return entry.action !== "EXIT" || Boolean(entry.exitStatus);
}

function seedEntries(
  preview: PromotionPreview | null,
): Map<string, PromotionPlanEntry> {
  const seeded = new Map<string, PromotionPlanEntry>();
  for (const group of preview?.classes ?? []) {
    for (const student of group.students) {
      seeded.set(student.studentId, {
        action: student.defaultAction,
        targetClassId: needsClass(student.defaultAction)
          ? group.suggestedClassId
          : null,
        exitStatus: null,
      });
    }
  }
  return seeded;
}

/**
 * Holds the per-student plan while the admin reviews it. Seeded from the
 * preview's suggestions so an untouched plan is already the sensible one, and
 * the bulk `applyToClass` is what turns a class of thirty into one choice.
 *
 * Nothing here talks to the server — the plan is submitted in one request, and
 * the server re-validates all of it.
 */
export function usePromotionPlan(
  preview: PromotionPreview | null,
): PromotionPlan {
  const seeded = useMemo(() => seedEntries(preview), [preview]);
  const [edits, setEdits] = useState<Map<string, PromotionPlanEntry>>(
    () => new Map(),
  );

  // Adjusting state during render — not in an effect — is how React wants a
  // prop change reset: a new preview drops the edits made against the old one
  // before anything is painted.
  const [seedInUse, setSeedInUse] = useState(seeded);
  if (seedInUse !== seeded) {
    setSeedInUse(seeded);
    setEdits(new Map());
  }

  const entries = useMemo(() => {
    if (edits.size === 0) {
      return seeded;
    }
    const merged = new Map(seeded);
    for (const [studentId, entry] of edits) {
      if (merged.has(studentId)) {
        merged.set(studentId, entry);
      }
    }
    return merged;
  }, [seeded, edits]);

  const update = useCallback(
    (studentId: string, patch: Partial<PromotionPlanEntry>) => {
      setEdits((current) => {
        const entry = current.get(studentId) ?? seeded.get(studentId);
        if (!entry) {
          return current;
        }
        const next = new Map(current);
        next.set(studentId, { ...entry, ...patch });
        return next;
      });
    },
    [seeded],
  );

  const setStudentAction = useCallback(
    (studentId: string, action: PromotionAction) => {
      // Clear the half that no longer applies, so a switched action can never
      // submit a stale destination.
      update(studentId, {
        action,
        ...(needsClass(action) ? { exitStatus: null } : { targetClassId: null }),
      });
    },
    [update],
  );

  const setStudentTarget = useCallback(
    (studentId: string, targetClassId: string) =>
      update(studentId, { targetClassId: targetClassId || null }),
    [update],
  );

  const setStudentExitStatus = useCallback(
    (studentId: string, exitStatus: PromotionExitStatus) =>
      update(studentId, { exitStatus }),
    [update],
  );

  const applyToClass = useCallback(
    (
      sourceClassId: string,
      action: PromotionAction,
      targetClassId: string | null,
    ) => {
      const group = preview?.classes.find((item) => item.id === sourceClassId);
      if (!group) {
        return;
      }
      setEdits((current) => {
        const next = new Map(current);
        for (const student of group.students) {
          next.set(student.studentId, {
            action,
            targetClassId: needsClass(action) ? targetClassId : null,
            exitStatus: null,
          });
        }
        return next;
      });
    },
    [preview],
  );

  const counts = useMemo(() => {
    const tally: Record<PromotionAction, number> = {
      PROMOTE: 0,
      RETAIN: 0,
      GRADUATE: 0,
      EXIT: 0,
    };
    for (const entry of entries.values()) {
      tally[entry.action] += 1;
    }
    return tally;
  }, [entries]);

  const incompleteCount = useMemo(
    () =>
      Array.from(entries.values()).filter((entry) => !isEntryComplete(entry))
        .length,
    [entries],
  );

  const toPayload = useCallback(
    (): PromotionEntryInput[] =>
      Array.from(entries.entries()).map(([studentId, entry]) => ({
        studentId,
        action: entry.action,
        targetClassId: entry.targetClassId,
        exitStatus: entry.exitStatus,
      })),
    [entries],
  );

  return {
    entries,
    counts,
    incompleteCount,
    isComplete: entries.size > 0 && incompleteCount === 0,
    totalStudents: entries.size,
    setStudentAction,
    setStudentTarget,
    setStudentExitStatus,
    applyToClass,
    toPayload,
  };
}
