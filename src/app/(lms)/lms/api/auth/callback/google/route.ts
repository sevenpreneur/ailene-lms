import { NextResponse } from "next/server";
import { loginWithGoogleAccessToken } from "@/apis/auth";
import { authErrorMessage } from "@/lib/auth-messages";

export async function POST(request: Request) {
  let accessToken: unknown;
  try {
    const body = await request.json();
    accessToken = body?.access_token;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof accessToken !== "string" || !accessToken) {
    return NextResponse.json(
      { message: "access_token is required" },
      { status: 400 },
    );
  }

  try {
    const result = await loginWithGoogleAccessToken(accessToken);
    if (!result.success) {
      return NextResponse.json(
        {
          message: authErrorMessage(
            result.message,
            "Login dengan Google belum dapat diproses. Silakan coba lagi.",
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
