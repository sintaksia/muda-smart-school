import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAiChatSetting } from "@/src/features/cms/services/ai-chat";

const chatSchema = z.object({
  message: z.string({ message: "Pesan wajib diisi" }).min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string() })),
      }),
    )
    .optional()
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = chatSchema.parse(body);

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Konfigurasi AI tidak tersedia" },
        { status: 500 },
      );
    }

    const setting = await getAiChatSetting();

    if (!setting.isActive) {
      return NextResponse.json(
        { error: "AI Chat sementara tidak tersedia" },
        { status: 503 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      systemInstruction: setting.systemPrompt,
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.4,
      },
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
    }
    console.error("[chat/route] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan, coba lagi nanti" },
      { status: 500 },
    );
  }
}
