import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isAdminConfigured,
  verifyAdminSessionCookie,
} from "@/lib/adminAuthEdge";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/session",
]);

function isPublicAdminPath(pathname: string): boolean {
  return (
    PUBLIC_ADMIN_PATHS.has(pathname) || PUBLIC_ADMIN_API_PATHS.has(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminConfigured()) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { ok: false, message: "Admin access is not configured on the server." },
        { status: 503 }
      );
    }
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "not_configured");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = await verifyAdminSessionCookie(sessionCookie);

  if (isPublicAdminPath(pathname)) {
    if (pathname === "/admin/login" && authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
