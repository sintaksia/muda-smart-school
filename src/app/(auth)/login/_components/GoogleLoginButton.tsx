"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";

interface GoogleLoginButtonProps {
  disabled?: boolean;
  redirectTo?: string | null;
}

export function GoogleLoginButton({
  disabled,
  redirectTo,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectTo) {
        callbackUrl.searchParams.set("redirect", redirectTo);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
      }
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 w-full hover:bg-neutral-50 hover:text-neutral-900"
      disabled={disabled || isLoading}
      onClick={handleGoogleLogin}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A10.99 10.99 0 0 0 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.85c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      Masuk dengan Google
    </Button>
  );
}
