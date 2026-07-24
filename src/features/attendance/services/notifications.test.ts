import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import {
  createNotification,
  notifyUsers,
  getWaliKelasUserId,
  markNotificationRead,
} from "./notifications";
import type { SchoolClass, Notification } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: { findMany: vi.fn() },
    schoolClass: { findUnique: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createNotification", () => {
  it("persists the notification with defaults", async () => {
    vi.mocked(prisma.notification.create).mockResolvedValue({
      id: "n1",
    } as Notification);

    await createNotification({
      userId: "u1",
      title: "Test",
      body: "Body",
      type: "CREDIT_WARNING",
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        title: "Test",
        body: "Body",
        type: "CREDIT_WARNING",
        refId: undefined,
        channel: "IN_APP",
      },
    });
  });
});

describe("notifyUsers", () => {
  it("deduplicates recipients", async () => {
    vi.mocked(prisma.notification.createMany).mockResolvedValue({ count: 2 });

    const count = await notifyUsers(["a", "b", "a", ""], {
      title: "T",
      body: "B",
      type: "NO_CLASS",
    });

    expect(count).toBe(2);
    const call = vi.mocked(prisma.notification.createMany).mock.calls[0][0];
    expect(call?.data).toHaveLength(2);
  });

  it("no-ops for an empty recipient list", async () => {
    const count = await notifyUsers([], {
      title: "T",
      body: "B",
      type: "NO_CLASS",
    });
    expect(count).toBe(0);
    expect(prisma.notification.createMany).not.toHaveBeenCalled();
  });
});

describe("getWaliKelasUserId", () => {
  it("returns the wali kelas user id", async () => {
    vi.mocked(prisma.schoolClass.findUnique).mockResolvedValue({
      homeroomTeacher: { userId: "wali-user" },
    } as unknown as SchoolClass);

    expect(await getWaliKelasUserId("k1")).toBe("wali-user");
  });

  it("returns null without a kelas", async () => {
    expect(await getWaliKelasUserId(null)).toBeNull();
    expect(prisma.schoolClass.findUnique).not.toHaveBeenCalled();
  });
});

describe("markNotificationRead", () => {
  it("rejects marking another user's notification", async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue({
      id: "n1",
      userId: "other",
    } as Notification);

    expect(await markNotificationRead("n1", "me")).toBeNull();
    expect(prisma.notification.update).not.toHaveBeenCalled();
  });
});
