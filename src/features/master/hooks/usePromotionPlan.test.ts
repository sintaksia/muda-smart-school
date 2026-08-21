import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePromotionPlan } from "./usePromotionPlan";
import type { PromotionPreview } from "../types";

const preview: PromotionPreview = {
  fromAcademicYear: "2025/2026",
  toAcademicYear: "2026/2027",
  classes: [
    {
      id: "c10",
      name: "X PPLG 1",
      gradeLevel: 10,
      specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
      targetGradeLevel: 11,
      suggestedClassId: "c11",
      students: [
        { studentId: "s1", name: "Dadan", nis: "20261", defaultAction: "PROMOTE" },
        { studentId: "s2", name: "Rina", nis: "20262", defaultAction: "PROMOTE" },
      ],
    },
    {
      id: "c12",
      name: "XII PPLG 1",
      gradeLevel: 12,
      specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
      targetGradeLevel: null,
      suggestedClassId: null,
      students: [
        { studentId: "s3", name: "Budi", nis: "20243", defaultAction: "GRADUATE" },
      ],
    },
  ],
  targetClasses: [
    {
      id: "c11",
      name: "XI PPLG 1",
      gradeLevel: 11,
      specialization: "SOFTWARE_AND_GAME_DEVELOPMENT",
    },
  ],
  unplacedStudents: [],
};

describe("usePromotionPlan", () => {
  it("seeds every student from the preview suggestions", () => {
    const { result } = renderHook(() => usePromotionPlan(preview));

    expect(result.current.totalStudents).toBe(3);
    expect(result.current.counts).toEqual({
      PROMOTE: 2,
      RETAIN: 0,
      GRADUATE: 1,
      EXIT: 0,
    });
    expect(result.current.entries.get("s1")?.targetClassId).toBe("c11");
    expect(result.current.entries.get("s3")?.targetClassId).toBeNull();
    expect(result.current.isComplete).toBe(true);
  });

  it("is incomplete while a promoted student has no destination", () => {
    const withoutSuggestion: PromotionPreview = {
      ...preview,
      classes: [
        { ...preview.classes[0], suggestedClassId: null },
        preview.classes[1],
      ],
    };
    const { result } = renderHook(() => usePromotionPlan(withoutSuggestion));

    expect(result.current.incompleteCount).toBe(2);
    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.setStudentTarget("s1", "c11");
      result.current.setStudentTarget("s2", "c11");
    });

    expect(result.current.isComplete).toBe(true);
  });

  it("applies one destination to a whole class at once", () => {
    const { result } = renderHook(() => usePromotionPlan(preview));

    act(() => {
      result.current.applyToClass("c10", "RETAIN", "c11");
    });

    expect(result.current.counts.RETAIN).toBe(2);
    expect(result.current.counts.PROMOTE).toBe(0);
    expect(result.current.entries.get("s1")?.targetClassId).toBe("c11");
    // Untouched class keeps its own plan.
    expect(result.current.entries.get("s3")?.action).toBe("GRADUATE");
  });

  it("clears the destination when an action no longer needs one", () => {
    const { result } = renderHook(() => usePromotionPlan(preview));

    act(() => {
      result.current.setStudentAction("s1", "EXIT");
    });

    expect(result.current.entries.get("s1")?.targetClassId).toBeNull();
    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.setStudentExitStatus("s1", "TRANSFERRED");
    });

    expect(result.current.isComplete).toBe(true);
  });

  it("returns an empty plan when there is no preview", () => {
    const { result } = renderHook(() => usePromotionPlan(null));

    expect(result.current.totalStudents).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.toPayload()).toEqual([]);
  });

  it("submits one payload entry per student", () => {
    const { result } = renderHook(() => usePromotionPlan(preview));

    const payload = result.current.toPayload();

    expect(payload).toHaveLength(3);
    expect(payload).toContainEqual({
      studentId: "s1",
      action: "PROMOTE",
      targetClassId: "c11",
      exitStatus: null,
    });
  });
});
