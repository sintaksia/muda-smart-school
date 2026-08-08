import { prisma } from "@/src/lib/prisma";
import { ENTITY_LABELS } from "@/src/lib/constants";
import { getClassCards } from "@/src/features/master/services/studentCard";
import { PageHeader } from "../../_components/PageHeader";
import { CardSheetView } from "./_components/CardSheetView";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ classId?: string }>;
}

export default async function StudentCardsPage({ searchParams }: PageProps) {
  const { classId } = await searchParams;

  const classList = await prisma.schoolClass.findMany({
    select: { id: true, name: true },
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
  });
  // Minting happens inside getClassCards, so a class prints in one step.
  const cards = classId ? await getClassCards(classId) : [];

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title={`Kartu ${ENTITY_LABELS.STUDENT}`}
          description="Cetak kartu ber-QR untuk presensi — guru memindai kartu ini di kelas"
        />
      </div>
      <CardSheetView
        classOptions={classList}
        selectedClassId={classId ?? ""}
        cards={cards}
      />
    </div>
  );
}
