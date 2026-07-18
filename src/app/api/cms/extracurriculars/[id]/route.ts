import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getExtracurricularById,
  updateExtracurricular,
  deleteExtracurricular,
  toggleExtracurricularStatus,
} from "@/src/features/cms/services/extracurriculars";
import { extracurricularSchema } from "@/src/app/admin/cms/extracurriculars/_components/ExtracurricularSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const extracurricular = await getExtracurricularById(id);

    if (!extracurricular) {
      return NextResponse.json(
        { error: "Ekstrakurikuler tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(extracurricular);
  } catch (error) {
    console.error("Error fetching extracurricular:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ekstrakurikuler" },
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
    const validated = extracurricularSchema.parse(body);
    const extracurricular = await updateExtracurricular(id, validated);
    revalidatePath("/admin/cms/extracurriculars");
    revalidatePath("/profil");
    return NextResponse.json(extracurricular);
  } catch (error) {
    console.error("Error updating extracurricular:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui ekstrakurikuler" },
      { status: 500 },
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
      const extracurricular = await toggleExtracurricularStatus(
        id,
        body.isActive,
      );
      revalidatePath("/admin/cms/extracurriculars");
      revalidatePath("/profil");
      return NextResponse.json(extracurricular);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching extracurricular:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui ekstrakurikuler" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteExtracurricular(id);
    revalidatePath("/admin/cms/extracurriculars");
    revalidatePath("/profil");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting extracurricular:", error);
    return NextResponse.json(
      { error: "Gagal menghapus ekstrakurikuler" },
      { status: 500 },
    );
  }
}
