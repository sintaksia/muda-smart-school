import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getPrograms,
  createProgram,
} from "@/src/features/cms/services/programs";
import { programSchema } from "@/src/app/admin/cms/programs/_components/ProgramSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const programs = await getPrograms();
    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data program" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = programSchema.parse(body);
    const program = await createProgram(validated);
    revalidatePath("/admin/cms/programs");
    revalidatePath("/jurusan");
    revalidatePath("/");
    revalidatePath("/profil");
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: error },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal membuat program" },
      { status: 500 },
    );
  }
}
