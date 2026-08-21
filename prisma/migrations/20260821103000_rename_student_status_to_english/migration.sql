-- Standardize StudentStatus enum VALUES to English, per the English-for-code
-- rule. Display labels stay Indonesian in src/lib/constants.ts.
-- Pure enum value renames — no table or column changes, so no data is lost.

ALTER TYPE "StudentStatus" RENAME VALUE 'AKTIF' TO 'ACTIVE';
ALTER TYPE "StudentStatus" RENAME VALUE 'LULUS' TO 'GRADUATED';
ALTER TYPE "StudentStatus" RENAME VALUE 'PINDAH' TO 'TRANSFERRED';
ALTER TYPE "StudentStatus" RENAME VALUE 'DROPOUT' TO 'DROPPED_OUT';
