"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const RECAP_PATH = "/admin/absensi/siswa";

/**
 * Recap filters live in the URL, so both the filter bar and the summary tiles
 * write through the same setter instead of keeping parallel local state.
 */
export function useRecapFilter(): (key: string, value: string) => void {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`${RECAP_PATH}?${next.toString()}`);
    },
    [router, searchParams],
  );
}
