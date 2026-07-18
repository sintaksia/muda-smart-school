import { NextResponse } from "next/server";

/**
 * Shared catch-block handler for CMS API routes: maps a Zod validation
 * error to 400 and everything else to 500, logging with the given context.
 */
export function handleApiError(
  error: unknown,
  logContext: string,
  fallbackMessage: string,
): NextResponse {
  console.error(logContext, error);

  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json(
      { error: "Data tidak valid", details: error },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
