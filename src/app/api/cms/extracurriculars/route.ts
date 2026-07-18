import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getExtracurriculars,
  createExtracurricular,
} from "@/src/features/cms/services/extracurriculars";
import { extracurricularSchema } from "@/src/app/admin/cms/extracurriculars/_components/ExtracurricularSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const extracurriculars = await getExtracurriculars();
    return NextResponse.json(extracurriculars);
  } catch (error) {
    console.error("Error fetching extracurriculars:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ekstrakurikuler" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = extracurricularSchema.parse(body);
    const extracurricular = await createExtracurricular(validated);
    revalidatePath("/admin/cms/extracurriculars");
    revalidatePath("/profil");
    return NextResponse.json(extracurricular, { status: 201 });
  } catch (error) {
    console.error("Error creating extracurricular:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat ekstrakurikuler" },
      { status: 500 },
    );
  }
}
