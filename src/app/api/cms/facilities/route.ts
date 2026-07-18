import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getFacilities,
  createFacility,
} from "@/src/features/cms/services/facilities";
import { facilitySchema } from "@/src/app/admin/cms/facilities/_components/FacilitySchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const facilities = await getFacilities();
    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data fasilitas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = facilitySchema.parse(body);
    const facility = await createFacility(validated);
    revalidatePath("/admin/cms/facilities");
    revalidatePath("/profil");
    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("Error creating facility:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat fasilitas" },
      { status: 500 },
    );
  }
}
