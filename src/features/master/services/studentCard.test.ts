import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Student } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import {
  ensureCardTokens,
  regenerateCardToken,
  getClassCards,
  getStudentCard,
} from "./studentCard";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    student: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ensureCardTokens", () => {
  it("mints a token for each active student that has none", async () => {
    vi.mocked(prisma.student.findMany).mockResolvedValue([
      { id: "s1" },
      { id: "s2" },
    ] as unknown as Student[]);
    vi.mocked(prisma.student.update).mockResolvedValue({} as Student);

    const minted = await ensureCardTokens("class-1");

    expect(minted).toBe(2);
    expect(prisma.student.update).toHaveBeenCalledTimes(2);
    const firstToken = vi.mocked(prisma.student.update).mock.calls[0][0].data
      .cardToken;
    const secondToken = vi.mocked(prisma.student.update).mock.calls[1][0].data
      .cardToken;
    expect(firstToken).toBeTruthy();
    expect(firstToken).not.toBe(secondToken);
  });

  it("is a no-op when every student already carries a token", async () => {
    vi.mocked(prisma.student.findMany).mockResolvedValue([]);

    const minted = await ensureCardTokens("class-1");

    expect(minted).toBe(0);
    expect(prisma.student.update).not.toHaveBeenCalled();
  });
});

describe("regenerateCardToken", () => {
  it("replaces the token of an existing student", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
    } as Student);
    vi.mocked(prisma.student.update).mockResolvedValue({
      id: "s1",
      cardToken: "new-token",
    } as Student);

    const { student, error } = await regenerateCardToken("s1");

    expect(error).toBeNull();
    expect(student?.cardToken).toBe("new-token");
    expect(
      vi.mocked(prisma.student.update).mock.calls[0][0].data.cardToken,
    ).toBeTruthy();
  });

  it("returns an error for an unknown student without writing", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

    const { student, error } = await regenerateCardToken("missing");

    expect(student).toBeNull();
    expect(error).toBe("Siswa tidak ditemukan");
    expect(prisma.student.update).not.toHaveBeenCalled();
  });
});

describe("getStudentCard", () => {
  it("returns the existing token without reissuing it", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1001",
      status: "ACTIVE",
      cardToken: "tok-1",
      user: { name: "Ani", avatar: null },
      schoolClass: { name: "X RPL 1" },
    } as unknown as Student);

    const card = await getStudentCard("s1");

    expect(card).toEqual({
      studentId: "s1",
      name: "Ani",
      nis: "1001",
      className: "X RPL 1",
      photo: null,
      cardToken: "tok-1",
    });
    expect(prisma.student.update).not.toHaveBeenCalled();
  });

  it("mints a token on first view so the student can show a QR immediately", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      nis: "1001",
      status: "ACTIVE",
      cardToken: null,
      user: { name: "Ani", avatar: null },
      schoolClass: { name: "X RPL 1" },
    } as unknown as Student);
    vi.mocked(prisma.student.update).mockResolvedValue({} as Student);

    const card = await getStudentCard("s1");

    expect(card?.cardToken).toBeTruthy();
    expect(
      vi.mocked(prisma.student.update).mock.calls[0][0].data.cardToken,
    ).toBe(card?.cardToken);
  });

  it("returns null for a student who is no longer active", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      id: "s1",
      status: "GRADUATED",
      cardToken: "tok-1",
    } as unknown as Student);

    await expect(getStudentCard("s1")).resolves.toBeNull();
    expect(prisma.student.update).not.toHaveBeenCalled();
  });
});

describe("getClassCards", () => {
  it("returns printable rows and skips students still without a token", async () => {
    vi.mocked(prisma.student.findMany)
      // ensureCardTokens' lookup — nothing to mint
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "s1",
          nis: "1001",
          cardToken: "tok-1",
          user: { name: "Ani", avatar: "https://img/ani.jpg" },
          schoolClass: { name: "X RPL 1" },
        },
        {
          id: "s2",
          nis: "1002",
          cardToken: null,
          user: { name: "Budi", avatar: null },
          schoolClass: { name: "X RPL 1" },
        },
      ] as unknown as Student[]);

    const cards = await getClassCards("class-1");

    expect(cards).toEqual([
      {
        studentId: "s1",
        name: "Ani",
        nis: "1001",
        className: "X RPL 1",
        photo: "https://img/ani.jpg",
        cardToken: "tok-1",
      },
    ]);
  });

  it("returns an empty list for a class with no active students", async () => {
    vi.mocked(prisma.student.findMany)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await expect(getClassCards("class-9")).resolves.toEqual([]);
  });
});
