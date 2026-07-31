"use client";

import { StudentAcademicFields } from "./StudentAcademicFields";
import { StudentAccountFields } from "./StudentAccountFields";
import { StudentBiodataFields } from "./StudentBiodataFields";
import type { StudentFieldGroupProps } from "./StudentField";

interface StudentFormSectionsProps extends StudentFieldGroupProps {
  classOptions: { id: string; name: string }[];
  isEdit: boolean;
}

export function StudentFormSections({
  register,
  errors,
  classOptions,
  isEdit,
}: StudentFormSectionsProps) {
  return (
    <div className="space-y-5">
      <StudentAccountFields
        register={register}
        errors={errors}
        isEdit={isEdit}
      />
      <StudentAcademicFields
        register={register}
        errors={errors}
        classOptions={classOptions}
      />
      <StudentBiodataFields register={register} errors={errors} />
    </div>
  );
}
