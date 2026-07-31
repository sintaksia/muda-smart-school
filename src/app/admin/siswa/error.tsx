"use client";

import { AdminErrorState } from "../_components/AdminErrorState";

export default function SiswaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminErrorState error={error} reset={reset} />;
}
