import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getFacilityById,
  updateFacility,
  deleteFacility,
  toggleFacilityStatus,
} from "@/src/features/cms/services/facilities";
import { facilitySchema } from "@/src/app/admin/cms/facilities/_components/FacilitySchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const facility = await getFacilityById(id);

    if (!facility) {
      return NextResponse.json(
        { error: "Fasilitas tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Error fetching facility:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data fasilitas" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();
    const validated = facilitySchema.parse(body);
    const facility = await updateFacility(id, validated);
    revalidatePath("/admin/cms/facilities");
    revalidatePath("/profil");
    return NextResponse.json(facility);
  } catch (error) {
    return handleApiError(
      error,
      "Error updating facility:",
      "Gagal memperbarui fasilitas",
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();

    if (typeof body.isActive === "boolean") {
      const facility = await toggleFacilityStatus(id, body.isActive);
      revalidatePath("/admin/cms/facilities");
      revalidatePath("/profil");
      return NextResponse.json(facility);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching facility:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui fasilitas" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteFacility(id);
    revalidatePath("/admin/cms/facilities");
    revalidatePath("/profil");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting facility:", error);
    return NextResponse.json(
      { error: "Gagal menghapus fasilitas" },
      { status: 500 },
    );
  }
}
