import { prisma } from "@/src/lib/prisma";
import type { AttendanceSettings } from "../types";

export const ATTENDANCE_SETTINGS_GROUP = "attendance";

/**
 * Defaults mirror docs/business_process_attendance.md §1. They are seed
 * values only — runtime always reads from SchoolSetting so Admin can edit
 * every rule without a deploy.
 */
export const ATTENDANCE_SETTING_DEFAULTS: Record<string, string> = {
  SESSION_GRACE_PERIOD_MINUTES: "10",
  QR_TOKEN_TTL_SECONDS: "45",
  QR_MODE: "STATIC",
  GPS_RADIUS_METERS: "100",
  GPS_SCHOOL_LAT: "-6.9345",
  GPS_SCHOOL_LNG: "107.7223",
  CREDIT_POINTS_ALPA_STUDENT: "-10",
  CREDIT_POINTS_TERLAMBAT_STUDENT: "-3",
  CREDIT_POINTS_ALPA_TEACHER: "-15",
  CREDIT_POINTS_TERLAMBAT_TEACHER: "-5",
  CREDIT_SCORE_BASE: "100",
  CREDIT_SCORE_THRESHOLD_WARNING: "70",
  CREDIT_SCORE_THRESHOLD_CRITICAL: "40",
  IZIN_SAKIT_APPROVAL_REQUIRED: "true",
  MAX_WEEKLY_HOURS: "24",
};

function toNumber(value: string | undefined, fallback: string): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : Number(fallback);
}

/**
 * Load master rules from SchoolSetting (group "attendance"), falling back
 * to defaults for any missing key.
 */
export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  const rows = await prisma.schoolSetting.findMany({
    where: { group: ATTENDANCE_SETTINGS_GROUP },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const d = ATTENDANCE_SETTING_DEFAULTS;
  const get = (key: string): string | undefined => map.get(key);

  return {
    sessionGracePeriodMinutes: toNumber(
      get("SESSION_GRACE_PERIOD_MINUTES"),
      d.SESSION_GRACE_PERIOD_MINUTES,
    ),
    qrTokenTtlSeconds: toNumber(
      get("QR_TOKEN_TTL_SECONDS"),
      d.QR_TOKEN_TTL_SECONDS,
    ),
    qrMode: get("QR_MODE") === "DYNAMIC" ? "DYNAMIC" : "STATIC",
    gpsRadiusMeters: toNumber(get("GPS_RADIUS_METERS"), d.GPS_RADIUS_METERS),
    gpsSchoolLat: toNumber(get("GPS_SCHOOL_LAT"), d.GPS_SCHOOL_LAT),
    gpsSchoolLng: toNumber(get("GPS_SCHOOL_LNG"), d.GPS_SCHOOL_LNG),
    creditPoints: {
      alpaStudent: toNumber(
        get("CREDIT_POINTS_ALPA_STUDENT"),
        d.CREDIT_POINTS_ALPA_STUDENT,
      ),
      terlambatStudent: toNumber(
        get("CREDIT_POINTS_TERLAMBAT_STUDENT"),
        d.CREDIT_POINTS_TERLAMBAT_STUDENT,
      ),
      alpaTeacher: toNumber(
        get("CREDIT_POINTS_ALPA_TEACHER"),
        d.CREDIT_POINTS_ALPA_TEACHER,
      ),
      terlambatTeacher: toNumber(
        get("CREDIT_POINTS_TERLAMBAT_TEACHER"),
        d.CREDIT_POINTS_TERLAMBAT_TEACHER,
      ),
    },
    creditScoreBase: toNumber(get("CREDIT_SCORE_BASE"), d.CREDIT_SCORE_BASE),
    creditScoreThresholdWarning: toNumber(
      get("CREDIT_SCORE_THRESHOLD_WARNING"),
      d.CREDIT_SCORE_THRESHOLD_WARNING,
    ),
    creditScoreThresholdCritical: toNumber(
      get("CREDIT_SCORE_THRESHOLD_CRITICAL"),
      d.CREDIT_SCORE_THRESHOLD_CRITICAL,
    ),
    izinSakitApprovalRequired:
      (get("IZIN_SAKIT_APPROVAL_REQUIRED") ??
        d.IZIN_SAKIT_APPROVAL_REQUIRED) === "true",
    maxWeeklyHours: toNumber(get("MAX_WEEKLY_HOURS"), d.MAX_WEEKLY_HOURS),
  };
}
