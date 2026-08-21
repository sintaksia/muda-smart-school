import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import { createStudentFromRegistration } from "@/src/features/student/services/student.service";
import {
  getPendingIntakeCount,
  intakeAcceptedRegistrations,
} from "./registrationIntake";
import type { Registration, Student, User } from "@prisma/client";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    registration: { findMany: vi.fn(), count: vi.fn() },
    student: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
  },
}));

vi.mock("@/src/features/student/services/student.service", () => ({
  createStudentFromRegistration: vi.fn(),
}));

function registration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: "reg-1",
    registrationNumber: "SPMB-2026-153",
    fullName: "Dadan",
    studentEmail: null,
    registrationDate: new Date("2026-07-24T02:13:30.955Z"),
    ...overrides,
  } as Registration;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.student.findMany).mockResolvedValue([]);
  vi.mocked(prisma.user.findMany).mockResolvedValue([]);
  vi.mocked(createStudentFromRegistration).mockResolvedValue({
    student: { id: "s1" } as Student,
    error: null,
  });
});

describe("getPendingIntakeCount", () => {
  it("counts accepted registrations with no student yet", async () => {
    vi.mocked(prisma.registration.count).mockResolvedValue(3);

    await expect(getPendingIntakeCount()).resolves.toBe(3);
    expect(prisma.registration.count).toHaveBeenCalledWith({
      where: { status: "ACCEPTED", student: null },
    });
  });
});

describe("intakeAcceptedRegistrations", () => {
  it("issues a NIS from the intake year and mints an email when there is none", async () => {
    vi.mocked(prisma.registration.findMany).mockResolvedValue([registration()]);

    const result = await intakeAcceptedRegistrations("admin-1");

    expect(result.created).toBe(1);
    expect(result.credentials[0]).toEqual({
      name: "Dadan",
      nis: "2026001",
      email: "2026001@siswa.muda.sch.id",
      password: "Siswa2026001",
    });
    expect(createStudentFromRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationId: "reg-1",
        nis: "2026001",
        angkatan: 2026,
      }),
      "admin-1",
    );
  });

  it("keeps the registration's own email when it has one", async () => {
    vi.mocked(prisma.registration.findMany).mockResolvedValue([
      registration({ studentEmail: "dadan@contoh.sch.id" }),
    ]);

    const result = await intakeAcceptedRegistrations();

    expect(result.credentials[0].email).toBe("dadan@contoh.sch.id");
  });

  it("generates addresses when several registrations share one school email", async () => {
    const shared = "smkmuh2.cibiru@gmail.com";
    vi.mocked(prisma.registration.findMany).mockResolvedValue([
      registration({ id: "reg-1", studentEmail: shared }),
      registration({ id: "reg-2", studentEmail: shared }),
      registration({ id: "reg-3", studentEmail: shared }),
    ]);

    const result = await intakeAcceptedRegistrations();

    expect(result.created).toBe(3);
    expect(result.credentials.map((c) => c.email)).toEqual([
      "2026001@siswa.muda.sch.id",
      "2026002@siswa.muda.sch.id",
      "2026003@siswa.muda.sch.id",
    ]);
  });

  it("generates an address when the registration email already has a login", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { email: "Dadan@Contoh.sch.id" },
    ] as User[]);
    vi.mocked(prisma.registration.findMany).mockResolvedValue([
      registration({ studentEmail: "dadan@contoh.sch.id" }),
    ]);

    const result = await intakeAcceptedRegistrations();

    expect(result.credentials[0].email).toBe("2026001@siswa.muda.sch.id");
  });

  it("skips a NIS whose generated address is held by an orphaned login", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { email: "2026001@siswa.muda.sch.id" },
    ] as User[]);
    vi.mocked(prisma.registration.findMany).mockResolvedValue([registration()]);

    const result = await intakeAcceptedRegistrations();

    expect(result.created).toBe(1);
    expect(result.credentials[0]).toMatchObject({
      nis: "2026002",
      email: "2026002@siswa.muda.sch.id",
    });
  });

  it("continues the sequence after the highest NIS already issued", async () => {
    vi.mocked(prisma.student.findMany).mockResolvedValue([
      { nis: "2026004" },
      { nis: "8888" },
    ] as Student[]);
    vi.mocked(prisma.registration.findMany).mockResolvedValue([
      registration(),
      registration({ id: "reg-2", registrationNumber: "SPMB-2026-154" }),
    ]);

    const result = await intakeAcceptedRegistrations();

    expect(result.credentials.map((c) => c.nis)).toEqual([
      "2026005",
      "2026006",
    ]);
  });

  it("reports a failed registration and still processes the others", async () => {
    vi.mocked(prisma.registration.findMany).mockResolvedValue([
      registration(),
      registration({ id: "reg-2", registrationNumber: "SPMB-2026-154" }),
    ]);
    vi.mocked(createStudentFromRegistration)
      .mockResolvedValueOnce({ student: null, error: "Email sudah terdaftar" })
      .mockResolvedValueOnce({ student: { id: "s2" } as Student, error: null });

    const result = await intakeAcceptedRegistrations();

    expect(result.created).toBe(1);
    expect(result.failures).toEqual([
      {
        registrationNumber: "SPMB-2026-153",
        name: "Dadan",
        error: "Email sudah terdaftar",
      },
    ]);
    // The NIS of the failed row is not burned.
    expect(result.credentials[0].nis).toBe("2026001");
  });
});
