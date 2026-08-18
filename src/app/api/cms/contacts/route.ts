import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getContacts,
  createContact,
} from "@/src/features/cms/services/contacts";
import { contactSchema } from "@/src/app/admin/cms/contacts/_components/ContactsSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const contacts = await getContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kontak" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = contactSchema.parse(body);
    const contact = await createContact(validated);

    revalidatePath("/admin/cms/contacts");
    revalidatePath("/kontak");
    revalidatePath("/", "layout");
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);

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
      { error: "Gagal membuat kontak" },
      { status: 500 },
    );
  }
}
