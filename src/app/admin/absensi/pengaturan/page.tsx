import { prisma } from "@/src/lib/prisma";
import { PageHeader } from "../../_components/PageHeader";
import { AttendanceSettingsForm } from "./_components/AttendanceSettingsForm";
import { ATTENDANCE_SETTINGS_GROUP } from "@/src/features/attendance/services/settings";
import { ATTENDANCE_SETTING_DEFINITIONS } from "@/src/features/attendance/constants";

export const dynamic = "force-dynamic";

export default async function AttendanceSettingsPage() {
  const rows = await prisma.schoolSetting.findMany({
    where: { group: ATTENDANCE_SETTINGS_GROUP },
    select: { key: true, value: true },
  });
  const valueByKey = new Map(rows.map((row) => [row.key, row.value]));

  // Definitions drive the form so a rule added in code shows up (at its
  // default) before the seed has written its row.
  const settings = ATTENDANCE_SETTING_DEFINITIONS.map((definition) => ({
    ...definition,
    value: valueByKey.get(definition.key) ?? definition.value,
  }));

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
