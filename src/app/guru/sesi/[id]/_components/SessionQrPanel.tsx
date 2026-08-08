"use client";

import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface SessionQrPanelProps {
  qrToken: string;
  qrMode: "STATIC" | "DYNAMIC";
  onRefresh: () => Promise<void>;
}

/** The session QR students scan with their own phones. */
export function SessionQrPanel({
  qrToken,
  qrMode,
  onRefresh,
}: SessionQrPanelProps) {
  return (
    <section className="border-border rounded-md flex flex-col items-center gap-4 border bg-white p-6 sm:flex-row sm:justify-center sm:gap-10">
      <QRCodeSVG value={qrToken} size={220} marginSize={2} />
      <div className="text-center sm:text-left">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em]">
          Kode manual
        </p>
        <p className="text-foreground mt-1 break-all font-mono text-sm font-semibold">
          {qrToken}
        </p>
        {qrMode === "DYNAMIC" && (
          <Button
            type="button"
            variant="link"
            onClick={onRefresh}
            className="text-green-600 hover:text-green-500 mt-3 h-auto gap-1 p-0 font-semibold no-underline hover:no-underline"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Refresh QR
          </Button>
        )}
      </div>
    </section>
  );
}
