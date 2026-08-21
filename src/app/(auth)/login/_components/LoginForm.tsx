"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import type { AuthUser } from "@/src/features/auth/types";
import { getHomeRouteForRole } from "@/src/features/auth/utils/getHomeRouteForRole";
import { LOGIN_EMAIL_PLACEHOLDER } from "@/src/features/auth/constants";
import { loginSchema, type LoginFormData } from "./LoginSchema";
import { GoogleLoginButton } from "./GoogleLoginButton";

interface LoginResponse {
  user?: AuthUser;
  error?: string;
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) {
      toast.error(errorParam);
    }
  }, [errorParam]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.user) {
        toast.error(result.error || "Login gagal");
        return;
      }

      toast.success("Login berhasil");
      router.push(redirectParam || getHomeRouteForRole(result.user.role));
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={LOGIN_EMAIL_PLACEHOLDER}
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-primary-900 hover:bg-primary-800 h-10 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">Atau</span>
          </div>
        </div>

        <GoogleLoginButton disabled={isLoading} redirectTo={redirectParam} />
      </form>
    </Form>
  );
}
