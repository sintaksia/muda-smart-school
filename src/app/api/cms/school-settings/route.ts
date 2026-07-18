import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAllSettings,
  bulkUpsertSettings,
} from "@/src/features/cms/services/school-settings";
import { schoolProfileSchema } from "@/src/app/admin/cms/school-profile/_components/SchoolProfileSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";
import { handleApiError } from "@/src/lib/api-error";

export async function GET() {
  try {
    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan sekolah" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = schoolProfileSchema.parse(body);

    const settingsToUpsert = [
      {
        key: "school_name",
        value: validated.school_name,
        type: "TEXT",
        label: "Nama Sekolah",
        group: "identity",
        order: 0,
      },
      {
        key: "school_tagline",
        value: validated.school_tagline || "",
        type: "TEXT",
        label: "Tagline Sekolah",
        group: "identity",
        order: 1,
      },
      {
        key: "school_logo",
        value: validated.school_logo || "",
        type: "IMAGE",
        label: "Logo Sekolah",
        group: "identity",
        order: 2,
      },
      {
        key: "accreditation_grade",
        value: validated.accreditation_grade || "",
        type: "TEXT",
        label: "Akreditasi",
        group: "identity",
        order: 3,
      },
      {
        key: "vision_text",
        value: validated.vision_text || "",
        type: "TEXTAREA",
        label: "Visi",
        group: "vision_mission",
        order: 0,
      },
      {
        key: "missions",
        value: JSON.stringify(validated.missions || []),
        type: "JSON",
        label: "Misi",
        group: "vision_mission",
        order: 1,
      },
      {
        key: "address_line1",
        value: validated.address_line1 || "",
        type: "TEXT",
        label: "Alamat Baris 1",
        group: "address",
        order: 0,
      },
      {
        key: "address_line2",
        value: validated.address_line2 || "",
        type: "TEXT",
        label: "Alamat Baris 2",
        group: "address",
        order: 1,
      },
      {
        key: "address_line3",
        value: validated.address_line3 || "",
        type: "TEXT",
        label: "Alamat Baris 3",
        group: "address",
        order: 2,
      },
      {
        key: "postal_code",
        value: validated.postal_code || "",
        type: "TEXT",
        label: "Kode Pos",
        group: "address",
        order: 3,
      },
      {
        key: "maps_url",
        value: validated.maps_url || "",
        type: "TEXT",
        label: "URL Google Maps",
        group: "address",
        order: 4,
      },
    ];

    await bulkUpsertSettings(settingsToUpsert);

    revalidatePath("/admin/cms/school-profile");
    revalidatePath("/profil");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(
      error,
      "Error updating school settings:",
      "Gagal memperbarui pengaturan sekolah",
    );
  }
}
