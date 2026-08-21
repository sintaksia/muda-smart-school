import type {
  Gender,
  Education,
  Specialization,
  EmploymentStatus,
  PromotionAction,
  StudentStatus,
} from "@prisma/client";

export interface SchoolClassInput {
  name: string;
  gradeLevel: number;
  specialization: Specialization;
  academicYear: string;
  homeroomTeacherId?: string | null;
}

export interface SubjectInput {
  name: string;
  code: string;
  specialization?: Specialization | null;
  gradeLevel?: number | null;
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nip?: string;
  nuptk?: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  education: Education;
  position?: string;
  employmentStatus: EmploymentStatus;
  subjectIds: string[];
}

export interface UpdateTeacherInput {
  nip?: string | null;
  nuptk?: string | null;
  position?: string | null;
  employmentStatus?: EmploymentStatus;
  subjectIds?: string[];
}

/** Personal biodata carried on the Student record itself (see schema note). */
export interface StudentProfileInput {
  gender?: Gender | null;
  nik?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null; // YYYY-MM-DD
  streetAddress?: string | null;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  fatherName?: string | null;
  motherName?: string | null;
  guardianName?: string | null;
  parentPhone?: string | null;
  previousSchoolName?: string | null;
}

export interface CreateStudentInput extends StudentProfileInput {
  name: string;
  /** Photo URL shown on the printed ID card; stored on User.avatar. */
  avatar?: string | null;
  email: string;
  /** Omit to derive the default password from the NIS. */
  password?: string;
  phone?: string | null;
  nis: string;
  nisn: string;
  specialization: Specialization;
  angkatan: number;
  classId?: string | null;
  status?: StudentStatus;
}

export interface UpdateStudentInput extends StudentProfileInput {
  name?: string;
  avatar?: string | null;
  phone?: string | null;
  nis?: string;
  nisn?: string;
  specialization?: Specialization;
  angkatan?: number;
  classId?: string | null;
  status?: StudentStatus;
}

/**
 * Flat, serialisable student shape shared by the admin table, the detail page
 * and the Excel export — so the table, the form and the sheet never drift.
 */
export interface StudentRow extends StudentProfileInput {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  email: string;
  phone: string | null;
  nis: string;
  nisn: string;
  specialization: string;
  angkatan: number;
  classId: string | null;
  className: string | null;
  status: string;
}

/** One created account, surfaced to the admin after an import. */
export interface StudentCredential {
  name: string;
  nis: string;
  email: string;
  password: string;
}

export interface StudentImportFailure {
  row: number;
  name: string;
  nis: string;
  error: string;
}

export interface StudentImportResult {
  created: number;
  credentials: StudentCredential[];
  failures: StudentImportFailure[];
}

export interface StudentIntakeFailure {
  registrationNumber: string;
  name: string;
  error: string;
}

/** Outcome of syncing ACCEPTED registrations into the student table. */
export interface StudentIntakeResult {
  created: number;
  credentials: StudentCredential[];
  failures: StudentIntakeFailure[];
}

/* ---- Yearly class promotion ---------------------------------------------- */

export interface PromotionClassRef {
  id: string;
  name: string;
  gradeLevel: number;
  specialization: string;
}

export interface PromotionStudentPreview {
  studentId: string;
  name: string;
  nis: string;
  defaultAction: PromotionAction;
}

/** One source class with the students it is about to hand over. */
export interface PromotionClassPreview extends PromotionClassRef {
  /** Null when this class graduates instead of moving up. */
  targetGradeLevel: number | null;
  /** Null when the destination is ambiguous — the admin picks it. */
  suggestedClassId: string | null;
  students: PromotionStudentPreview[];
}

export interface PromotionPreview {
  fromAcademicYear: string;
  toAcademicYear: string;
  classes: PromotionClassPreview[];
  /** Every class in the destination year, for the dropdowns. */
  targetClasses: PromotionClassRef[];
  /** Active students with no class — outside the run, but worth flagging. */
  unplacedStudents: { studentId: string; name: string; nis: string }[];
}

export interface PromotionEntryInput {
  studentId: string;
  action: PromotionAction;
  targetClassId?: string | null;
  exitStatus?: "TRANSFERRED" | "DROPPED_OUT" | null;
}

export interface PromotionInput {
  fromAcademicYear: string;
  toAcademicYear: string;
  entries: PromotionEntryInput[];
}

export interface PromotionResult {
  batchId: string;
  promoted: number;
  retained: number;
  graduated: number;
  exited: number;
}

export interface PromotionBatchRow {
  id: string;
  fromAcademicYear: string;
  toAcademicYear: string;
  promotedCount: number;
  retainedCount: number;
  graduatedCount: number;
  exitedCount: number;
  executedByName: string | null;
  revertedAt: Date | null;
  createdAt: Date;
}
