import { NextResponse } from "next/server";
import { resetPassword } from "@/apis/auth";
import { authErrorMessage } from "@/lib/auth-messages";
import { isPasswordResetId, RESET_LINK_INVALID_MESSAGE } from "@/lib/password";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isPasswordResetId(body?.session_id)) {
    return NextResponse.json(
      {
        success: false,
        reason: "invalid_link",
        message: authErrorMessage(
          RESET_LINK_INVALID_MESSAGE,
          "Tautan reset tidak valid.",
        ),
      },
      { status: 400 },
    );
  }
  if (typeof body?.password !== "string" || !body.password) {
    return NextResponse.json(
      { success: false, message: "Password baru wajib diisi." },
      { status: 400 },
    );
  }
  try {
    const result = await resetPassword(body.session_id, body.password);
    if (!result.success)
      return NextResponse.json(
        {
          success: false,
          reason:
            result.message === RESET_LINK_INVALID_MESSAGE
              ? "invalid_link"
              : undefined,
          message: authErrorMessage(
            result.message,
            "Password belum dapat disimpan. Silakan coba lagi.",
          ),
        },
        { status: result.code >= 400 ? result.code : 502 },
      );
    return NextResponse.json(
      { success: true },
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
