import { prisma } from "@/src/lib/prisma";
import { createStudentFromRegistration } from "@/src/features/student/services/student.service";
import { nextNis, pickStudentEmail } from "../utils/studentNis";
import { defaultStudentPassword } from "../utils/studentPassword";
import type { StudentPromotionResult } from "../types";

/** Registrations that are accepted but have no student record yet. */
export async function getPendingPromotionCount(): Promise<number> {
  return prisma.registration.count({
    where: { status: "ACCEPTED", student: null },
  });
}

/**
 * Create a student account for every ACCEPTED registration that doesn't have
 * one yet, so an admin never has to move them across by hand.
 *
 * The NIS is issued as `<angkatan><sequence>` continuing from the highest NIS
 * already used for that intake year; the login email falls back to the NIS
 * domain when the registration has none, shares one with another registration,
 * or names an address that already has a login. Each registration is
 * independent — a failure is reported and the rest still go through.
 */
export async function promoteAcceptedRegistrations(
  createdById?: string,
): Promise<StudentPromotionResult> {
  const [registrations, existingStudents, existingUsers] = await Promise.all([
    prisma.registration.findMany({
      where: { status: "ACCEPTED", student: null },
      select: {
        id: true,
        registrationNumber: true,
        fullName: true,
        studentEmail: true,
        registrationDate: true,
      },
      orderBy: { registrationDate: "asc" },
    }),
    prisma.student.findMany({ select: { nis: true } }),
    prisma.user.findMany({ select: { email: true } }),
  ]);

  const issuedNis = existingStudents.map((student) => student.nis);
  const takenEmails = new Set(
    existingUsers.map((user) => user.email.toLowerCase()),
  );

  // An address listed on more than one registration (typically the school's
  // own) can't become anyone's personal login.
  const emailUsage = new Map<string, number>();
  for (const registration of registrations) {
    const email = registration.studentEmail?.trim().toLowerCase();
    if (email) emailUsage.set(email, (emailUsage.get(email) ?? 0) + 1);
  }
  const result: StudentPromotionResult = {
    created: 0,
    credentials: [],
    failures: [],
  };

  for (const registration of registrations) {
    const angkatan = registration.registrationDate.getFullYear();
    const sharedCount =
      emailUsage.get(registration.studentEmail?.trim().toLowerCase() ?? "") ??
      0;

    let nis = nextNis(angkatan, issuedNis);
    let email = pickStudentEmail({
      registrationEmail: registration.studentEmail,
      nis,
      sharedCount,
      takenEmails,
    });
    // A leftover login sitting on the generated address (e.g. an orphan from a
    // crashed run) must not wedge the batch — move to the next NIS instead.
    while (takenEmails.has(email.toLowerCase())) {
      issuedNis.push(nis);
      nis = nextNis(angkatan, issuedNis);
      email = pickStudentEmail({
        registrationEmail: registration.studentEmail,
        nis,
        sharedCount,
        takenEmails,
      });
    }

    const password = defaultStudentPassword(nis);

    const { student, error } = await createStudentFromRegistration(
      { registrationId: registration.id, nis, angkatan, password, email },
      createdById,
    );

    if (error || !student) {
      result.failures.push({
        registrationNumber: registration.registrationNumber,
        name: registration.fullName,
        error: error ?? "Gagal membuat akun siswa",
      });
      continue;
    }

    // Reserve the NIS and the address only once they are actually taken.
    issuedNis.push(nis);
    takenEmails.add(email.toLowerCase());
    result.created += 1;
    result.credentials.push({
      name: registration.fullName,
      nis,
      email,
      password,
    });
  }

  return result;
}
