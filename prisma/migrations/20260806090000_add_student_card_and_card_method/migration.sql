-- AlterEnum
ALTER TYPE "AttendanceMethod" ADD VALUE 'CARD';

-- AlterTable
ALTER TABLE "students" ADD COLUMN "card_token" TEXT,
ADD COLUMN "card_issued_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "students_card_token_key" ON "students"("card_token");
