import { describe, it, expect } from "vitest";
import { getHomeRouteForRole } from "./getHomeRouteForRole";

describe("getHomeRouteForRole", () => {
  it("returns the student route for STUDENT", () => {
    expect(getHomeRouteForRole("STUDENT")).toBe("/siswa");
  });

  it("returns the admin route for SUPER_ADMIN", () => {
    expect(getHomeRouteForRole("SUPER_ADMIN")).toBe("/admin");
  });
});
