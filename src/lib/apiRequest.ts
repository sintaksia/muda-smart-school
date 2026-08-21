/**
 * Client-side mutation against an internal API route.
 *
 * Every admin form used to repeat the same fetch → `response.ok` → read
 * `{ error }` → throw block. This centralises it so a form only needs one
 * try/catch with a `toast.error` in it.
 */
export async function apiRequest<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  fallbackMessage: string = "Terjadi kesalahan",
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // A 204 or an HTML error page would blow up `.json()`, and DELETE routes
  // legitimately return no body.
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error;
    throw new Error(message ?? fallbackMessage);
  }

  return data as T;
}
