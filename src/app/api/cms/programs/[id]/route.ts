import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getProgramById,
  updateProgram,
  deleteProgram,
  toggleProgramStatus,
} from "@/src/features/cms/services/programs";
import { programSchema } from "@/src/app/admin/cms/programs/_components/ProgramSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const program = await getProgramById(id);

    if (!program) {
      return NextResponse.json(
        { error: "Program tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data program" },
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
    const validated = programSchema.parse(body);
    const program = await updateProgram(id, validated);
    revalidatePath("/admin/cms/programs");
    revalidatePath("/jurusan");
    return NextResponse.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal memperbarui program" },
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

    // Handle toggle status
    if (typeof body.isActive === "boolean") {
      const program = await toggleProgramStatus(id, body.isActive);
      revalidatePath("/admin/cms/programs");
      revalidatePath("/jurusan");
      return NextResponse.json(program);
    }

    return NextResponse.json({ error: "Operasi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("Error patching program:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui program" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const { id } = await params;
    await deleteProgram(id);
    revalidatePath("/admin/cms/programs");
    revalidatePath("/jurusan");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Gagal menghapus program" },
      { status: 500 },
    );
  }
}
