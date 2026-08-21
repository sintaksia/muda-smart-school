import { describe, expect, it } from "vitest";
import {
  academicYearForDate,
  classGroupIndex,
  defaultPromotionAction,
  isAcademicYear,
  nextAcademicYear,
  nextGradeLevel,
  renameClassForGradeLevel,
  romanGradeLevel,
  suggestTargetClass,
  type PromotionClassRef,
} from "./promotion";

function classRef(
  id: string,
  name: string,
  gradeLevel: number,
  specialization = "SOFTWARE_AND_GAME_DEVELOPMENT",
): PromotionClassRef {
  return { id, name, gradeLevel, specialization };
}

describe("isAcademicYear", () => {
  it("accepts a year running to the next calendar year", () => {
    expect(isAcademicYear("2025/2026")).toBe(true);
  });

  it("rejects a malformed or non-consecutive year", () => {
    expect(isAcademicYear("2025-2026")).toBe(false);
    expect(isAcademicYear("2025/2027")).toBe(false);
    expect(isAcademicYear("")).toBe(false);
  });
});

describe("academicYearForDate", () => {
  it("puts July onwards in the year that starts then", () => {
    expect(academicYearForDate(new Date("2026-07-01T00:00:00"))).toBe(
      "2026/2027",
    );
  });

  it("keeps months before July in the previous year", () => {
    expect(academicYearForDate(new Date("2026-06-30T00:00:00"))).toBe(
      "2025/2026",
    );
  });
});

describe("nextAcademicYear", () => {
  it("advances both halves", () => {
    expect(nextAcademicYear("2025/2026")).toBe("2026/2027");
  });

  it("throws on an invalid year", () => {
    expect(() => nextAcademicYear("2025")).toThrow(/tidak valid/i);
  });
});

describe("nextGradeLevel", () => {
  it("advances 10 and 11", () => {
    expect(nextGradeLevel(10)).toBe(11);
    expect(nextGradeLevel(11)).toBe(12);
  });

  it("returns null at the final grade and below the first", () => {
    expect(nextGradeLevel(12)).toBeNull();
    expect(nextGradeLevel(9)).toBeNull();
  });
});

describe("defaultPromotionAction", () => {
  it("promotes below the final grade and graduates at it", () => {
    expect(defaultPromotionAction(10)).toBe("PROMOTE");
    expect(defaultPromotionAction(12)).toBe("GRADUATE");
  });
});

describe("romanGradeLevel", () => {
  it("maps the three grades", () => {
    expect(romanGradeLevel(10)).toBe("X");
    expect(romanGradeLevel(12)).toBe("XII");
  });

  it("falls back to the number for an unknown grade", () => {
    expect(romanGradeLevel(13)).toBe("13");
  });
});

describe("classGroupIndex", () => {
  it("reads the trailing rombel number", () => {
    expect(classGroupIndex("X PPLG 1")).toBe(1);
    expect(classGroupIndex("XII TKR 12")).toBe(12);
  });

  it("returns null when the name has no rombel number", () => {
    expect(classGroupIndex("XI TKR")).toBeNull();
  });
});

describe("renameClassForGradeLevel", () => {
  it("replaces only the leading roman numeral", () => {
    expect(renameClassForGradeLevel("X PPLG 1", 10, 11)).toBe("XI PPLG 1");
    expect(renameClassForGradeLevel("XI TKR 2", 11, 12)).toBe("XII TKR 2");
  });

  it("does not treat XI as an X prefix", () => {
    expect(renameClassForGradeLevel("XI PPLG 1", 10, 11)).toBe("XI XI PPLG 1");
  });

  it("prefixes a name that does not start with the expected numeral", () => {
    expect(renameClassForGradeLevel("PPLG 1", 10, 11)).toBe("XI PPLG 1");
  });
});

describe("suggestTargetClass", () => {
  const source = classRef("c1", "X PPLG 1", 10);

  it("matches the same rombel number one grade up", () => {
    const candidates = [
      classRef("t2", "XI PPLG 2", 11),
      classRef("t1", "XI PPLG 1", 11),
    ];
    expect(suggestTargetClass(source, 11, candidates)).toBe("t1");
  });

  it("falls back to the only class of that specialization", () => {
    const candidates = [classRef("t9", "XI PPLG", 11)];
    expect(suggestTargetClass(source, 11, candidates)).toBe("t9");
  });

  it("returns null when the choice would be a guess", () => {
    const candidates = [
      classRef("t1", "XI PPLG A", 11),
      classRef("t2", "XI PPLG B", 11),
    ];
    expect(suggestTargetClass(source, 11, candidates)).toBeNull();
  });

  it("never crosses specialization or grade level", () => {
    const candidates = [
      classRef("t1", "XI TKR 1", 11, "AUTOMOTIVE_ENGINEERING"),
      classRef("t2", "XII PPLG 1", 12),
    ];
    expect(suggestTargetClass(source, 11, candidates)).toBeNull();
  });
});
