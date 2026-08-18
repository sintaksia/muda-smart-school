import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentUser } from "./auth";
import { headers } from "next/headers";
import {
  createClient as createServerClient,
  createTokenClient,
} from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import type { User } from "@prisma/client";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));
vi.mock("@/src/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createTokenClient: vi.fn(),
}));
vi.mock("@/src/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

const dbUser = {
  id: "user-1",
  email: "siswa@test.com",
  name: "Siswa",
  role: "STUDENT",
  status: "ACTIVE",
  avatar: null,
} as unknown as User;

/** Stub the incoming request's Authorization header. */
function withAuthHeader(value: string | null) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) =>
      name.toLowerCase() === "authorization" ? value : null,
  } as unknown as Awaited<ReturnType<typeof headers>>);
}

/** Stub the token client's getUser(jwt) result. */
function tokenClientReturns(result: {
  data: { user: { id: string } | null };
  error: { message: string } | null;
}) {
  vi.mocked(createTokenClient).mockReturnValue({
    auth: { getUser: vi.fn().mockResolvedValue(result) },
  } as unknown as ReturnType<typeof createTokenClient>);
}

/** Stub the cookie-based SSR client's getUser() result. */
function cookieClientReturns(user: { id: string } | null) {
  vi.mocked(createServerClient).mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
  } as unknown as Awaited<ReturnType<typeof createServerClient>>);
}

describe("getCurrentUser — Bearer token transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the user from a valid Bearer token, without touching cookies", async () => {
    withAuthHeader("Bearer valid-jwt");
    tokenClientReturns({ data: { user: { id: "user-1" } }, error: null });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser);

    const result = await getCurrentUser();

    expect(result?.id).toBe("user-1");
    expect(createTokenClient).toHaveBeenCalled();
    // The cookie client must not be consulted when a token is present.
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("is case-insensitive on the scheme and tolerates extra whitespace", async () => {
    withAuthHeader("bearer   valid-jwt  ");
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    vi.mocked(createTokenClient).mockReturnValue({
      auth: { getUser },
    } as unknown as ReturnType<typeof createTokenClient>);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser);

    await getCurrentUser();

    expect(getUser).toHaveBeenCalledWith("valid-jwt");
  });

  it("returns null for an expired or malformed token", async () => {
    withAuthHeader("Bearer garbage");
    tokenClientReturns({
      data: { user: null },
      error: { message: "invalid JWT" },
    });

    expect(await getCurrentUser()).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the token is valid but the user is not ACTIVE", async () => {
    withAuthHeader("Bearer valid-jwt");
    tokenClientReturns({ data: { user: { id: "user-1" } }, error: null });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...dbUser,
      status: "SUSPENDED",
    } as unknown as User);

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null when the token is valid but no Prisma user exists", async () => {
    withAuthHeader("Bearer valid-jwt");
    tokenClientReturns({ data: { user: { id: "ghost" } }, error: null });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    expect(await getCurrentUser()).toBeNull();
  });
});

describe("getCurrentUser — cookie transport (regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("still resolves the web app's cookie session when no header is present", async () => {
    withAuthHeader(null);
    cookieClientReturns({ id: "user-1" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser);

    const result = await getCurrentUser();

    expect(result?.id).toBe("user-1");
    expect(createServerClient).toHaveBeenCalled();
    expect(createTokenClient).not.toHaveBeenCalled();
  });

  it("falls back to cookies when the header is not a Bearer scheme", async () => {
    withAuthHeader("Basic abc123");
    cookieClientReturns({ id: "user-1" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser);

    expect((await getCurrentUser())?.id).toBe("user-1");
    expect(createTokenClient).not.toHaveBeenCalled();
  });

  it("returns null when there is neither a token nor a cookie session", async () => {
    withAuthHeader(null);
    cookieClientReturns(null);

    expect(await getCurrentUser()).toBeNull();
  });
});
