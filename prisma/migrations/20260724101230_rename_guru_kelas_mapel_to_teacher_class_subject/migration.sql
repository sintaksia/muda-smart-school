-- Phase 2: Standardize Master Data domain naming to English (non-destructive renames only).
-- Verify actual column names first if this schema has drifted (\d guru / \d kelas / \d mata_pelajaran /
-- \d guru_mata_pelajaran, or information_schema.columns) before running.

-- 1. Teachers (was guru)
ALTER TABLE "guru" RENAME TO "teachers";
ALTER TABLE "teachers" RENAME COLUMN "tempat_lahir" TO "birth_place";
ALTER TABLE "teachers" RENAME COLUMN "tanggal_lahir" TO "birth_date";
ALTER TABLE "teachers" RENAME COLUMN "jabatan" TO "position";
ALTER TABLE "teachers" RENAME COLUMN "status_kepegawaian" TO "employment_status";
ALTER TABLE "teachers" RENAME COLUMN "tanggal_mulai_mengajar" TO "teaching_start_date";

-- 2. School classes (was kelas)
ALTER TABLE "kelas" RENAME TO "school_classes";
ALTER TABLE "school_classes" RENAME COLUMN "nama" TO "name";
ALTER TABLE "school_classes" RENAME COLUMN "tingkat" TO "grade_level";
ALTER TABLE "school_classes" RENAME COLUMN "tahun_ajaran" TO "academic_year";
ALTER TABLE "school_classes" RENAME COLUMN "wali_kelas_id" TO "homeroom_teacher_id";

-- 3. Subjects (was mata_pelajaran)
ALTER TABLE "mata_pelajaran" RENAME TO "subjects";
ALTER TABLE "subjects" RENAME COLUMN "nama" TO "name";
ALTER TABLE "subjects" RENAME COLUMN "kode" TO "code";
ALTER TABLE "subjects" RENAME COLUMN "tingkat" TO "grade_level";

-- 4. Teacher-subject join table (was guru_mata_pelajaran)
ALTER TABLE "guru_mata_pelajaran" RENAME TO "teacher_subjects";
ALTER TABLE "teacher_subjects" RENAME COLUMN "guru_id" TO "teacher_id";
ALTER TABLE "teacher_subjects" RENAME COLUMN "mata_pelajaran_id" TO "subject_id";

-- 5. Fallout FK on students (Student.kelasId -> Student.classId)
ALTER TABLE "students" RENAME COLUMN "kelas_id" TO "class_id";

-- 6. Enum type rename (values unchanged: PNS/PPPK/GTY/GTT are Indonesian civil-service
-- acronyms without a clean English equivalent, same reasoning as NIP/NUPTK/NISN/NIK)
ALTER TYPE "StatusKepegawaian" RENAME TO "EmploymentStatus";

-- Note: FK/scalar columns on jadwal, sesi, absensi_siswa, absensi_guru, pengajuan_izin,
-- credit_scores that reference these tables (kelas_id, mata_pelajaran_id, guru_id, etc.)
-- are intentionally left unchanged in this phase -- they're Phase 3 (attendance) territory.
