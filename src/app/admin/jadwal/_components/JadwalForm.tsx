"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { dayOfWeekOptions, ENTITY_LABELS } from "@/src/lib/constants";
import {
  scheduleSchema,
  type ScheduleFormData,
} from "@/src/app/api/attendance/schedules/ScheduleSchema";
import { JadwalSelectField } from "./JadwalSelectField";

interface JadwalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classOptions: { id: string; name: string }[];
  subjectOptions: { id: string; name: string }[];
  teacherOptions: { id: string; name: string }[];
}

const toSelectOptions = (items: { id: string; name: string }[]) =>
  items.map((item) => ({ value: item.id, label: item.name }));

export function JadwalForm({
  open,
  onOpenChange,
  classOptions,
  subjectOptions,
  teacherOptions,
}: JadwalFormProps) {
  const router = useRouter();
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { startTime: "07:00", endTime: "08:30" },
  });

  async function onSubmit(values: ScheduleFormData): Promise<void> {
    try {
      const response = await fetch("/api/attendance/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Gagal menyimpan jadwal");
      }
      for (const warning of data.warnings ?? []) {
        toast.warning(warning);
      }
      toast.success("Jadwal tersimpan");
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    }
  }

  const selectFields = [
    {
      name: "classId" as const,
      label: ENTITY_LABELS.CLASS,
      options: toSelectOptions(classOptions),
    },
    {
      name: "subjectId" as const,
      label: ENTITY_LABELS.SUBJECT,
      options: toSelectOptions(subjectOptions),
    },
    {
      name: "teacherId" as const,
      label: ENTITY_LABELS.TEACHER,
      options: toSelectOptions(teacherOptions),
    },
    { name: "dayOfWeek" as const, label: "Hari", options: dayOfWeekOptions },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-modal sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink">Tambah Jadwal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {selectFields.map((field) => (
              <JadwalSelectField
                key={field.name}
                control={form.control}
                name={field.name}
                label={field.label}
                options={field.options}
              />
            ))}

            <div className="grid grid-cols-2 gap-4">
              {(["startTime", "endTime"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {name === "startTime" ? "Jam Mulai" : "Jam Selesai"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="rounded-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-brand hover:bg-brand-600 active:bg-brand-700 rounded-input h-11 w-full text-sm font-semibold text-white"
            >
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
