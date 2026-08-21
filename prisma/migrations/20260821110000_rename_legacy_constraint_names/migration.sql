-- Housekeeping: bring constraint and index NAMES in line with the table names
-- they belong to. Purely cosmetic — every constraint already exists and is
-- enforced; only the identifiers are stale.
--
-- Origin: the July 2026 rename migrations (20260724022618, 20260724101230,
-- 20260724170139) issued 21 `ALTER TABLE ... RENAME TO` but almost no
-- `RENAME CONSTRAINT`. Postgres does not rename a table's constraints or
-- indexes when the table is renamed, so they kept their Indonesian names while
-- Prisma derives the expected names from the new table names. The result: every
-- `prisma migrate diff` reported ~53 phantom statements, which buried real
-- drift.
--
-- Each rename is guarded on the old name still existing, so this is idempotent
-- and safe on a database that is already correct (or only partly renamed).
-- Each statement takes a brief ACCESS EXCLUSIVE lock on its table; they are
-- metadata-only and sub-millisecond, but prefer a quiet moment on production.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('leave_requests'::text,'pengajuan_izin_pkey'::text,'leave_requests_pkey'::text),
      ('registrations','pendaftaran_pkey','registrations_pkey'),
      ('schedules','jadwal_pkey','schedules_pkey'),
      ('school_classes','kelas_pkey','school_classes_pkey'),
      ('sessions','sesi_pkey','sessions_pkey'),
      ('student_attendance','absensi_siswa_pkey','student_attendance_pkey'),
      ('subjects','mata_pelajaran_pkey','subjects_pkey'),
      ('teacher_attendance','absensi_guru_pkey','teacher_attendance_pkey'),
      ('teacher_subjects','guru_mata_pelajaran_pkey','teacher_subjects_pkey'),
      ('teachers','guru_pkey','teachers_pkey'),
      ('credit_scores','credit_scores_guru_id_fkey','credit_scores_teacher_id_fkey'),
      ('credit_scores','credit_scores_ref_sesi_id_fkey','credit_scores_ref_session_id_fkey'),
      ('leave_requests','pengajuan_izin_jadwal_id_fkey','leave_requests_schedule_id_fkey'),
      ('leave_requests','pengajuan_izin_reviewed_by_id_fkey','leave_requests_reviewed_by_id_fkey'),
      ('leave_requests','pengajuan_izin_sesi_id_fkey','leave_requests_session_id_fkey'),
      ('leave_requests','pengajuan_izin_student_id_fkey','leave_requests_student_id_fkey'),
      ('leave_requests','pengajuan_izin_submitted_by_id_fkey','leave_requests_submitted_by_id_fkey'),
      ('schedules','jadwal_guru_id_fkey','schedules_teacher_id_fkey'),
      ('schedules','jadwal_kelas_id_fkey','schedules_class_id_fkey'),
      ('schedules','jadwal_mata_pelajaran_id_fkey','schedules_subject_id_fkey'),
      ('school_classes','kelas_wali_kelas_id_fkey','school_classes_homeroom_teacher_id_fkey'),
      ('sessions','sesi_actual_guru_id_fkey','sessions_actual_teacher_id_fkey'),
      ('sessions','sesi_jadwal_id_fkey','sessions_schedule_id_fkey'),
      ('student_attendance','absensi_siswa_jadwal_id_fkey','student_attendance_schedule_id_fkey'),
      ('student_attendance','absensi_siswa_sesi_id_fkey','student_attendance_session_id_fkey'),
      ('student_attendance','absensi_siswa_student_id_fkey','student_attendance_student_id_fkey'),
      ('students','students_kelas_id_fkey','students_class_id_fkey'),
      ('students','students_pendaftaran_id_fkey','students_registration_id_fkey'),
      ('teacher_attendance','absensi_guru_guru_id_fkey','teacher_attendance_teacher_id_fkey'),
      ('teacher_attendance','absensi_guru_jadwal_id_fkey','teacher_attendance_schedule_id_fkey'),
      ('teacher_attendance','absensi_guru_reported_by_id_fkey','teacher_attendance_reported_by_id_fkey'),
      ('teacher_attendance','absensi_guru_substitute_guru_id_fkey','teacher_attendance_substitute_teacher_id_fkey'),
      ('teacher_subjects','guru_mata_pelajaran_guru_id_fkey','teacher_subjects_teacher_id_fkey'),
      ('teacher_subjects','guru_mata_pelajaran_mata_pelajaran_id_fkey','teacher_subjects_subject_id_fkey'),
      ('teachers','guru_user_id_fkey','teachers_user_id_fkey')
    ) AS t(table_name, old_name, new_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class rel ON rel.oid = c.conrelid
      JOIN pg_namespace ns ON ns.oid = rel.relnamespace
      WHERE c.conname = r.old_name
        AND rel.relname = r.table_name
        AND ns.nspname = current_schema()
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
        r.table_name, r.old_name, r.new_name
      );
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('credit_categories_owner_type_type_nama_key'::text,'credit_categories_owner_type_type_name_key'::text),
      ('credit_scores_guru_id_idx','credit_scores_teacher_id_idx'),
      ('credit_scores_ref_sesi_id_idx','credit_scores_ref_session_id_idx'),
      ('pengajuan_izin_student_id_tanggal_idx','leave_requests_student_id_date_idx'),
      ('pendaftaran_nik_key','registrations_nik_key'),
      ('pendaftaran_nisn_key','registrations_nisn_key'),
      ('pendaftaran_nomor_pendaftaran_key','registrations_registration_number_key'),
      ('kelas_nama_tahun_ajaran_key','school_classes_name_academic_year_key'),
      ('sesi_jadwal_id_tanggal_key','sessions_schedule_id_date_key'),
      ('sesi_qr_token_key','sessions_qr_token_key'),
      ('absensi_siswa_jadwal_id_student_id_tanggal_key','student_attendance_schedule_id_student_id_date_key'),
      ('students_pendaftaran_id_key','students_registration_id_key'),
      ('mata_pelajaran_kode_key','subjects_code_key'),
      ('absensi_guru_jadwal_id_guru_id_tanggal_key','teacher_attendance_schedule_id_teacher_id_date_key'),
      ('guru_mata_pelajaran_guru_id_mata_pelajaran_id_key','teacher_subjects_teacher_id_subject_id_key'),
      ('guru_nip_key','teachers_nip_key'),
      ('guru_nuptk_key','teachers_nuptk_key'),
      ('guru_user_id_key','teachers_user_id_key')
    ) AS t(old_name, new_name)
  LOOP
    IF EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace ns ON ns.oid = c.relnamespace
      WHERE c.relname = r.old_name
        AND c.relkind = 'i'
        AND ns.nspname = current_schema()
    ) THEN
      EXECUTE format('ALTER INDEX %I RENAME TO %I', r.old_name, r.new_name);
    END IF;
  END LOOP;
END $$;
