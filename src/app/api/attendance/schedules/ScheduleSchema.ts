import { z } from "zod";
import { DAY_OF_WEEK_VALUES } from "@/src/lib/constants";

const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/;

export const scheduleSchema = z.object({
  classId: z.string({ message: "Kelas wajib dipilih" }).min(1),
  subjectId: z.string({ message: "Mapel wajib dipilih" }).min(1),
  teacherId: z.string({ message: "Guru wajib dipilih" }).min(1),
  dayOfWeek: z.enum(
    DAY_OF_WEEK_VALUES as [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ],
    { message: "Hari wajib dipilih" },
  ),
  startTime: z
    .string()
    .regex(timePattern, { message: "Jam mulai tidak valid" }),
  endTime: z
    .string()
    .regex(timePattern, { message: "Jam selesai tidak valid" }),
  academicYear: z.string().optional(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;
