import { NextResponse } from "next/server";
import { loginWithPassword } from "@/apis/auth";

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

  const result = await loginWithPassword(email.trim(), password);

  if (!result.success) {
    // Match the message, not just 401: a wrong CLIENT_SECRET is also a 401 and must not read as a bad password.
    const message =
      result.message === "Invalid email or password"
        ? "Email atau password salah."
        : result.message;
    return NextResponse.json({ message }, { status: result.code });
  }

  return NextResponse.json({ message: "Success", user: result.user });
}
