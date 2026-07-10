import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import {
  getAllRegistrations,
  createRegistration,
  convertZodToPrisma,
  getRegistrationsByStatus,
  isValidStatus,
} from "@/src/features/registration/services";
import { registrasiSchema } from "@/src/features/registration/services/registration.schema";

// GET: Get all registrations (admin only — contains applicant PII)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const statusParam = request.nextUrl.searchParams.get("status");

    if (statusParam && !isValidStatus(statusParam)) {
      return NextResponse.json(
        { error: `Status "${statusParam}" tidak valid` },
        { status: 400 },
      );
    }

    const registrations = statusParam
      ? await getRegistrationsByStatus(statusParam)
      : await getAllRegistrations();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 },
    );
  }
}

// POST: Create new registration (public — used by the /registrasi form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = registrasiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const prismaData = convertZodToPrisma(parsed.data);
    const registration = await createRegistration(prismaData);

    revalidatePath("/admin/registrations");

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);

    if (
      error instanceof Error &&
      error.message === "NISN atau NIK sudah terdaftar"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Gagal membuat pendaftaran" },
      { status: 500 },
    );
  }
}
