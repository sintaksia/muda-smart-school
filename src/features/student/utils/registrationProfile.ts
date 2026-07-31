import type { Gender, Registration } from "@prisma/client";

export interface StudentProfileFromRegistration {
  gender: Gender;
  nik: string;
  birthPlace: string;
  birthDate: Date;
  streetAddress: string;
  village: string;
  district: string;
  city: string;
  province: string;
  fatherName: string;
  motherName: string;
  guardianName: string | null;
  parentPhone: string | null;
  previousSchoolName: string;
}

/**
 * Copy the biodata a registration already holds onto the Student record, so a
 * student created from a registration is as complete as one added manually.
 * The address keeps its RT/RW detail, which Student stores in one line.
 */
export function toStudentProfile(
  registration: Registration,
): StudentProfileFromRegistration {
  return {
    gender: registration.gender,
    nik: registration.nik,
    birthPlace: registration.birthPlace,
    birthDate: registration.birthDate,
    streetAddress: `${registration.streetAddress}, RT ${registration.rt}/RW ${registration.rw}`,
    village: registration.village,
    district: registration.district,
    city: registration.city,
    province: registration.province,
    fatherName: registration.fatherName,
    motherName: registration.motherName,
    guardianName: registration.guardianName,
    parentPhone:
      registration.fatherPhone ??
      registration.motherPhone ??
      registration.guardianPhone,
    previousSchoolName: registration.previousSchoolName,
  };
}
