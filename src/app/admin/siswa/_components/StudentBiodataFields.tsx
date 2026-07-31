"use client";

import { genderOptions } from "@/src/lib/constants";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import {
  nullableField,
  StudentField,
  studentInputClass,
  type StudentFieldGroupProps,
} from "./StudentField";

/** Free-text profile fields, labelled from the shared sheet headers. */
const TEXT_FIELDS = [
  "nik",
  "birthPlace",
  "streetAddress",
  "village",
  "district",
  "city",
  "province",
  "fatherName",
  "motherName",
  "guardianName",
  "parentPhone",
  "previousSchoolName",
] as const;

export function StudentBiodataFields({
  register,
  errors,
}: StudentFieldGroupProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="text-foreground mb-2 text-sm font-semibold">
        Biodata & Orang Tua
      </legend>
      <StudentField label={STUDENT_SHEET_COLUMNS.gender}>
        <select
          {...register("gender", nullableField)}
          className={studentInputClass}
        >
          <option value="">— Tidak diisi —</option>
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.birthDate}
        error={errors.birthDate?.message}
      >
        <input
          type="date"
          {...register("birthDate", nullableField)}
          className={studentInputClass}
        />
      </StudentField>
      {TEXT_FIELDS.map((field) => (
        <StudentField key={field} label={STUDENT_SHEET_COLUMNS[field]}>
          <input
            {...register(field, nullableField)}
            className={studentInputClass}
          />
        </StudentField>
      ))}
    </fieldset>
  );
}
