import { NextResponse } from "next/server";
import { getCurrentUser } from "../services/auth";
import { canManageCMS } from "./permissions";
import type { SessionUser } from "../types";

/**
 * Require the caller to be authenticated and allowed to manage CMS content.
 * Returns the session user on success, or a NextResponse to return immediately on failure.
 */
export async function requireCmsAccess(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!canManageCMS(user.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}
