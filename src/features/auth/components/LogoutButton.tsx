"use client";

import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { useLogout } from "../hooks/useLogout";

/**
 * ghost's default hover is `bg-accent` (blue) with white text, which clashes
 * with the red label — tint the hover with the same destructive token instead.
 */
const DESTRUCTIVE_GHOST_CLASS =
  "gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive";

interface LogoutButtonProps {
  /** Hide the text label on small screens (portal headers are tight). */
  compact?: boolean;
}

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const { logout, isLoading } = useLogout();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={logout}
      disabled={isLoading}
      aria-label="Logout"
      className={DESTRUCTIVE_GHOST_CLASS}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
        Logout
      </span>
    </Button>
  );
}
