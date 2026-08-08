/**
 * Single source of truth for the attendance master rules stored as
 * SchoolSetting rows (group "attendance").
 *
 * Deliberately dependency-free: prisma/seed.ts imports this by relative path
 * (it runs outside Next's path aliases), and services/settings.ts derives the
 * runtime defaults from it. Add a rule here and every consumer follows.
 */
export interface AttendanceSettingDefinition {
  key: string;
  /** Seed value, and the fallback when the row is missing at runtime. */
  value: string;
  label: string;
  type: "NUMBER" | "TEXT" | "BOOLEAN";
}

export const ATTENDANCE_SETTING_DEFINITIONS: AttendanceSettingDefinition[] = [
  {
    key: "SESSION_GRACE_PERIOD_MINUTES",
    value: "10",
    label: "Toleransi keterlambatan (menit)",
    type: "NUMBER",
  },
  {
    key: "QR_TOKEN_TTL_SECONDS",
    value: "45",
    label: "Interval refresh QR dinamis (detik)",
    type: "NUMBER",
  },
  {
    key: "QR_MODE",
    value: "STATIC",
    label: "Mode QR (STATIC/DYNAMIC)",
    type: "TEXT",
  },
  {
    key: "ATTENDANCE_SCAN_MODE",
    value: "BOTH",
    label: "Arah scan presensi",
    type: "TEXT",
  },
  {
    key: "GPS_RADIUS_METERS",
    value: "100",
    label: "Radius GPS dari sekolah (meter)",
    type: "NUMBER",
  },
  {
    key: "GPS_SCHOOL_LAT",
    value: "-6.9345",
    label: "Latitude sekolah",
    type: "NUMBER",
  },
  {
    key: "GPS_SCHOOL_LNG",
    value: "107.7223",
    label: "Longitude sekolah",
    type: "NUMBER",
  },
  {
    key: "CREDIT_POINTS_ALPA_STUDENT",
    value: "-10",
    label: "Poin alpa siswa",
    type: "NUMBER",
  },
  {
    key: "CREDIT_POINTS_TERLAMBAT_STUDENT",
    value: "-3",
    label: "Poin terlambat siswa",
    type: "NUMBER",
  },
  {
    key: "CREDIT_POINTS_ALPA_TEACHER",
    value: "-15",
    label: "Poin alpa guru",
    type: "NUMBER",
  },
  {
    key: "CREDIT_POINTS_TERLAMBAT_TEACHER",
    value: "-5",
    label: "Poin terlambat guru",
    type: "NUMBER",
  },
  {
    key: "CREDIT_SCORE_BASE",
    value: "100",
    label: "Skor kredit awal",
    type: "NUMBER",
  },
  {
    key: "CREDIT_SCORE_THRESHOLD_WARNING",
    value: "70",
    label: "Ambang peringatan skor kredit",
    type: "NUMBER",
  },
  {
    key: "CREDIT_SCORE_THRESHOLD_CRITICAL",
    value: "40",
    label: "Ambang kritis skor kredit",
    type: "NUMBER",
  },
  {
    key: "IZIN_SAKIT_APPROVAL_REQUIRED",
    value: "true",
    label: "Izin/sakit wajib disetujui wali kelas",
    type: "BOOLEAN",
  },
  {
    key: "MAX_WEEKLY_HOURS",
    value: "24",
    label: "Batas jam mengajar mingguan",
    type: "NUMBER",
  },
];
