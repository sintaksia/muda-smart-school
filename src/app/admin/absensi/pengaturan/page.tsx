import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { AttendanceSettingsForm } from "./_components/AttendanceSettingsForm";
import { ATTENDANCE_SETTINGS_GROUP } from "@/src/features/attendance/services/settings";

export const dynamic = "force-dynamic";

export default async function AttendanceSettingsPage() {
  const settings = await prisma.schoolSetting.findMany({
    where: { group: ATTENDANCE_SETTINGS_GROUP },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Absensi"
        description="Aturan master sistem absensi & skor kredit — berlaku tanpa deploy ulang"
      />
      <AttendanceSettingsForm
        settings={settings.map((s) => ({
          key: s.key,
          value: s.value,
          label: s.label,
          type: s.type,
        }))}
      />
    </div>
  );
}
