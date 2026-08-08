"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { ImageUpload } from "@/src/app/admin/_components/ImageUpload";
import { STUDENT_SHEET_COLUMNS } from "@/src/features/master/constants";
import {
  nullableField,
  StudentField,
  studentInputClass,
  type StudentFieldGroupProps,
} from "./StudentField";

interface StudentAccountFieldsProps extends StudentFieldGroupProps {
  isEdit: boolean;
}

export function StudentAccountFields({
  register,
  control,
  errors,
  isEdit,
}: StudentAccountFieldsProps) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="text-foreground mb-2 text-sm font-semibold">
        Akun
      </legend>
      <div className="sm:col-span-2">
        <StudentField
          label="Foto"
          error={errors.avatar?.message}
          hint="Dicetak pada kartu siswa — kosongkan untuk memakai inisial nama"
        >
          <Controller
            control={control}
            name="avatar"
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? ""}
                folder="students"
                onChange={(url) => field.onChange(url || null)}
              />
            )}
          />
        </StudentField>
      </div>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.name}
        error={errors.name?.message}
      >
        <Input {...register("name")} className={studentInputClass} />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.email}
        error={errors.email?.message}
        hint={isEdit ? "Email login tidak dapat diubah di sini" : undefined}
      >
        <Input
          type="email"
          {...register("email")}
          disabled={isEdit}
          className={`${studentInputClass} disabled:bg-muted`}
        />
      </StudentField>
      <StudentField
        label={STUDENT_SHEET_COLUMNS.phone}
        error={errors.phone?.message}
      >
        <Input
          {...register("phone", nullableField)}
          className={studentInputClass}
        />
      </StudentField>
      {!isEdit && (
        <StudentField
          label="Password"
          error={errors.password?.message}
          hint="Kosongkan untuk memakai password default dari NIS"
        >
          <Input
            type="text"
            autoComplete="off"
            {...register("password")}
            className={studentInputClass}
          />
        </StudentField>
      )}
    </fieldset>
  );
}
