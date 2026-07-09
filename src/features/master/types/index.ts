import type {
  JenisKelamin,
  Pendidikan,
  ProgramKeahlian,
  StatusKepegawaian,
  StudentStatus,
} from "@prisma/client";

export interface KelasInput {
  nama: string;
  tingkat: number;
  programKeahlian: ProgramKeahlian;
  tahunAjaran: string;
  waliKelasId?: string | null;
}

export interface MapelInput {
  nama: string;
  kode: string;
  programKeahlian?: ProgramKeahlian | null;
  tingkat?: number | null;
}

export interface CreateGuruInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nip?: string;
  nuptk?: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  pendidikanTerakhir: Pendidikan;
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
