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

export interface UpdateStudentInput {
  classId?: string | null;
  status?: StudentStatus;
}
