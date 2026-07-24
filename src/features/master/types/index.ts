import type {
  Gender,
  Education,
  Specialization,
  StatusKepegawaian,
  StudentStatus,
} from "@prisma/client";

export interface KelasInput {
  nama: string;
  tingkat: number;
  specialization: Specialization;
  tahunAjaran: string;
  waliKelasId?: string | null;
}

export interface MapelInput {
  nama: string;
  kode: string;
  specialization?: Specialization | null;
  tingkat?: number | null;
}

export interface CreateGuruInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nip?: string;
  nuptk?: string;
  gender: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  education: Education;
  jabatan?: string;
  statusKepegawaian: StatusKepegawaian;
  mataPelajaranIds: string[];
}

export interface UpdateGuruInput {
  nip?: string | null;
  nuptk?: string | null;
  jabatan?: string | null;
  statusKepegawaian?: StatusKepegawaian;
  mataPelajaranIds?: string[];
}

export interface UpdateSiswaInput {
  kelasId?: string | null;
  status?: StudentStatus;
}
