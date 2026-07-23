import { prisma } from "@/src/lib/prisma";
import { createClient as createServerClient } from "@/src/lib/supabase/server";
import type { AuthUser, SessionUser } from "../types";

/**
 * Get the current authenticated user from session
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return null;
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
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
