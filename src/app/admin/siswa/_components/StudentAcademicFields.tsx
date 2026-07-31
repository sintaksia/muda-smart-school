"use client";

import {
  ENTITY_LABELS,
  specializationOptions,
  studentStatusOptions,
} from "@/src/lib/constants";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import {
  nullableField,
  StudentField,
  studentInputClass,
  type StudentFieldGroupProps,
} from "./StudentField";

interface StudentAcademicFieldsProps extends StudentFieldGroupProps {
  classOptions: { id: string; name: string }[];
}

export function StudentAcademicFields({
  register,
  errors,
  classOptions,
}: StudentAcademicFieldsProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="text-foreground mb-2 text-sm font-semibold">
        Data Akademik
      </legend>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.nis}
        error={errors.nis?.message}
      >
        <input {...register("nis")} className={studentInputClass} />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.nisn}
        error={errors.nisn?.message}
      >
        <input {...register("nisn")} className={studentInputClass} />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.specialization}
        error={errors.specialization?.message}
      >
        <select {...register("specialization")} className={studentInputClass}>
          {specializationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.angkatan}
        error={errors.angkatan?.message}
      >
        <input
          type="number"
          {...register("angkatan", { valueAsNumber: true })}
          className={studentInputClass}
        />
      </StudentField>
      <StudentField label={ENTITY_LABELS.CLASS}>
        <select
          {...register("classId", nullableField)}
          className={studentInputClass}
        >
          <option value="">— Belum ditempatkan —</option>
          {classOptions.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name}
            </option>
          ))}
        </select>
      </StudentField>
      <StudentField label="Status" error={errors.status?.message}>
        <select {...register("status")} className={studentInputClass}>
          {studentStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </StudentField>
    </fieldset>
  );
}
