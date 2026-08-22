import { NextResponse } from "next/server";
import { loginWithGoogleAccessToken } from "@/apis/auth";

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
      { status: 400 }
    );
  }

  const result = await loginWithGoogleAccessToken(accessToken);

  if (!result.success) {
    return NextResponse.json(
      { message: result.message },
      { status: result.code }
    );
  }

  return NextResponse.json({ message: "Success", user: result.user });
}
