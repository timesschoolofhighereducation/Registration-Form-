import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  getAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin access is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as { password?: string };
    const password = body.password?.trim() ?? "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { ok: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_COOKIE_NAME,
      getAdminSessionToken(),
      adminCookieOptions()
    );
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unexpected error" },
      { status: 500 }
    );
  }
}
