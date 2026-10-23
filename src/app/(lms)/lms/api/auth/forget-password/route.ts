import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/apis/auth";
import { authErrorMessage } from "@/lib/auth-messages";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    typeof body?.email !== "string" ||
    !body.email.trim() ||
    body.email.trim().length > 255
  ) {
    return NextResponse.json(
      { success: false, message: "Isi email akun LMS yang valid." },
      { status: 400 },
    );
  }
  try {
    const result = await requestPasswordReset(body.email.trim());
    if (!result.success)
      return NextResponse.json(
        {
          success: false,
          message: authErrorMessage(
            result.message,
            "Tautan reset belum dapat dikirim. Silakan coba lagi.",
          ),
        },
        { status: result.code >= 400 ? result.code : 502 },
      );
    if (!result.data?.expires_in_minutes)
      return NextResponse.json(
        {
          success: false,
          message:
            "Konfirmasi pengiriman belum dapat diterima. Silakan coba lagi.",
        },
        { status: 502 },
      );
    return NextResponse.json(
      { success: true, data: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "Layanan reset password belum dapat dihubungi. Silakan coba lagi.",
      },
      { status: 503 },
    );
  }
}
