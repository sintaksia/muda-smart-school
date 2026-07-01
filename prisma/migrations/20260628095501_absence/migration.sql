-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('AKTIF', 'LULUS', 'PINDAH', 'DROPOUT');

-- CreateEnum
CREATE TYPE "StatusKepegawaian" AS ENUM ('PNS', 'PPPK', 'GTY', 'GTT');

-- CreateEnum
CREATE TYPE "HariEnum" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU');

-- CreateEnum
CREATE TYPE "AbsensiStatus" AS ENUM ('HADIR', 'SAKIT', 'IZIN', 'ALPHA');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pendaftaran_id" TEXT,
    "nis" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "program_keahlian" "ProgramKeahlian" NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "kelas_id" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nip" TEXT,
    "nuptk" TEXT,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "tempat_lahir" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "pendidikan_terakhir" "Pendidikan" NOT NULL,
    "jabatan" TEXT,
    "status_kepegawaian" "StatusKepegawaian" NOT NULL,
    "tanggal_mulai_mengajar" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" INTEGER NOT NULL,
    "program_keahlian" "ProgramKeahlian" NOT NULL,
    "tahun_ajaran" TEXT NOT NULL,
    "wali_kelas_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "program_keahlian" "ProgramKeahlian",
    "tingkat" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guru_mata_pelajaran" (
    "id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,

    CONSTRAINT "guru_mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal" (
    "id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "hari" "HariEnum" NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_siswa" (
    "id" TEXT NOT NULL,
    "jadwal_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "AbsensiStatus" NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absensi_siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi_guru" (
    "id" TEXT NOT NULL,
    "jadwal_id" TEXT NOT NULL,
    "guru_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" "AbsensiStatus" NOT NULL,
    "jam_masuk" TIMESTAMP(3),
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absensi_guru_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_pendaftaran_id_key" ON "students"("pendaftaran_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "students"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "guru_user_id_key" ON "guru"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nip_key" ON "guru"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "guru_nuptk_key" ON "guru"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_nama_tahun_ajaran_key" ON "kelas"("nama", "tahun_ajaran");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_key" ON "mata_pelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "guru_mata_pelajaran_guru_id_mata_pelajaran_id_key" ON "guru_mata_pelajaran"("guru_id", "mata_pelajaran_id");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_siswa_jadwal_id_student_id_tanggal_key" ON "absensi_siswa"("jadwal_id", "student_id", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_guru_jadwal_id_guru_id_tanggal_key" ON "absensi_guru"("jadwal_id", "guru_id", "tanggal");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_pendaftaran_id_fkey" FOREIGN KEY ("pendaftaran_id") REFERENCES "pendaftaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru" ADD CONSTRAINT "guru_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_wali_kelas_id_fkey" FOREIGN KEY ("wali_kelas_id") REFERENCES "guru"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_mata_pelajaran" ADD CONSTRAINT "guru_mata_pelajaran_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guru_mata_pelajaran" ADD CONSTRAINT "guru_mata_pelajaran_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal" ADD CONSTRAINT "jadwal_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_siswa" ADD CONSTRAINT "absensi_siswa_jadwal_id_fkey" FOREIGN KEY ("jadwal_id") REFERENCES "jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_siswa" ADD CONSTRAINT "absensi_siswa_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_guru" ADD CONSTRAINT "absensi_guru_jadwal_id_fkey" FOREIGN KEY ("jadwal_id") REFERENCES "jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi_guru" ADD CONSTRAINT "absensi_guru_guru_id_fkey" FOREIGN KEY ("guru_id") REFERENCES "guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
