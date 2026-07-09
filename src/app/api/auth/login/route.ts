import { NextResponse } from "next/server";
import { login } from "@/src/features/auth/services/auth";
import { loginSchema } from "@/src/app/(auth)/login/_components/LoginSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const { user, error } = await login(email, password);

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Login gagal" },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
