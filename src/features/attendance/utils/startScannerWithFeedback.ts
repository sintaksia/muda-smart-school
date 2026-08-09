import { toast } from "sonner";

/**
 * Shared "open the camera" handler for every scan panel: one place decides
 * how a blocked camera or an unusable browser is reported to the user.
 *
 * @param start       the `start` returned by `useQrScanner`
 * @param manualHint  what the user can do instead, e.g. "masukkan kode manual"
 */
export async function startScannerWithFeedback(
  start: () => Promise<boolean>,
  manualHint: string,
): Promise<void> {
  try {
    if (!(await start())) {
      toast.info(`Kamera belum siap — ${manualHint}.`);
    }
  } catch (error: unknown) {
    toast.error(
      error instanceof Error
        ? `${error.message} — ${manualHint}.`
        : `Tidak dapat mengakses kamera — ${manualHint}.`,
    );
  }
}
