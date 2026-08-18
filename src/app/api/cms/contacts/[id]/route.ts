import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getContactById,
  updateContact,
  deleteContact,
  toggleContactStatus,
} from "@/src/features/cms/services/contacts";
import { contactSchema } from "@/src/app/admin/cms/contacts/_components/ContactsSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const contact = await getContactById(id);

    if (!contact) {
      return NextResponse.json(
        { error: "Kontak tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kontak" },
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
    const validated = contactSchema.parse(body);
    const contact = await updateContact(id, validated);
    revalidatePath("/admin/cms/contacts");
    revalidatePath("/kontak");
    revalidatePath("/", "layout");
    return NextResponse.json(contact);
  } catch (error) {
    return handleApiError(
      error,
      "Error updating contact:",
      "Gagal memperbarui kontak",
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    const body = await request.json();

    // Handle toggle status
    if (typeof body.isActive === "boolean") {
      const contact = await toggleContactStatus(id, body.isActive);
      revalidatePath("/admin/cms/contacts");
      revalidatePath("/kontak");
      revalidatePath("/", "layout");
      return NextResponse.json(contact);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching contact:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kontak" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteContact(id);

    revalidatePath("/admin/cms/contacts");
    revalidatePath("/kontak");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Gagal menghapus kontak" },
      { status: 500 },
    );
  }
}
