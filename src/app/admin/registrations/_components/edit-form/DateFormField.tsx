"use client";

import { DateField } from "@/src/components/common/DateField";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  FieldLabel,
  type RegistrasiControl,
  type RegistrasiFieldName,
} from "./FormFields";

interface DateFormFieldProps {
  control: RegistrasiControl;
  name: RegistrasiFieldName;
  label: string;
  className?: string;
  /** Widen the range for a date of birth. See `DateField`. */
  birthDate?: boolean;
}

/** Date counterpart to `TextFormField`. Lives in its own file so `FormFields`
 *  stays under the 150-line component ceiling. */
export function DateFormField({
  control,
  name,
  label,
  className,
  birthDate,
}: DateFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            <FieldLabel name={name}>{label}</FieldLabel>
          </FormLabel>
          <DateField
            ariaLabel={label}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            birthDate={birthDate}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
