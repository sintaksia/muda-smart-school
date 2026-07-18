import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getAiChatSetting,
  updateAiChatSetting,
} from "@/src/features/cms/services/ai-chat";
import { aiChatSchema } from "@/src/app/admin/cms/ai-chat/_components/AiChatSchema";
import { requireCmsAccess } from "@/src/features/auth/utils/api-auth";

export async function GET() {
  try {
    const setting = await getAiChatSetting();
    return NextResponse.json(setting);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan AI Chat" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authCheck = await requireCmsAccess();
    if ("response" in authCheck) return authCheck.response;

    const body = await request.json();
    const validated = aiChatSchema.parse(body);
    const setting = await updateAiChatSetting(validated);

    revalidatePath("/admin/cms/ai-chat");
    return NextResponse.json(setting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan AI Chat" },
      { status: 500 },
    );
  }
}
