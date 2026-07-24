-- Phase 3: Standardize Attendance & Credit domain naming to English (non-destructive renames only).
-- Verify actual column names first if this schema has drifted (\d jadwal / \d sesi / \d absensi_siswa /
-- \d absensi_guru / \d pengajuan_izin / \d credit_scores / \d credit_categories, or information_schema.columns)
-- before running.

-- 1. Schedules (was jadwal)
ALTER TABLE "jadwal" RENAME TO "schedules";
ALTER TABLE "schedules" RENAME COLUMN "kelas_id" TO "class_id";
ALTER TABLE "schedules" RENAME COLUMN "mata_pelajaran_id" TO "subject_id";
ALTER TABLE "schedules" RENAME COLUMN "guru_id" TO "teacher_id";
ALTER TABLE "schedules" RENAME COLUMN "hari" TO "day_of_week";
ALTER TABLE "schedules" RENAME COLUMN "jam_mulai" TO "start_time";
ALTER TABLE "schedules" RENAME COLUMN "jam_selesai" TO "end_time";
ALTER TABLE "schedules" RENAME COLUMN "tahun_ajaran" TO "academic_year";

-- 2. Sessions (was sesi)
ALTER TABLE "sesi" RENAME TO "sessions";
ALTER TABLE "sessions" RENAME COLUMN "jadwal_id" TO "schedule_id";
ALTER TABLE "sessions" RENAME COLUMN "tanggal" TO "date";
ALTER TABLE "sessions" RENAME COLUMN "actual_guru_id" TO "actual_teacher_id";

-- 3. Student attendance (was absensi_siswa)
ALTER TABLE "absensi_siswa" RENAME TO "student_attendance";
ALTER TABLE "student_attendance" RENAME COLUMN "jadwal_id" TO "schedule_id";
ALTER TABLE "student_attendance" RENAME COLUMN "sesi_id" TO "session_id";
ALTER TABLE "student_attendance" RENAME COLUMN "tanggal" TO "date";
ALTER TABLE "student_attendance" RENAME COLUMN "catatan" TO "note";

-- 4. Teacher attendance (was absensi_guru)
ALTER TABLE "absensi_guru" RENAME TO "teacher_attendance";
ALTER TABLE "teacher_attendance" RENAME COLUMN "jadwal_id" TO "schedule_id";
ALTER TABLE "teacher_attendance" RENAME COLUMN "guru_id" TO "teacher_id";
ALTER TABLE "teacher_attendance" RENAME COLUMN "tanggal" TO "date";
ALTER TABLE "teacher_attendance" RENAME COLUMN "jam_masuk" TO "check_in_time";
ALTER TABLE "teacher_attendance" RENAME COLUMN "catatan" TO "note";
ALTER TABLE "teacher_attendance" RENAME COLUMN "substitute_guru_id" TO "substitute_teacher_id";

-- 5. Credit scores
ALTER TABLE "credit_scores" RENAME COLUMN "guru_id" TO "teacher_id";
ALTER TABLE "credit_scores" RENAME COLUMN "ref_sesi_id" TO "ref_session_id";

-- 6. Credit categories
ALTER TABLE "credit_categories" RENAME COLUMN "nama" TO "name";

-- 7. Leave requests (was pengajuan_izin)
ALTER TABLE "pengajuan_izin" RENAME TO "leave_requests";
ALTER TABLE "leave_requests" RENAME COLUMN "jenis" TO "type";
ALTER TABLE "leave_requests" RENAME COLUMN "tanggal" TO "date";
ALTER TABLE "leave_requests" RENAME COLUMN "jadwal_id" TO "schedule_id";
ALTER TABLE "leave_requests" RENAME COLUMN "sesi_id" TO "session_id";
ALTER TABLE "leave_requests" RENAME COLUMN "alasan" TO "reason";
ALTER TABLE "leave_requests" RENAME COLUMN "lampiran" TO "attachment";

-- 8. Enum type renames
ALTER TYPE "HariEnum" RENAME TO "DayOfWeek";
ALTER TYPE "AbsensiStatus" RENAME TO "AttendanceStatus";
ALTER TYPE "AbsensiMethod" RENAME TO "AttendanceMethod";
ALTER TYPE "SesiStatus" RENAME TO "SessionStatus";
ALTER TYPE "IzinJenis" RENAME TO "LeaveType";
ALTER TYPE "IzinStatus" RENAME TO "LeaveStatus";

-- 9. Enum value renames
ALTER TYPE "DayOfWeek" RENAME VALUE 'SENIN' TO 'MONDAY';
ALTER TYPE "DayOfWeek" RENAME VALUE 'SELASA' TO 'TUESDAY';
ALTER TYPE "DayOfWeek" RENAME VALUE 'RABU' TO 'WEDNESDAY';
ALTER TYPE "DayOfWeek" RENAME VALUE 'KAMIS' TO 'THURSDAY';
ALTER TYPE "DayOfWeek" RENAME VALUE 'JUMAT' TO 'FRIDAY';
ALTER TYPE "DayOfWeek" RENAME VALUE 'SABTU' TO 'SATURDAY';

ALTER TYPE "AttendanceStatus" RENAME VALUE 'HADIR' TO 'PRESENT';
ALTER TYPE "AttendanceStatus" RENAME VALUE 'TERLAMBAT' TO 'LATE';
ALTER TYPE "AttendanceStatus" RENAME VALUE 'SAKIT' TO 'SICK';
ALTER TYPE "AttendanceStatus" RENAME VALUE 'IZIN' TO 'EXCUSED';
ALTER TYPE "AttendanceStatus" RENAME VALUE 'ALPHA' TO 'ABSENT';

ALTER TYPE "SessionStatus" RENAME VALUE 'KELAS_KOSONG' TO 'NO_CLASS';

ALTER TYPE "LeaveType" RENAME VALUE 'IZIN' TO 'PERMISSION';
ALTER TYPE "LeaveType" RENAME VALUE 'SAKIT' TO 'SICK';
-- LeaveStatus values (PENDING/APPROVED/REJECTED) already English, no rename needed.

-- NotificationType is not a Postgres enum column here beyond its own type; rename its values too.
ALTER TYPE "NotificationType" RENAME VALUE 'KELAS_KOSONG' TO 'NO_CLASS';
ALTER TYPE "NotificationType" RENAME VALUE 'IZIN_STATUS' TO 'LEAVE_STATUS';

ALTER TYPE "CreditEntryType" RENAME VALUE 'PRESTASI' TO 'ACHIEVEMENT';
ALTER TYPE "CreditEntryType" RENAME VALUE 'PELANGGARAN' TO 'VIOLATION';
ALTER TYPE "CreditEntryType" RENAME VALUE 'KOREKSI' TO 'CORRECTION';
