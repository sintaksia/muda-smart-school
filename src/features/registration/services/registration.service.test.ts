import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import type { Registration, RegistrationStatus } from "@prisma/client";
import {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  convertZodToPrisma,
  convertZodToUpdateInput,
  updateRegistrationStatus,
  getRegistrationsByStatus,
  getRegistrationStats,
  isValidStatus,
} from "./registration.service";
import { validRegistrasiBody } from "./registration.schema.test";
import { registrasiSchema } from "./registration.schema";

vi.mock("@/src/lib/prisma", () => ({
  prisma: {
    registration: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const parsedForm = registrasiSchema.parse(validRegistrasiBody);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllRegistrations / getRegistrationById", () => {
  it("returns registrations including the student relation", async () => {
    const rows = [{ id: "reg-1" }] as Registration[];
    vi.mocked(prisma.registration.findMany).mockResolvedValue(rows);

    const result = await getAllRegistrations();

    expect(result).toBe(rows);
    expect(prisma.registration.findMany).toHaveBeenCalledWith({
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("fetches a single registration by id", async () => {
    vi.mocked(prisma.registration.findUnique).mockResolvedValue({
      id: "reg-1",
    } as Registration);

    const result = await getRegistrationById("reg-1");

    expect(result?.id).toBe("reg-1");
    expect(prisma.registration.findUnique).toHaveBeenCalledWith({
      where: { id: "reg-1" },
      include: { student: true },
    });
  });
});

describe("createRegistration", () => {
  const input = convertZodToPrisma(parsedForm);

  it("throws when NISN or NIK already exists", async () => {
    vi.mocked(prisma.registration.findFirst).mockResolvedValue({
      id: "existing",
    } as Registration);

    await expect(createRegistration(input)).rejects.toThrow(
      "NISN atau NIK sudah terdaftar",
    );
    expect(prisma.registration.create).not.toHaveBeenCalled();
  });

  it("generates the first registration number of the year", async () => {
    vi.mocked(prisma.registration.findFirst)
      .mockResolvedValueOnce(null) // duplicate check
      .mockResolvedValueOnce(null); // last registration lookup
    vi.mocked(prisma.registration.create).mockResolvedValue({
      id: "reg-1",
    } as Registration);

    await createRegistration(input);

    const year = new Date().getFullYear();
    expect(prisma.registration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        registrationNumber: `SPMB-${year}-001`,
      }),
    });
  });

  it("increments the sequence from the last registration number", async () => {
    const year = new Date().getFullYear();
    vi.mocked(prisma.registration.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        registrationNumber: `SPMB-${year}-007`,
      } as Registration);
    vi.mocked(prisma.registration.create).mockResolvedValue({
      id: "reg-8",
    } as Registration);

    await createRegistration(input);

    expect(prisma.registration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        registrationNumber: `SPMB-${year}-008`,
      }),
    });
  });
});

describe("convertZodToPrisma", () => {
  it("converts year strings to numbers and dates to Date", () => {
    const result = convertZodToPrisma(parsedForm);

    expect(result.fatherBirthYear).toBe(1980);
    expect(result.motherBirthYear).toBe(1982);
    expect(result.graduationYear).toBe(2025);
    expect(result.birthDate).toBeInstanceOf(Date);
  });

  it("maps empty optional strings to undefined", () => {
    const result = convertZodToPrisma(parsedForm);

    expect(result.studentEmail).toBeUndefined();
    expect(result.guardianName).toBeUndefined();
    expect(result.guardianBirthYear).toBeUndefined();
  });

  it("throws a descriptive error when a required year is missing", () => {
    expect(() =>
      convertZodToPrisma({ ...parsedForm, fatherBirthYear: "" }),
    ).toThrow("Tahun lahir ayah wajib diisi dengan angka");
  });
});

describe("convertZodToUpdateInput", () => {
  it("persists cleared optional fields as null instead of skipping them", () => {
    const result = convertZodToUpdateInput(parsedForm);

    expect(result.studentEmail).toBeNull();
    expect(result.guardianName).toBeNull();
    expect(result.guardianBirthYear).toBeNull();
    expect(result.guardianEducation).toBeNull();
  });

  it("keeps filled optional fields", () => {
    const result = convertZodToUpdateInput({
      ...parsedForm,
      studentEmail: "budi@example.com",
      fatherPhone: "0811111111",
    });

    expect(result.studentEmail).toBe("budi@example.com");
    expect(result.fatherPhone).toBe("0811111111");
  });
});

describe("updateRegistrationStatus", () => {
  it("rejects an invalid status", async () => {
    await expect(updateRegistrationStatus("reg-1", "NGACO")).rejects.toThrow(
      "Status NGACO tidak valid",
    );
    expect(prisma.registration.update).not.toHaveBeenCalled();
  });

  it("updates a valid status", async () => {
    vi.mocked(prisma.registration.update).mockResolvedValue({
      id: "reg-1",
      status: "ACCEPTED" as RegistrationStatus,
    } as Registration);

    const result = await updateRegistrationStatus("reg-1", "ACCEPTED");

    expect(result.status).toBe("ACCEPTED");
    expect(prisma.registration.update).toHaveBeenCalledWith({
      where: { id: "reg-1" },
      data: { status: "ACCEPTED" },
    });
  });
});

describe("getRegistrationsByStatus", () => {
  it("rejects an invalid status", async () => {
    await expect(getRegistrationsByStatus("SALAH")).rejects.toThrow(
      'Status "SALAH" tidak valid',
    );
  });

  it("filters by status and includes the student relation", async () => {
    vi.mocked(prisma.registration.findMany).mockResolvedValue([]);

    await getRegistrationsByStatus("PENDING");

    expect(prisma.registration.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getRegistrationStats", () => {
  it("aggregates counts per status", async () => {
    vi.mocked(prisma.registration.count)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);

    const stats = await getRegistrationStats();

    expect(stats).toEqual({ total: 10, pending: 4, accepted: 5, rejected: 1 });
  });
});

describe("isValidStatus", () => {
  it("accepts known statuses and rejects unknown ones", () => {
    expect(isValidStatus("PENDING")).toBe(true);
    expect(isValidStatus("ACCEPTED")).toBe(true);
    expect(isValidStatus("APAPUN")).toBe(false);
  });
});
