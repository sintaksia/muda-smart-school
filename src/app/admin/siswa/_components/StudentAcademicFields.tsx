"use client";

import { Input } from "@/src/components/ui/input";
import { FormSelect } from "@/src/components/common/FormSelect";
import {
  ENTITY_LABELS,
  specializationOptions,
  studentStatusOptions,
} from "@/src/lib/constants";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import {
  StudentField,
  studentInputClass,
  type StudentFieldGroupProps,
} from "./StudentField";

interface StudentAcademicFieldsProps extends StudentFieldGroupProps {
  classOptions: { id: string; name: string }[];
}

export function StudentAcademicFields({
  register,
  control,
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
        <Input {...register("nis")} className={studentInputClass} />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.nisn}
        error={errors.nisn?.message}
      >
        <Input {...register("nisn")} className={studentInputClass} />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.specialization}
        error={errors.specialization?.message}
      >
        <FormSelect
          control={control}
          name="specialization"
          ariaLabel={STUDENT_SHEET_COLUMNS.specialization}
          className={studentInputClass}
          options={specializationOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.angkatan}
        error={errors.angkatan?.message}
      >
        <Input
          type="number"
          {...register("angkatan", { valueAsNumber: true })}
          className={studentInputClass}
        />
      </StudentField>
      <StudentField label={ENTITY_LABELS.CLASS}>
        <FormSelect
          control={control}
          name="classId"
          ariaLabel={ENTITY_LABELS.CLASS}
          className={studentInputClass}
          emptyLabel="— Belum ditempatkan —"
          options={classOptions.map((schoolClass) => ({
            value: schoolClass.id,
            label: schoolClass.name,
          }))}
        />
      </StudentField>
      <StudentField label="Status" error={errors.status?.message}>
        <FormSelect
          control={control}
          name="status"
          ariaLabel="Status"
          className={studentInputClass}
          options={studentStatusOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </StudentField>
    </fieldset>
  );
}
