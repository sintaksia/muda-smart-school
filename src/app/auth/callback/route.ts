import { NextResponse } from "next/server";
import { handleOAuthCallback } from "@/src/features/auth/services/auth";
import { getHomeRouteForRole } from "@/src/features/auth/utils/getHomeRouteForRole";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectParam = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Login dengan Google gagal")}`,
    );
  }

  const { user, error } = await handleOAuthCallback(code);

  if (error || !user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error || "Login dengan Google gagal")}`,
    );
  }

  const destination = redirectParam || getHomeRouteForRole(user.role);
  return NextResponse.redirect(`${origin}${destination}`);
}
