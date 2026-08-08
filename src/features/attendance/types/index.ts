import type {
  AttendanceStatus,
  CreditEntryType,
  CreditOwnerType,
  DayOfWeek,
} from "@prisma/client";

/**
 * Direction attendance scanning runs in. Values mirror
 * `attendanceScanModeOptions` in src/lib/constants.ts.
 */
export type AttendanceScanMode = "STUDENT_SCAN" | "TEACHER_SCAN" | "BOTH";

/**
 * Master rules (Process "Master Rules") — stored in SchoolSetting rows
 * (group = "attendance"), never hardcoded in business logic.
 */
export interface AttendanceSettings {
  sessionGracePeriodMinutes: number;
  qrTokenTtlSeconds: number;
  /** "STATIC" = one token per session, "DYNAMIC" = token rotates every TTL */
  qrMode: "STATIC" | "DYNAMIC";
  scanMode: AttendanceScanMode;
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

export interface ScheduleInput {
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  academicYear?: string;
}

export interface ScheduleValidationResult {
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
  status?: AttendanceStatus;
  needsReview?: boolean;
  error?: string;
}

/**
 * Teacher-side card scan. Exactly one of `cardToken` (read from the card QR)
 * or `nis` (typed in when the card is missing) identifies the student.
 */
export interface CardScanInput {
  sessionId: string;
  cardToken?: string;
  nis?: string;
}

export interface CardScanResult {
  ok: boolean;
  /** True when the student was already recorded — success, but no new row. */
  duplicate?: boolean;
  status?: AttendanceStatus;
  studentId?: string;
  studentName?: string;
  nis?: string;
  error?: string;
}

export interface ManualCreditInput {
  ownerType: CreditOwnerType;
  ownerId: string;
  type: Extract<CreditEntryType, "ACHIEVEMENT" | "VIOLATION">;
  category: string;
  points: number;
  note?: string;
  evidence?: string;
  reportedById: string;
}

export interface SubmitLeaveRequestInput {
  studentId: string;
  type: "PERMISSION" | "SICK";
  date: string; // YYYY-MM-DD (WIB)
  scheduleId?: string;
  reason: string;
  attachment?: string;
  submittedById?: string;
}

export interface ReportTeacherAbsenceInput {
  teacherId: string;
  date: string; // YYYY-MM-DD (WIB)
  status: "EXCUSED" | "SICK" | "ABSENT";
  note?: string;
  reportedById?: string;
  scheduleIds?: string[]; // default: all schedules of that teacher on that day
}
