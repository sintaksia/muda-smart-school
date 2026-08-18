import { headers } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import {
  createClient as createServerClient,
  createTokenClient,
} from "@/src/lib/supabase/server";
import type { AuthUser, SessionUser } from "../types";

/**
 * Resolve the Supabase auth user id for the current request.
 *
 * Two transports, one result:
 *  - `Authorization: Bearer <jwt>` — mobile clients, which hold their session
 *    in the app rather than in cookies.
 *  - cookies — the web app, via the SSR client.
 *
 * A malformed or expired token resolves to `null`, exactly like a missing
 * cookie, so callers keep returning their existing 401/403.
 */
async function resolveAuthUserId(): Promise<string | null> {
  const bearerToken = (await headers())
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1]
    ?.trim();

  if (bearerToken) {
    const { data, error } = await createTokenClient().auth.getUser(bearerToken);
    return error ? null : (data.user?.id ?? null);
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const authUserId = await resolveAuthUserId();

    if (!authUserId) {
      return null;
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    // Check if user is active
    if (dbUser.status !== "ACTIVE") {
      return null;
    }

    return dbUser;
  } catch {
    return null;
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Login failed" };
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!dbUser) {
      // Sign out if user doesn't exist in database
      await supabase.auth.signOut();
      return { user: null, error: "User not found in database" };
    }

    if (dbUser.status !== "ACTIVE") {
      await supabase.auth.signOut();
      return {
        user: null,
        error: "Akun Anda tidak aktif. Hubungi administrator.",
      };
    }

    // Update last login
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    });

    return { user: dbUser, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { user: null, error: message };
  }
}

/**
 * Exchange an OAuth callback code for a session, then verify the signed-in
 * Supabase user has an active Prisma User record. Rejects (and signs out)
 * sign-ins for emails that have no pre-provisioned account.
 */
export async function handleOAuthCallback(
  code: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: "Login failed" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
      },
    });

    if (!dbUser) {
      await supabase.auth.signOut();
      return {
        user: null,
        error: "Akun tidak terdaftar. Hubungi administrator.",
      };
    }

    if (dbUser.status !== "ACTIVE") {
      await supabase.auth.signOut();
      return {
        user: null,
        error: "Akun Anda tidak aktif. Hubungi administrator.",
      };
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    });

    return { user: dbUser, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { user: null, error: message };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ error: string | null }> {
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return { error: message };
  }
}

/**
 * Check if user is authenticated (for middleware)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
