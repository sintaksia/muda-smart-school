import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllRegistrations,
  createRegistration,
  convertZodToPrisma,
  getRegistrationsByStatus,
} from "@/src/features/registration/services";
import { registrasiSchema } from "@/src/features/registration/services/registration.schema";

// GET: Get all registrations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");

    let registrations;

    if (statusParam) {
      // Get filtered by status
      registrations = await getRegistrationsByStatus(statusParam);
    } else {
      // Get all
      registrations = await getAllRegistrations();
    }

    return NextResponse.json(registrations);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 },
    );
  }
}

// POST: Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate with Zod
    const validatedData = registrasiSchema.parse(body);

    // 2. Convert Zod to Prisma format
    const prismaData = convertZodToPrisma(validatedData);

    // 3. Create in database
    const registration = await createRegistration(prismaData);

    // 4. Revalidate cache
    revalidatePath("/admin/registrations");
    revalidatePath("/api/registrations");

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("Error creating registration:", error);

    if (error instanceof Error && "errors" in error) {
      return NextResponse.json(
        {
          error: "Data tidak valid",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat pendaftaran" },
      { status: 500 },
    );
  }
}
