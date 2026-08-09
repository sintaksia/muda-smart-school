"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Single source of truth for the client-side logout flow:
 * POST /api/auth/logout, toast feedback, redirect to /login.
 */
export function useLogout(): UseLogoutResult {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function logout(): Promise<void> {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      toast.success("Berhasil logout");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal logout. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return { logout, isLoading };
}
