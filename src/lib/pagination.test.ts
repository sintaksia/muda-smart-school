import { describe, it, expect } from "vitest";
import {
  parsePageParams,
  pageQueryArgs,
  toPage,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "./pagination";

function params(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("parsePageParams", () => {
  it("defaults the limit when absent", () => {
    expect(parsePageParams(params(""))).toEqual({
      limit: DEFAULT_PAGE_SIZE,
      cursor: undefined,
    });
  });

  it("reads an explicit limit and cursor", () => {
    expect(parsePageParams(params("limit=5&cursor=abc"))).toEqual({
      limit: 5,
      cursor: "abc",
    });
  });

  it("clamps a limit above the maximum", () => {
    expect(parsePageParams(params("limit=5000")).limit).toBe(MAX_PAGE_SIZE);
  });

  it.each(["limit=0", "limit=-3", "limit=abc", "limit="])(
    "falls back to the default for %s rather than erroring",
    (query) => {
      expect(parsePageParams(params(query)).limit).toBe(DEFAULT_PAGE_SIZE);
    },
  );

  it("floors a fractional limit", () => {
    expect(parsePageParams(params("limit=7.9")).limit).toBe(7);
  });
});

describe("pageQueryArgs", () => {
  it("fetches one extra row to detect a further page", () => {
    expect(pageQueryArgs({ limit: 20 })).toEqual({ take: 21 });
  });

  it("skips the cursor row itself on later pages", () => {
    expect(pageQueryArgs({ limit: 10, cursor: "abc" })).toEqual({
      take: 11,
      cursor: { id: "abc" },
      skip: 1,
    });
  });
});

describe("toPage", () => {
  const rows = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `id-${i}` }));

  it("returns a null cursor when the last page is short", () => {
    expect(toPage(rows(3), { limit: 10 })).toEqual({
      data: rows(3),
      nextCursor: null,
    });
  });

  it("returns a null cursor when the page is exactly full", () => {
    // Exactly `limit` rows means the lookahead row was never found.
    const result = toPage(rows(10), { limit: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.nextCursor).toBeNull();
  });

  it("drops the lookahead row and points the cursor at the last kept row", () => {
    const result = toPage(rows(11), { limit: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.data.at(-1)?.id).toBe("id-9");
    expect(result.nextCursor).toBe("id-9");
  });

  it("handles an empty result set", () => {
    expect(toPage([], { limit: 10 })).toEqual({ data: [], nextCursor: null });
  });
});
