import { z } from "zod";
import {
  GENDER_VALUES,
  SPECIALIZATION_VALUES,
  STUDENT_STATUS_VALUES,
} from "@/src/lib/constants";
import { passwordSchema } from "@/src/lib/validation";

const GENDER_TUPLE = GENDER_VALUES as ["MALE", "FEMALE"];
const SPECIALIZATION_TUPLE = SPECIALIZATION_VALUES as [
  "AUTOMOTIVE_ENGINEERING",
  "SOFTWARE_AND_GAME_DEVELOPMENT",
  "NETWORK_AND_TELECOMMUNICATIONS_ENGINEERING",
  "OFFICE_MANAGEMENT_AND_BUSINESS_SERVICES",
  "ACCOUNTING_AND_INSTITUTIONAL_FINANCE",
];
const STUDENT_STATUS_TUPLE = STUDENT_STATUS_VALUES as [
  "AKTIF",
  "LULUS",
  "PINDAH",
  "DROPOUT",
];

/** Optional free-text field: an empty cell/input means "not filled in". */
const optionalText = z.string().trim().optional().nullable();

const profileFields = {
  // Null (not "") means "not recorded" — the form maps its empty select to null.
  gender: z.enum(GENDER_TUPLE).optional().nullable(),
  nik: optionalText,
  birthPlace: optionalText,
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Tanggal lahir tidak valid" })
    .optional()
    .nullable()
    .or(z.literal("")),
  streetAddress: optionalText,
  village: optionalText,
  district: optionalText,
  city: optionalText,
  province: optionalText,
  fatherName: optionalText,
  motherName: optionalText,
  guardianName: optionalText,
  parentPhone: optionalText,
  previousSchoolName: optionalText,
};

export const createStudentSchema = z.object({
  name: z.string({ message: "Nama wajib diisi" }).trim().min(3, {
    message: "Nama minimal 3 karakter",
  }),
  email: z.email({ message: "Email tidak valid" }),
  /** Blank means "use the NIS-derived default password". */
  password: passwordSchema.optional().or(z.literal("")),
  phone: optionalText,
  nis: z.string({ message: "NIS wajib diisi" }).trim().min(1, {
    message: "NIS wajib diisi",
  }),
  nisn: z.string({ message: "NISN wajib diisi" }).trim().min(1, {
    message: "NISN wajib diisi",
  }),
  specialization: z.enum(SPECIALIZATION_TUPLE, {
    message: "Program keahlian wajib dipilih",
  }),
  angkatan: z
    .number({ message: "Angkatan wajib diisi" })
    .int()
    .min(2000, { message: "Angkatan tidak valid" }),
  classId: z.string().optional().nullable(),
  status: z.enum(STUDENT_STATUS_TUPLE).optional(),
  ...profileFields,
});

export const updateStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Nama minimal 3 karakter" })
    .optional(),
  phone: optionalText,
  nis: z.string().trim().min(1).optional(),
  nisn: z.string().trim().min(1).optional(),
  specialization: z.enum(SPECIALIZATION_TUPLE).optional(),
  angkatan: z.number().int().min(2000).optional(),
  classId: z.string().optional().nullable(),
  status: z
    .enum(STUDENT_STATUS_TUPLE, { message: "Status tidak valid" })
    .optional(),
  ...profileFields,
});

/** Import payload: raw sheet rows keyed by their Indonesian column header. */
export const importStudentsSchema = z.object({
  rows: z
    .array(z.record(z.string(), z.unknown()))
    .min(1, { message: "File tidak berisi data" })
    .max(500, { message: "Maksimal 500 baris per impor" }),
});

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;
