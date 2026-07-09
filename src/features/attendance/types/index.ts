import type {
  AbsensiStatus,
  CreditEntryType,
  CreditOwnerType,
  HariEnum,
} from "@prisma/client";

/**
 * Master rules (Process "Master Rules") — stored in SchoolSetting rows
 * (group = "attendance"), never hardcoded in business logic.
 */
export interface AttendanceSettings {
  sessionGracePeriodMinutes: number;
  qrTokenTtlSeconds: number;
  /** "STATIC" = one token per session, "DYNAMIC" = token rotates every TTL */
  qrMode: "STATIC" | "DYNAMIC";
  gpsRadiusMeters: number;
  gpsSchoolLat: number;
  gpsSchoolLng: number;
  creditPoints: {
    alpaStudent: number;
    terlambatStudent: number;
    alpaTeacher: number;
    terlambatTeacher: number;
  };
  creditScoreBase: number;
  creditScoreThresholdWarning: number;
  creditScoreThresholdCritical: number;
  izinSakitApprovalRequired: boolean;
  maxWeeklyHours: number;
}

export interface JadwalInput {
  kelasId: string;
  mataPelajaranId: string;
  guruId: string;
  hari: HariEnum;
  jamMulai: string;
  jamSelesai: string;
  tahunAjaran?: string;
}

export interface JadwalValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScanInput {
  token: string;
  studentUserId: string;
  gpsLat?: number;
  gpsLng?: number;
}

export interface ScanResult {
  ok: boolean;
  status?: AbsensiStatus;
  needsReview?: boolean;
  error?: string;
}

export interface ManualCreditInput {
  ownerType: CreditOwnerType;
  ownerId: string;
  type: Extract<CreditEntryType, "PRESTASI" | "PELANGGARAN">;
  category: string;
  points: number;
  note?: string;
  evidence?: string;
  reportedById: string;
}

export interface SubmitIzinInput {
  studentId: string;
  jenis: "IZIN" | "SAKIT";
  tanggal: string; // YYYY-MM-DD (WIB)
  jadwalId?: string;
  alasan: string;
  lampiran?: string;
  submittedById?: string;
}

export interface ReportTeacherAbsenceInput {
  guruId: string;
  tanggal: string; // YYYY-MM-DD (WIB)
  status: "IZIN" | "SAKIT" | "ALPHA";
  catatan?: string;
  reportedById?: string;
  jadwalIds?: string[]; // default: all schedules of that teacher on that day
}
