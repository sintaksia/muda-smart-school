import { NextResponse } from "next/server";
import { getStudentByUserId } from "@/src/features/student/services/student.service";
import { getTeacherByUserId } from "@/src/features/master/services/teacher";
import { getCurrentUser } from "../services/auth";
import { canAccessAdmin, canManageCMS } from "./permissions";
import type { SessionUser } from "../types";
import type { Student, Teacher } from "@prisma/client";

/**
 * Require the caller to be an authenticated student, and resolve the Student
 * record their session is linked to.
 *
 * 401 when unauthenticated, 403 when the account has no Student record — the
 * latter covers both wrong-role callers and users whose profile was never
 * linked (the web app shows ProfileNotLinkedNotice for the same state).
 */
export async function requireStudent(): Promise<
  { user: SessionUser; student: Student } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const student = await getStudentByUserId(user.id);

  if (!student) {
    return {
      response: NextResponse.json(
        { error: "Akun ini tidak terhubung ke data siswa" },
        { status: 403 },
      ),
    };
  }

  return { user, student };
}

/**
 * Require the caller to be an authenticated teacher, and resolve the Teacher
 * record their session is linked to. Mirrors {@link requireStudent}.
 */
export async function requireTeacher(): Promise<
  { user: SessionUser; teacher: Teacher } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const teacher = await getTeacherByUserId(user.id);

  if (!teacher) {
    return {
      response: NextResponse.json(
        { error: "Akun ini tidak terhubung ke data guru" },
        { status: 403 },
      ),
    };
  }

  return { user, teacher };
}

/**
 * Require the caller to be authenticated and allowed into the admin area.
 * Returns the session user on success, or a NextResponse to return immediately on failure.
 */
export async function requireAdminAccess(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!canAccessAdmin(user.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}

/**
 * Require the caller to be authenticated and allowed to manage CMS content.
 * Returns the session user on success, or a NextResponse to return immediately on failure.
 */
export async function requireCmsAccess(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!canManageCMS(user.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}
