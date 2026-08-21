import { z } from "zod";
import {
  PROMOTION_ACTION_VALUES,
  PROMOTION_ACTIONS_NEEDING_CLASS,
  PROMOTION_EXIT_STATUS_VALUES,
} from "@/src/lib/constants";

const ACTION_TUPLE = PROMOTION_ACTION_VALUES as [
  "PROMOTE",
  "RETAIN",
  "GRADUATE",
  "EXIT",
];
const EXIT_STATUS_TUPLE = PROMOTION_EXIT_STATUS_VALUES as [
  "TRANSFERRED",
  "DROPPED_OUT",
];

export const academicYearSchema = z
  .string({ message: "Tahun ajaran wajib diisi" })
  .regex(/^\d{4}\/\d{4}$/, { message: "Format tahun ajaran: 2026/2027" });

const entrySchema = z.object({
  studentId: z.string({ message: "Siswa wajib dipilih" }).min(1),
  action: z.enum(ACTION_TUPLE, { message: "Aksi kenaikan tidak dikenal" }),
  targetClassId: z.string().nullable().optional(),
  exitStatus: z.enum(EXIT_STATUS_TUPLE, {
    message: "Status keluar tidak dikenal",
  })
    .nullable()
    .optional(),
});

export const classPromotionSchema = z
  .object({
    fromAcademicYear: academicYearSchema,
    toAcademicYear: academicYearSchema,
    entries: z
      .array(entrySchema)
      .min(1, { message: "Tidak ada siswa yang diproses" }),
  })
  .superRefine((data, ctx) => {
    if (data.fromAcademicYear === data.toAcademicYear) {
      ctx.addIssue({
        code: "custom",
        path: ["toAcademicYear"],
        message: "Tahun ajaran tujuan harus berbeda",
      });
    }
    data.entries.forEach((entry, index) => {
      const needsClass = (
        PROMOTION_ACTIONS_NEEDING_CLASS as readonly string[]
      ).includes(entry.action);
      if (needsClass && !entry.targetClassId) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "targetClassId"],
          message: "Kelas tujuan wajib dipilih",
        });
      }
      if (entry.action === "EXIT" && !entry.exitStatus) {
        ctx.addIssue({
          code: "custom",
          path: ["entries", index, "exitStatus"],
          message: "Status keluar wajib dipilih",
        });
      }
    });
  });

export const revertPromotionSchema = z.object({
  batchId: z.string({ message: "Proses kenaikan wajib dipilih" }).min(1),
});

export type ClassPromotionFormData = z.infer<typeof classPromotionSchema>;
