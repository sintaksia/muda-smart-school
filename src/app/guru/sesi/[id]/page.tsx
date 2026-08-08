import { LiveSessionView } from "./_components/LiveSessionView";
import { getAttendanceSettings } from "@/src/features/attendance/services/settings";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SesiLivePage({ params }: PageProps) {
  const { id } = await params;
  const settings = await getAttendanceSettings();

  return (
    <LiveSessionView
      sessionId={id}
      qrMode={settings.qrMode}
      qrTtlSeconds={settings.qrTokenTtlSeconds}
      scanMode={settings.scanMode}
    />
  );
}
