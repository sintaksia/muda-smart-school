"use client";

import type { Control, FieldPath } from "react-hook-form";
import {
  requiredFields,
  type RegistrasiFormData,
} from "@/src/features/registration/services/registration.schema";
import { Input } from "@/src/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

export type RegistrasiControl = Control<RegistrasiFormData>;
export type RegistrasiFieldName = FieldPath<RegistrasiFormData>;

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function FormSection({ title, icon, children }: FormSectionProps) {
  return (
    <Card className="border-primary-100 pt-0 rounded-t-lg">
      <CardHeader className="bg-primary-50 rounded-t-lg pt-2">
        <CardTitle className="flex items-center gap-2 text-primary-900">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function FieldLabel({
  name,
  children,
}: {
  name: RegistrasiFieldName;
  children: React.ReactNode;
}) {
  const isRequired = requiredFields.has(name);
  return (
    <>
      {children}
      {isRequired && <span className="text-red-500 ml-1">*</span>}
    </>
  );
}

interface TextFormFieldProps {
  control: RegistrasiControl;
  name: RegistrasiFieldName;
  label: string;
  type?: string;
  className?: string;
}

export function TextFormField({
  control,
  name,
  label,
  type = "text",
  className,
}: TextFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            <FieldLabel name={name}>{label}</FieldLabel>
          </FormLabel>
          <FormControl>
            <Input type={type} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectFormFieldProps {
  control: RegistrasiControl;
  name: RegistrasiFieldName;
  label: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  className?: string;
}

export function SelectFormField({
  control,
  name,
  label,
  placeholder,
  options,
  className,
}: SelectFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            <FieldLabel name={name}>{label}</FieldLabel>
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
