/**
 * Cursor pagination for list endpoints.
 *
 * Mobile clients page through unbounded lists (attendance history, notifications),
 * so every list route uses the same contract: `?limit=&cursor=` in, and a
 * `{ data, nextCursor }` envelope out. Offset paging is deliberately not used —
 * rows are ordered by date descending and new records arrive constantly, which
 * makes offsets skip and repeat items.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PageParams {
  /** Rows to return, clamped to [1, MAX_PAGE_SIZE]. */
  limit: number;
  /** Id of the last row from the previous page, or undefined for page one. */
  cursor?: string;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

/**
 * Read `limit` and `cursor` off a request's query string.
 *
 * A missing, non-numeric or out-of-range `limit` falls back to the default
 * rather than erroring — a bad page size should not fail the whole request.
 */
export function parsePageParams(searchParams: URLSearchParams): PageParams {
  const rawLimit = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { limit, cursor: searchParams.get("cursor") ?? undefined };
}

/**
 * Prisma arguments for a cursor page. Fetches one extra row so the caller can
 * tell whether another page exists without a second count query.
 */
export function pageQueryArgs({ limit, cursor }: PageParams) {
  return {
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  };
}

/**
 * Trim the lookahead row off a result set and derive the next cursor.
 * Pass the rows returned by a query built with {@link pageQueryArgs}.
 */
export function toPage<T extends { id: string }>(
  rows: T[],
  { limit }: PageParams,
): Page<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  return {
    data,
    nextCursor: hasMore ? (data[data.length - 1]?.id ?? null) : null,
  };
}
