import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/src/lib/prisma";
import type { Pendaftaran, StatusPendaftaran } from "@prisma/client";
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
    pendaftaran: {
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
    const rows = [{ id: "reg-1" }] as Pendaftaran[];
    vi.mocked(prisma.pendaftaran.findMany).mockResolvedValue(rows);

    const result = await getAllRegistrations();

    expect(result).toBe(rows);
    expect(prisma.pendaftaran.findMany).toHaveBeenCalledWith({
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("fetches a single registration by id", async () => {
    vi.mocked(prisma.pendaftaran.findUnique).mockResolvedValue({
      id: "reg-1",
    } as Pendaftaran);

    const result = await getRegistrationById("reg-1");

    expect(result?.id).toBe("reg-1");
    expect(prisma.pendaftaran.findUnique).toHaveBeenCalledWith({
      where: { id: "reg-1" },
      include: { student: true },
    });
  });
});

describe("createRegistration", () => {
  const input = convertZodToPrisma(parsedForm);

  it("throws when NISN or NIK already exists", async () => {
    vi.mocked(prisma.pendaftaran.findFirst).mockResolvedValue({
      id: "existing",
    } as Pendaftaran);

    await expect(createRegistration(input)).rejects.toThrow(
      "NISN atau NIK sudah terdaftar",
    );
    expect(prisma.pendaftaran.create).not.toHaveBeenCalled();
  });

  it("generates the first registration number of the year", async () => {
    vi.mocked(prisma.pendaftaran.findFirst)
      .mockResolvedValueOnce(null) // duplicate check
      .mockResolvedValueOnce(null); // last registration lookup
    vi.mocked(prisma.pendaftaran.create).mockResolvedValue({
      id: "reg-1",
    } as Pendaftaran);

    await createRegistration(input);

    const year = new Date().getFullYear();
    expect(prisma.pendaftaran.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nomorPendaftaran: `SPMB-${year}-001`,
      }),
    });
  });

  it("increments the sequence from the last registration number", async () => {
    const year = new Date().getFullYear();
    vi.mocked(prisma.pendaftaran.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        nomorPendaftaran: `SPMB-${year}-007`,
      } as Pendaftaran);
    vi.mocked(prisma.pendaftaran.create).mockResolvedValue({
      id: "reg-8",
    } as Pendaftaran);

    await createRegistration(input);

    expect(prisma.pendaftaran.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nomorPendaftaran: `SPMB-${year}-008`,
      }),
    });
  });
});

describe("convertZodToPrisma", () => {
  it("converts year strings to numbers and dates to Date", () => {
    const result = convertZodToPrisma(parsedForm);

    expect(result.tahunLahirAyah).toBe(1980);
    expect(result.tahunLahirIbu).toBe(1982);
    expect(result.tahunLulus).toBe(2025);
    expect(result.tanggalLahir).toBeInstanceOf(Date);
  });

  it("maps empty optional strings to undefined", () => {
    const result = convertZodToPrisma(parsedForm);

    expect(result.emailMurid).toBeUndefined();
    expect(result.namaWali).toBeUndefined();
    expect(result.tahunLahirWali).toBeUndefined();
  });

  it("throws a descriptive error when a required year is missing", () => {
    expect(() =>
      convertZodToPrisma({ ...parsedForm, tahunLahirAyah: "" }),
    ).toThrow("Tahun lahir ayah wajib diisi dengan angka");
  });
});

describe("convertZodToUpdateInput", () => {
  it("persists cleared optional fields as null instead of skipping them", () => {
    const result = convertZodToUpdateInput(parsedForm);

    expect(result.emailMurid).toBeNull();
    expect(result.namaWali).toBeNull();
    expect(result.tahunLahirWali).toBeNull();
    expect(result.pendidikanWali).toBeNull();
  });

  it("keeps filled optional fields", () => {
    const result = convertZodToUpdateInput({
      ...parsedForm,
      emailMurid: "budi@example.com",
      noTelpAyah: "0811111111",
    });

    expect(result.emailMurid).toBe("budi@example.com");
    expect(result.noTelpAyah).toBe("0811111111");
  });
});

describe("updateRegistrationStatus", () => {
  it("rejects an invalid status", async () => {
    await expect(updateRegistrationStatus("reg-1", "NGACO")).rejects.toThrow(
      "Status NGACO tidak valid",
    );
    expect(prisma.pendaftaran.update).not.toHaveBeenCalled();
  });

  it("updates a valid status", async () => {
    vi.mocked(prisma.pendaftaran.update).mockResolvedValue({
      id: "reg-1",
      status: "DITERIMA" as StatusPendaftaran,
    } as Pendaftaran);

    const result = await updateRegistrationStatus("reg-1", "DITERIMA");

    expect(result.status).toBe("DITERIMA");
    expect(prisma.pendaftaran.update).toHaveBeenCalledWith({
      where: { id: "reg-1" },
      data: { status: "DITERIMA" },
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
    vi.mocked(prisma.pendaftaran.findMany).mockResolvedValue([]);

    await getRegistrationsByStatus("PENDING");

    expect(prisma.pendaftaran.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getRegistrationStats", () => {
  it("aggregates counts per status", async () => {
    vi.mocked(prisma.pendaftaran.count)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);

    const stats = await getRegistrationStats();

    expect(stats).toEqual({ total: 10, pending: 4, diterima: 5, ditolak: 1 });
  });
});

describe("isValidStatus", () => {
  it("accepts known statuses and rejects unknown ones", () => {
    expect(isValidStatus("PENDING")).toBe(true);
    expect(isValidStatus("DITERIMA")).toBe(true);
    expect(isValidStatus("APAPUN")).toBe(false);
  });
});
