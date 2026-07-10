import { utils, writeFile } from "xlsx";
import { HARI_VALUES, HARI_LABELS } from "@/src/lib/constants";
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
    HARI_VALUES.map((value, index) => [value, index]),
  );
  const sorted = [...entries].sort(
    (a, b) =>
      (dayOrder[a.hari] ?? 99) - (dayOrder[b.hari] ?? 99) ||
      parseTimeToMinutes(a.jamMulai) - parseTimeToMinutes(b.jamMulai) ||
      a.kelas.localeCompare(b.kelas),
  );
  return [
    header,
    ...sorted.map((entry) => [
      HARI_LABELS[entry.hari] ?? entry.hari,
      entry.jamMulai,
      entry.jamSelesai,
      entry.kelas,
      entry.mataPelajaran,
      entry.guru,
    ]),
  ];
}

/**
 * Per-kelas timetable matrix: rows = unique "HH:mm–HH:mm" ranges of that
 * kelas sorted by start, columns = days, cell = "Mapel — Guru".
 */
export function buildKelasMatrix(entries: JadwalEntry[]): string[][] {
  const ranges = new Map<string, string>();
  for (const entry of entries) {
    ranges.set(`${entry.jamMulai}–${entry.jamSelesai}`, entry.jamMulai);
  }
  const sortedRanges = Array.from(ranges.keys()).sort(
    (a, b) =>
      parseTimeToMinutes(ranges.get(a) as string) -
      parseTimeToMinutes(ranges.get(b) as string),
  );

  const header = ["Jam", ...HARI_VALUES.map((hari) => HARI_LABELS[hari])];
  const rows = sortedRanges.map((range) => {
    const [jamMulai, jamSelesai] = range.split("–");
    return [
      range,
      ...HARI_VALUES.map((hari) => {
        const match = entries.find(
          (entry) =>
            entry.hari === hari &&
            entry.jamMulai === jamMulai &&
            entry.jamSelesai === jamSelesai,
        );
        return match ? `${match.mataPelajaran} — ${match.guru}` : "";
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

/** Build and download jadwal.xlsx: one flat sheet + one matrix per kelas. */
export function exportJadwalToExcel(entries: JadwalEntry[]): void {
  const workbook = utils.book_new();
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet(buildFlatRows(entries)),
    "Semua Jadwal",
  );

  const kelasNames = Array.from(
    new Map(entries.map((entry) => [entry.kelasId, entry.kelas])).values(),
  ).sort((a, b) => a.localeCompare(b));
  const usedNames = new Set<string>(["Semua Jadwal"]);
  for (const kelas of kelasNames) {
    const kelasEntries = entries.filter((entry) => entry.kelas === kelas);
    const base = sanitizeSheetName(kelas);
    let sheetName = base;
    let suffix = 2;
    while (usedNames.has(sheetName)) {
      sheetName = `${base.slice(0, 28)} ${suffix}`;
      suffix += 1;
    }
    usedNames.add(sheetName);
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet(buildKelasMatrix(kelasEntries)),
      sheetName,
    );
  }

  writeFile(workbook, "jadwal-pelajaran.xlsx");
}
