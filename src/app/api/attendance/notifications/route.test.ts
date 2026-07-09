import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import {
  getUnreadNotifications,
  markNotificationRead,
} from "@/src/features/attendance/services/notifications";
import type { SessionUser } from "@/src/features/auth/types";
import type { Notification } from "@prisma/client";

vi.mock("@/src/features/auth/services/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/src/features/attendance/services/notifications", () => ({
  getUnreadNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
}));

describe("GET /api/attendance/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns the user's unread notifications", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(getUnreadNotifications).mockResolvedValue([
      { id: "n1" } as Notification,
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(getUnreadNotifications).toHaveBeenCalledWith("u1");
  });
});

describe("PATCH /api/attendance/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks a notification as read", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(markNotificationRead).mockResolvedValue({
      id: "n1",
      readAt: new Date(),
    } as Notification);

    const response = await PATCH(
      new Request("http://localhost/api/attendance/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id: "n1" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(markNotificationRead).toHaveBeenCalledWith("n1", "u1");
  });

  it("returns 404 for someone else's notification", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "u1",
      role: "STUDENT",
    } as SessionUser);
    vi.mocked(markNotificationRead).mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost/api/attendance/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id: "n1" }),
      }),
    );
    expect(response.status).toBe(404);
  });
});
