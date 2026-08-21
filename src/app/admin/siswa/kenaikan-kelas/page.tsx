import { PageHeader } from "../../_components/PageHeader";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { getActiveAcademicYear } from "@/src/features/master/services/academicYear";
import { getPromotionBatches } from "@/src/features/master/services/classPromotion";
import { PromotionManager } from "./_components/PromotionManager";

export const dynamic = "force-dynamic";

export default async function KenaikanKelasPage() {
  const [activeAcademicYear, batches] = await Promise.all([
    getActiveAcademicYear(),
    getPromotionBatches(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kenaikan Kelas"
        description={`Pindahkan seluruh ${ENTITY_LABELS.STUDENT.toLowerCase()} aktif ke tahun ajaran berikutnya dalam satu proses`}
      />
      <PromotionManager
        activeAcademicYear={activeAcademicYear}
        batches={batches}
      />
    </div>
  );
}
