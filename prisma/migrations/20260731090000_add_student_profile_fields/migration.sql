-- AlterTable
ALTER TABLE "students" ADD COLUMN     "birth_date" TIMESTAMP(3),
ADD COLUMN     "birth_place" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "father_name" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "guardian_name" TEXT,
ADD COLUMN     "mother_name" TEXT,
ADD COLUMN     "nik" TEXT,
ADD COLUMN     "parent_phone" TEXT,
ADD COLUMN     "previous_school_name" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "street_address" TEXT,
ADD COLUMN     "village" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_nik_key" ON "students"("nik");

