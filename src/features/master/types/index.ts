import type {
  Gender,
  Education,
  Specialization,
  EmploymentStatus,
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
