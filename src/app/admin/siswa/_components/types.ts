export interface SiswaRow {
  id: string;
  nama: string;
  email: string;
  nis: string;
  nisn: string;
  programKeahlian: string;
  angkatan: number;
  kelasId: string | null;
  kelasNama: string | null;
  status: string;
}

export interface KelasOption {
  id: string;
  nama: string;
  tingkat: number;
  tahunAjaran: string;
}
