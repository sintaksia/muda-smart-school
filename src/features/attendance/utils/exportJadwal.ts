import { utils, writeFile } from "xlsx";
import { DAY_OF_WEEK_VALUES, DAY_OF_WEEK_LABELS } from "@/src/lib/constants";
import { parseTimeToMinutes } from "./time";
import type { JadwalEntry } from "./jadwalGrid";

/** Flat rows for the "Semua Jadwal" sheet, sorted by day then start time. */
export function buildFlatRows(entries: JadwalEntry[]): string[][] {
  const header = [
    "Hari",
    "Jam Mulai",
    "Jam Selesai",
    "Kelas",
    "Mata Pelajaran",
    "Guru",
  ];
  const dayOrder: Record<string, number> = Object.fromEntries(
    DAY_OF_WEEK_VALUES.map((value, index) => [value, index]),
  );
  const sorted = [...entries].sort(
    (a, b) =>
      (dayOrder[a.dayOfWeek] ?? 99) - (dayOrder[b.dayOfWeek] ?? 99) ||
      parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime) ||
      a.className.localeCompare(b.className),
  );
  return [
    header,
    ...sorted.map((entry) => [
      DAY_OF_WEEK_LABELS[entry.dayOfWeek] ?? entry.dayOfWeek,
      entry.startTime,
      entry.endTime,
      entry.className,
      entry.subjectName,
      entry.teacherName,
    ]),
  ];
}

/**
 * Per-class timetable matrix: rows = unique "HH:mm–HH:mm" ranges of that
 * class sorted by start, columns = days, cell = "Subject — Teacher".
 */
export function buildClassMatrix(entries: JadwalEntry[]): string[][] {
  const ranges = new Map<string, string>();
  for (const entry of entries) {
    ranges.set(`${entry.startTime}–${entry.endTime}`, entry.startTime);
  }
  const sortedRanges = Array.from(ranges.keys()).sort(
    (a, b) =>
      parseTimeToMinutes(ranges.get(a) as string) -
      parseTimeToMinutes(ranges.get(b) as string),
  );

  const header = [
    "Jam",
    ...DAY_OF_WEEK_VALUES.map((day) => DAY_OF_WEEK_LABELS[day]),
  ];
  const rows = sortedRanges.map((range) => {
    const [startTime, endTime] = range.split("–");
    return [
      range,
      ...DAY_OF_WEEK_VALUES.map((day) => {
        const match = entries.find(
          (entry) =>
            entry.dayOfWeek === day &&
            entry.startTime === startTime &&
            entry.endTime === endTime,
        );
        return match ? `${match.subjectName} — ${match.teacherName}` : "";
      }),
    ];
  });
  return [header, ...rows];
}

/** Excel sheet names: max 31 chars, no \ / ? * [ ] : characters. */
export function sanitizeSheetName(name: string): string {
  return (
    name
      .replace(/[\\/?*[\]:]/g, " ")
      .trim()
      .slice(0, 31) || "Sheet"
  );
}

/** Build and download jadwal.xlsx: one flat sheet + one matrix per class. */
export function exportJadwalToExcel(entries: JadwalEntry[]): void {
  const workbook = utils.book_new();
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet(buildFlatRows(entries)),
    "Semua Jadwal",
  );

  const classNames = Array.from(
    new Map(entries.map((entry) => [entry.classId, entry.className])).values(),
  ).sort((a, b) => a.localeCompare(b));
  const usedNames = new Set<string>(["Semua Jadwal"]);
  for (const className of classNames) {
    const classEntries = entries.filter(
      (entry) => entry.className === className,
    );
    const base = sanitizeSheetName(className);
    let sheetName = base;
    let suffix = 2;
    while (usedNames.has(sheetName)) {
      sheetName = `${base.slice(0, 28)} ${suffix}`;
      suffix += 1;
    }
    usedNames.add(sheetName);
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet(buildClassMatrix(classEntries)),
      sheetName,
    );
  }

  writeFile(workbook, "jadwal-pelajaran.xlsx");
}
