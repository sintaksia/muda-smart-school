"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PromotionInput, PromotionPreview } from "../types";

export const PROMOTION_URL = "/api/master/students/class-promotion";
export const CLASS_CLONE_URL = "/api/master/classes/clone";

export interface PromotionRunner {
  preview: PromotionPreview | null;
  loadingPreview: boolean;
  preparing: boolean;
  running: boolean;
  revertingId: string | null;
  loadPreview: (from: string, to: string) => Promise<void>;
  prepareClasses: (from: string, to: string) => Promise<void>;
  runPromotion: (input: PromotionInput) => Promise<boolean>;
  revertBatch: (batchId: string) => Promise<boolean>;
  clearPreview: () => void;
}

async function readError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  return (data as { error?: string } | null)?.error ?? fallback;
}

function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function reportError(error: unknown): void {
  toast.error(
    error instanceof Error ? error.message : "Terjadi kesalahan server",
  );
}

/**
 * Every server call the promotion screen makes, with its own in-flight flag so
 * each button can disable itself. Kept out of the page component so the layout
 * stays readable and the request handling can be tested on its own.
 */
export function usePromotionRunner(): PromotionRunner {
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [preparing, setPreparing] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const loadPreview = useCallback(async (from: string, to: string) => {
    setLoadingPreview(true);
    try {
      const query = new URLSearchParams({ from, to });
      const response = await fetch(`${PROMOTION_URL}?${query}`);
      if (!response.ok) {
        throw new Error(await readError(response, "Gagal memuat pratinjau"));
      }
      setPreview((await response.json()) as PromotionPreview);
    } catch (error: unknown) {
      setPreview(null);
      reportError(error);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const prepareClasses = useCallback(
    async (from: string, to: string) => {
      setPreparing(true);
      try {
        const response = await postJson(CLASS_CLONE_URL, {
          fromAcademicYear: from,
          toAcademicYear: to,
        });
        if (!response.ok) {
          throw new Error(await readError(response, "Gagal menyiapkan kelas"));
        }
        const { created } = (await response.json()) as { created: number };
        toast.success(`${created} kelas dibuat untuk ${to}`);
        await loadPreview(from, to);
      } catch (error: unknown) {
        reportError(error);
      } finally {
        setPreparing(false);
      }
    },
    [loadPreview],
  );

  const runPromotion = useCallback(async (input: PromotionInput) => {
    setRunning(true);
    try {
      const response = await postJson(PROMOTION_URL, input);
      if (!response.ok) {
        throw new Error(
          await readError(response, "Gagal memproses kenaikan kelas"),
        );
      }
      toast.success(`${input.entries.length} siswa berhasil diproses`);
      setPreview(null);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    } finally {
      setRunning(false);
    }
  }, []);

  const revertBatch = useCallback(async (batchId: string) => {
    setRevertingId(batchId);
    try {
      const response = await postJson(`${PROMOTION_URL}/revert`, { batchId });
      if (!response.ok) {
        throw new Error(await readError(response, "Gagal membatalkan"));
      }
      toast.success("Kenaikan kelas dibatalkan");
      setPreview(null);
      return true;
    } catch (error: unknown) {
      reportError(error);
      return false;
    } finally {
      setRevertingId(null);
    }
  }, []);

  return {
    preview,
    loadingPreview,
    preparing,
    running,
    revertingId,
    loadPreview,
    prepareClasses,
    runPromotion,
    revertBatch,
    clearPreview: useCallback(() => setPreview(null), []),
  };
}
