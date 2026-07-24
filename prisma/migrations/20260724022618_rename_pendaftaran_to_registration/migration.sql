-- Phase 1: Standardize Registration domain naming to English (non-destructive renames only).
-- Verify actual column names first if this schema has drifted (e.g. `\d pendaftaran` / information_schema.columns),
-- especially rt/rw/kecamatan/provinsi/status which have no @map in the old schema.

-- 1. Rename the table
ALTER TABLE "pendaftaran" RENAME TO "registrations";

-- 2. Rename columns (data-preserving)
ALTER TABLE "registrations" RENAME COLUMN "nama_lengkap" TO "full_name";
ALTER TABLE "registrations" RENAME COLUMN "jenis_kelamin" TO "gender";
ALTER TABLE "registrations" RENAME COLUMN "program_keahlian" TO "specialization";
ALTER TABLE "registrations" RENAME COLUMN "nomor_kk" TO "family_card_number";
ALTER TABLE "registrations" RENAME COLUMN "tempat_lahir" TO "birth_place";
ALTER TABLE "registrations" RENAME COLUMN "tanggal_lahir" TO "birth_date";
ALTER TABLE "registrations" RENAME COLUMN "no_hp_murid" TO "student_phone";
ALTER TABLE "registrations" RENAME COLUMN "alamat_jalan" TO "street_address";
ALTER TABLE "registrations" RENAME COLUMN "kelurahan_desa" TO "village";
ALTER TABLE "registrations" RENAME COLUMN "kota_kabupaten" TO "city";
ALTER TABLE "registrations" RENAME COLUMN "kode_pos" TO "postal_code";
ALTER TABLE "registrations" RENAME COLUMN "nama_ayah" TO "father_name";
ALTER TABLE "registrations" RENAME COLUMN "tahun_lahir_ayah" TO "father_birth_year";
ALTER TABLE "registrations" RENAME COLUMN "pendidikan_ayah" TO "father_education";
ALTER TABLE "registrations" RENAME COLUMN "pekerjaan_ayah" TO "father_occupation";
ALTER TABLE "registrations" RENAME COLUMN "nama_ibu" TO "mother_name";
ALTER TABLE "registrations" RENAME COLUMN "tahun_lahir_ibu" TO "mother_birth_year";
ALTER TABLE "registrations" RENAME COLUMN "pendidikan_ibu" TO "mother_education";
ALTER TABLE "registrations" RENAME COLUMN "pekerjaan_ibu" TO "mother_occupation";
ALTER TABLE "registrations" RENAME COLUMN "nama_asal_sekolah" TO "previous_school_name";
ALTER TABLE "registrations" RENAME COLUMN "npsn_asal_sekolah" TO "previous_school_npsn";
ALTER TABLE "registrations" RENAME COLUMN "alamat_asal_sekolah" TO "previous_school_address";
ALTER TABLE "registrations" RENAME COLUMN "email_murid" TO "student_email";
ALTER TABLE "registrations" RENAME COLUMN "hubungan_wali" TO "guardian_relationship";
ALTER TABLE "registrations" RENAME COLUMN "nama_wali" TO "guardian_name";
ALTER TABLE "registrations" RENAME COLUMN "no_telp_ayah" TO "father_phone";
ALTER TABLE "registrations" RENAME COLUMN "no_telp_ibu" TO "mother_phone";
ALTER TABLE "registrations" RENAME COLUMN "no_telp_wali" TO "guardian_phone";
ALTER TABLE "registrations" RENAME COLUMN "nomor_pendaftaran" TO "registration_number";
ALTER TABLE "registrations" RENAME COLUMN "pekerjaan_wali" TO "guardian_occupation";
ALTER TABLE "registrations" RENAME COLUMN "pendidikan_wali" TO "guardian_education";
ALTER TABLE "registrations" RENAME COLUMN "tahun_lahir_wali" TO "guardian_birth_year";
ALTER TABLE "registrations" RENAME COLUMN "tahun_lulus" TO "graduation_year";
ALTER TABLE "registrations" RENAME COLUMN "tanggal_pendaftaran" TO "registration_date";
ALTER TABLE "registrations" RENAME COLUMN "provinsi" TO "province";
ALTER TABLE "registrations" RENAME COLUMN "kecamatan" TO "district";

-- 3. Rename FK column on students (Registration relation)
ALTER TABLE "students" RENAME COLUMN "pendaftaran_id" TO "registration_id";
-- If a named FK constraint exists (check via \d students first), rename it too, e.g.:
-- ALTER TABLE "students" RENAME CONSTRAINT "students_pendaftaran_id_fkey" TO "students_registration_id_fkey";

-- 4. Guru/Kelas/MataPelajaran/Student shared-field fallout (folded into Phase 1)
ALTER TABLE "guru" RENAME COLUMN "jenis_kelamin" TO "gender";
ALTER TABLE "guru" RENAME COLUMN "pendidikan_terakhir" TO "education";
ALTER TABLE "kelas" RENAME COLUMN "program_keahlian" TO "specialization";
ALTER TABLE "mata_pelajaran" RENAME COLUMN "program_keahlian" TO "specialization";
ALTER TABLE "students" RENAME COLUMN "program_keahlian" TO "specialization";

-- 5. Rename enum types
ALTER TYPE "StatusPendaftaran" RENAME TO "RegistrationStatus";
ALTER TYPE "JenisKelamin" RENAME TO "Gender";
ALTER TYPE "ProgramKeahlian" RENAME TO "Specialization";
ALTER TYPE "Pendidikan" RENAME TO "Education";

-- 6. Rename enum values (each is its own statement in Postgres)
ALTER TYPE "RegistrationStatus" RENAME VALUE 'DIVERIFIKASI' TO 'VERIFIED';
ALTER TYPE "RegistrationStatus" RENAME VALUE 'DITOLAK' TO 'REJECTED';
ALTER TYPE "RegistrationStatus" RENAME VALUE 'DITERIMA' TO 'ACCEPTED';
-- PENDING unchanged, no statement needed

ALTER TYPE "Gender" RENAME VALUE 'LAKI_LAKI' TO 'MALE';
ALTER TYPE "Gender" RENAME VALUE 'PEREMPUAN' TO 'FEMALE';

ALTER TYPE "Specialization" RENAME VALUE 'TEKNIK_OTOMOTIF' TO 'AUTOMOTIVE_ENGINEERING';
ALTER TYPE "Specialization" RENAME VALUE 'PEMROGRAMAN_PERANGKAT_LUNAK_DAN_GIM' TO 'SOFTWARE_AND_GAME_DEVELOPMENT';
ALTER TYPE "Specialization" RENAME VALUE 'TEKNIK_JARINGAN_KOMPUTER_DAN_TELEKOMUNIKASI' TO 'NETWORK_AND_TELECOMMUNICATIONS_ENGINEERING';
ALTER TYPE "Specialization" RENAME VALUE 'MANAJEMEN_PERKANTORAN_DAN_LAYANAN_BISNIS' TO 'OFFICE_MANAGEMENT_AND_BUSINESS_SERVICES';
ALTER TYPE "Specialization" RENAME VALUE 'AKUNTANSI_DAN_KEUANGAN_LEMBAGA' TO 'ACCOUNTING_AND_INSTITUTIONAL_FINANCE';

ALTER TYPE "Education" RENAME VALUE 'TIDAK_SEKOLAH' TO 'NO_SCHOOLING';
-- SD/SMP/SMA/SMK/D1-D4/S1-S3 unchanged, no statements needed
