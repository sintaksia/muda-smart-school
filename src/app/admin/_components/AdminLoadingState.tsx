import { Loader2 } from "lucide-react";

export function AdminLoadingState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="text-sm text-primary-700">Memuat data...</p>
    </div>
  );
}
