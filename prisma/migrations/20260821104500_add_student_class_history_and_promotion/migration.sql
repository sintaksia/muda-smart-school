-- Yearly class promotion: per-year class membership history plus an audit
-- record of each promotion run. Purely additive — no existing table or column
-- is touched.

-- CreateEnum
CREATE TYPE "PromotionAction" AS ENUM ('PROMOTE', 'RETAIN', 'GRADUATE', 'EXIT');

-- CreateTable
CREATE TABLE "student_class_histories" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT,
    "academic_year" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "action" "PromotionAction",
    "batch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_class_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_batches" (
    "id" TEXT NOT NULL,
    "from_academic_year" TEXT NOT NULL,
    "to_academic_year" TEXT NOT NULL,
    "promoted_count" INTEGER NOT NULL DEFAULT 0,
    "retained_count" INTEGER NOT NULL DEFAULT 0,
    "graduated_count" INTEGER NOT NULL DEFAULT 0,
    "exited_count" INTEGER NOT NULL DEFAULT 0,
    "executed_by_id" TEXT,
    "reverted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_class_histories_academic_year_class_id_idx" ON "student_class_histories"("academic_year", "class_id");

-- CreateIndex
CREATE INDEX "student_class_histories_batch_id_idx" ON "student_class_histories"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_class_histories_student_id_academic_year_key" ON "student_class_histories"("student_id", "academic_year");

-- AddForeignKey
ALTER TABLE "student_class_histories" ADD CONSTRAINT "student_class_histories_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_histories" ADD CONSTRAINT "student_class_histories_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "school_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class_histories" ADD CONSTRAINT "student_class_histories_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "promotion_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_batches" ADD CONSTRAINT "promotion_batches_executed_by_id_fkey" FOREIGN KEY ("executed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
