import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/src/features/auth/services/auth";
import { canAccessAdmin } from "@/src/features/auth/utils/permissions";
import { STATUS_PENDAFTARAN_VALUES } from "@/src/lib/constants";
import {
  getRegistrationById,
  deleteRegistration,
  updateRegistrationStatus,
  updateRegistration,
  convertZodToUpdateInput,
  registrasiSchema,
} from "@/src/features/registration/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const statusUpdateSchema = z.object({
  status: z.enum(
    STATUS_PENDAFTARAN_VALUES as [
      (typeof STATUS_PENDAFTARAN_VALUES)[number],
      ...(typeof STATUS_PENDAFTARAN_VALUES)[number][],
    ],
    { message: "Status tidak valid" },
  ),
});

// All handlers are admin-only: registration records contain applicant PII
async function requireAdmin(): Promise<NextResponse | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAccessAdmin(currentUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// GET: Get single registration by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const registration = await getRegistrationById(id);

    if (!registration) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pendaftaran" },
      { status: 500 },
    );
  }
}

// PATCH: Partial update (status update)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const parsed = statusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Status tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const registration = await updateRegistrationStatus(id, parsed.data.status);

    revalidatePath("/admin/registrations");
    revalidatePath(`/admin/registrations/${id}`);

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error patching registration:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pendaftaran" },
      { status: 500 },
    );
  }
}

// PUT: Full update of registration data
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    const existing = await getRegistrationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = registrasiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updateInput = convertZodToUpdateInput(parsed.data);
    const registration = await updateRegistration(id, updateInput);

    revalidatePath("/admin/registrations");
    revalidatePath(`/admin/registrations/${id}`);

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data pendaftaran" },
      { status: 500 },
    );
  }
}

// DELETE: Delete registration
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    const existing = await getRegistrationById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak ditemukan" },
        { status: 404 },
      );
    }

    await deleteRegistration(id);

    revalidatePath("/admin/registrations");

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data pendaftaran" },
      { status: 500 },
    );
  }
}
