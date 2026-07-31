import { prisma } from "@/src/lib/prisma";
import { createStudent } from "./student";
import {
  normalizeStudentRow,
  type StudentSheetRow,
} from "../utils/studentImport";
import { defaultStudentPassword } from "../utils/studentPassword";
import type { Gender, Specialization } from "@prisma/client";
import type { StudentImportResult } from "../types";

/** Header row offset: sheet row 1 is the header, so data starts at row 2. */
const HEADER_OFFSET = 2;

/**
 * Create one student per spreadsheet row. Rows are processed independently:
 * a bad row is reported and skipped, it never aborts the rest of the batch.
 * Every created account gets the NIS-derived default password, returned so the
 * admin can hand it out.
 */
export async function importStudents(
  rows: StudentSheetRow[],
  createdById?: string,
): Promise<StudentImportResult> {
  const classList = await prisma.schoolClass.findMany({
    select: { id: true, name: true },
  });
  const classIdByName = new Map(
    classList.map((schoolClass) => [
      schoolClass.name.toLowerCase(),
      schoolClass.id,
    ]),
  );

  const result: StudentImportResult = {
    created: 0,
    credentials: [],
    failures: [],
  };

  for (const [index, raw] of rows.entries()) {
    const sheetRow = index + HEADER_OFFSET;
    const { data, error } = normalizeStudentRow(raw);

    if (error) {
      result.failures.push({
        row: sheetRow,
        name: data.name,
        nis: data.nis,
        error,
      });
      continue;
    }

    let classId: string | null = null;
    if (data.className) {
      classId = classIdByName.get(data.className.toLowerCase()) ?? null;
      if (!classId) {
        result.failures.push({
          row: sheetRow,
          name: data.name,
          nis: data.nis,
          error: `Kelas "${data.className}" tidak ditemukan`,
        });
        continue;
      }
    }

    const password = defaultStudentPassword(data.nis);
    const { student, error: createError } = await createStudent(
      {
        ...data,
        specialization: data.specialization as Specialization,
        gender: data.gender as Gender | null,
        classId,
        password,
      },
      createdById,
    );

    if (createError || !student) {
      result.failures.push({
        row: sheetRow,
        name: data.name,
        nis: data.nis,
        error: createError ?? "Gagal membuat siswa",
      });
      continue;
    }

    result.created += 1;
    result.credentials.push({
      name: data.name,
      nis: data.nis,
      email: data.email,
      password,
    });
  }

  return result;
}
