"use client";

import { Input } from "@/src/components/ui/input";
import { FormSelect } from "@/src/components/common/FormSelect";
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
  control,
  errors,
}: StudentFieldGroupProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="text-foreground mb-2 text-sm font-semibold">
        Biodata & Orang Tua
      </legend>
      <StudentField label={STUDENT_SHEET_COLUMNS.gender}>
        <FormSelect
          control={control}
          name="gender"
          ariaLabel={STUDENT_SHEET_COLUMNS.gender}
          className={studentInputClass}
          emptyLabel="— Tidak diisi —"
          options={genderOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.birthDate}
        error={errors.birthDate?.message}
      >
        <Input
          type="date"
          {...register("birthDate", nullableField)}
          className={studentInputClass}
        />
      </StudentField>
      {TEXT_FIELDS.map((field) => (
        <StudentField key={field} label={STUDENT_SHEET_COLUMNS[field]}>
          <Input
            {...register(field, nullableField)}
            className={studentInputClass}
          />
        </StudentField>
      ))}
    </fieldset>
  );
}
