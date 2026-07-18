"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface AdminErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function AdminErrorState({ error, reset }: AdminErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="text-sm font-medium text-primary-900">
        Terjadi kesalahan saat memuat halaman
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "Silakan coba lagi atau hubungi administrator."}
      </p>
      <Button onClick={reset} variant="outline">
        Coba Lagi
      </Button>
    </div>
  );
}
