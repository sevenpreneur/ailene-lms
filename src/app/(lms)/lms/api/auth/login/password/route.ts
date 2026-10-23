import { NextResponse } from "next/server";
import { loginWithPassword } from "@/apis/auth";
import { authErrorMessage } from "@/lib/auth-messages";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return NextResponse.json(
      { message: "Email dan password wajib diisi." },
      { status: 400 },
    );
  }

  try {
    const result = await loginWithPassword(email.trim(), password);
    if (!result.success) {
      return NextResponse.json(
        {
          message: authErrorMessage(
            result.message,
            "Login belum dapat diproses. Silakan coba lagi.",
          ),
        },
        { status: result.code >= 400 ? result.code : 502 },
      );
    }
    return NextResponse.json({ message: "Success", user: result.user });
  } catch {
    return NextResponse.json(
      { message: "Layanan masuk belum dapat dihubungi. Silakan coba lagi." },
      { status: 503 },
    );
  }
}
