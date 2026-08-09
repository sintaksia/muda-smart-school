"use client";

import type { ReactNode, RefObject } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ScannerViewportProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  scanning: boolean;
  /** Aspect-ratio class for the preview, e.g. "aspect-square". */
  aspectClassName: string;
  cancelLabel: string;
  onCancel: () => void;
  /** Optional feedback rendered between the preview and the cancel button. */
  children?: ReactNode;
}

/**
 * The camera preview stays mounted even while idle: `start()` grabs the video
 * element through a ref immediately after asking for the stream, so the node
 * has to exist before React re-renders with `scanning` on.
 */
export function ScannerViewport({
  videoRef,
  scanning,
  aspectClassName,
  cancelLabel,
  onCancel,
  children,
}: ScannerViewportProps) {
  return (
    <div className={cn("space-y-3", !scanning && "hidden")}>
      <video
        ref={videoRef}
        className={cn(
          "rounded-sm w-full bg-black object-cover",
          aspectClassName,
        )}
        playsInline
        muted
      />
      {children}
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="text-neutral-600 h-11 w-full font-semibold"
      >
        {cancelLabel}
      </Button>
    </div>
  );
}
