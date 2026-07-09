-- CreateEnum
CREATE TYPE "AbsensiMethod" AS ENUM ('QR', 'MANUAL');

-- CreateEnum
CREATE TYPE "SesiStatus" AS ENUM ('OPEN', 'CLOSED', 'KELAS_KOSONG');

-- CreateEnum
CREATE TYPE "CreditOwnerType" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "CreditEntryType" AS ENUM ('PRESTASI', 'PELANGGARAN', 'KOREKSI');

-- CreateEnum
CREATE TYPE "CreditSource" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "IzinJenis" AS ENUM ('IZIN', 'SAKIT');

-- CreateEnum
CREATE TYPE "IzinStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CREDIT_WARNING', 'CREDIT_CRITICAL', 'CREDIT_MANUAL_ENTRY', 'GPS_REVIEW', 'TEACHER_ABSENCE', 'KELAS_KOSONG', 'IZIN_STATUS');

-- AlterEnum
ALTER TYPE "AbsensiStatus" ADD VALUE 'TERLAMBAT';

-- AlterTable
ALTER TABLE "absensi_guru" ADD COLUMN     "reported_by_id" TEXT,
ADD COLUMN     "substitute_guru_id" TEXT;

-- AlterTable
ALTER TABLE "absensi_siswa" ADD COLUMN     "gps_lat" DOUBLE PRECISION,
ADD COLUMN     "gps_lng" DOUBLE PRECISION,
ADD COLUMN     "gps_valid" BOOLEAN,
ADD COLUMN     "method" "AbsensiMethod" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "needs_review" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scan_time" TIMESTAMP(3),
ADD COLUMN     "sesi_id" TEXT;

-- AlterTable
ALTER TABLE "jadwal" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tahun_ajaran" TEXT;

-- CreateTable
CREATE TABLE "sesi" (
    "id" TEXT NOT NULL,
    "jadwal_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "SesiStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "qr_token" TEXT,
    "qr_token_issued_at" TIMESTAMP(3),
    "actual_guru_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_scores" (
    "id" TEXT NOT NULL,
    "owner_type" "CreditOwnerType" NOT NULL,
    "student_id" TEXT,
    "guru_id" TEXT,
    "type" "CreditEntryType" NOT NULL,
    "category" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "note" TEXT,
    "evidence" TEXT,
    "source" "CreditSource" NOT NULL,
    "ref_sesi_id" TEXT,
    "reported_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_categories" (
    "id" TEXT NOT NULL,
    "owner_type" "CreditOwnerType" NOT NULL,
    "type" "CreditEntryType" NOT NULL,
    "nama" TEXT NOT NULL,
    "default_points" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengajuan_izin" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "jenis" "IzinJenis" NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jadwal_id" TEXT,
    "sesi_id" TEXT,
    "alasan" TEXT NOT NULL,
    "lampiran" TEXT,
    "status" "IzinStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_by_id" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_izin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "ref_id" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesi_qr_token_key" ON "sesi"("qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_jadwal_id_tanggal_key" ON "sesi"("jadwal_id", "tanggal");

-- CreateIndex
CREATE INDEX "credit_scores_student_id_idx" ON "credit_scores"("student_id");

-- CreateIndex
CREATE INDEX "credit_scores_guru_id_idx" ON "credit_scores"("guru_id");

-- CreateIndex
CREATE INDEX "credit_scores_ref_sesi_id_idx" ON "credit_scores"("ref_sesi_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_categories_owner_type_type_nama_key" ON "credit_categories"("owner_type", "type", "nama");

-- CreateIndex
CREATE INDEX "pengajuan_izin_student_id_tanggal_idx" ON "pengajuan_izin"("student_id", "tanggal");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_jadwal_id_fkey" FOREIGN KEY ("jadwal_id") REFERENCES "jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi" ADD CONSTRAINT "sesi_actual_guru_id_fkey" FOREIGN KEY ("actual_guru_id") REFERENCES "guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_siswa" ADD CONSTRAINT "absensi_siswa_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_guru" ADD CONSTRAINT "absensi_guru_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_guru" ADD CONSTRAINT "absensi_guru_substitute_guru_id_fkey" FOREIGN KEY ("substitute_guru_id") REFERENCES "guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_ref_sesi_id_fkey" FOREIGN KEY ("ref_sesi_id") REFERENCES "sesi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_scores" ADD CONSTRAINT "credit_scores_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_jadwal_id_fkey" FOREIGN KEY ("jadwal_id") REFERENCES "jadwal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_sesi_id_fkey" FOREIGN KEY ("sesi_id") REFERENCES "sesi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan_izin" ADD CONSTRAINT "pengajuan_izin_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

