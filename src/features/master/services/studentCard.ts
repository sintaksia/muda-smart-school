import { prisma } from "@/src/lib/prisma";
import type { Student } from "@prisma/client";
import { generateQrToken } from "@/src/features/attendance/utils/qr";

/** One printable ID card: identity plus the QR payload. */
export interface StudentCard {
  studentId: string;
  name: string;
  nis: string;
  className: string;
  photo: string | null;
  cardToken: string;
}

/**
 * Mint a card token for every active student in a class that has none.
 * Idempotent — students who already carry a token keep it, so reprinting a
 * class never invalidates cards already in circulation.
 *
 * @returns how many tokens were newly minted
 */
export async function ensureCardTokens(classId: string): Promise<number> {
  const pending = await prisma.student.findMany({
    where: { classId, status: "AKTIF", cardToken: null },
    select: { id: true },
  });

  const now = new Date();
  for (const student of pending) {
    await prisma.student.update({
      where: { id: student.id },
      data: { cardToken: generateQrToken(), cardIssuedAt: now },
    });
  }
  return pending.length;
}

/**
 * Replace a student's token, revoking whatever card is out there. Used when a
 * card is lost or reissued — the student's identity and NIS are untouched.
 */
export async function regenerateCardToken(
  studentId: string,
): Promise<{ student: Student | null; error: string | null }> {
  const existing = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });
  if (!existing) {
    return { student: null, error: "Siswa tidak ditemukan" };
  }
  const student = await prisma.student.update({
    where: { id: studentId },
    data: { cardToken: generateQrToken(), cardIssuedAt: new Date() },
  });
  return { student, error: null };
}

/**
 * The student's own card, for the QR they show the teacher in TEACHER_SCAN
 * mode. Mints the token on first view so a student is never stuck waiting for
 * Admin to print a sheet; the printed card later carries the same token.
 * Returns null for an unknown or non-active student.
 */
export async function getStudentCard(
  studentId: string,
): Promise<StudentCard | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      nis: true,
      status: true,
      cardToken: true,
      user: { select: { name: true, avatar: true } },
      schoolClass: { select: { name: true } },
    },
  });
  if (!student || student.status !== "AKTIF") {
    return null;
  }

  let cardToken = student.cardToken;
  if (!cardToken) {
    cardToken = generateQrToken();
    await prisma.student.update({
      where: { id: student.id },
      data: { cardToken, cardIssuedAt: new Date() },
    });
  }

  return {
    studentId: student.id,
    name: student.user.name,
    nis: student.nis,
    className: student.schoolClass?.name ?? "-",
    photo: student.user.avatar,
    cardToken,
  };
}

/**
 * Cards for a class, ready to render. Mints any missing token first so a
 * freshly created class prints in one step.
 */
export async function getClassCards(classId: string): Promise<StudentCard[]> {
  await ensureCardTokens(classId);

  const students = await prisma.student.findMany({
    where: { classId, status: "AKTIF" },
    select: {
      id: true,
      nis: true,
      cardToken: true,
      user: { select: { name: true, avatar: true } },
      schoolClass: { select: { name: true } },
    },
    orderBy: { nis: "asc" },
  });

  return students
    .filter((student) => student.cardToken !== null)
    .map((student) => ({
      studentId: student.id,
      name: student.user.name,
      nis: student.nis,
      className: student.schoolClass?.name ?? "-",
      photo: student.user.avatar,
      cardToken: student.cardToken as string,
    }));
}
