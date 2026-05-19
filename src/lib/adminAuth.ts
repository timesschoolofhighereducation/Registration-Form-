import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MESSAGE,
} from "@/lib/adminConstants";

export { ADMIN_COOKIE_NAME };

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export function getAdminSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return createHmac("sha256", secret)
    .update(ADMIN_SESSION_MESSAGE)
    .digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) return false;

  const provided = Buffer.from(password);
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;
  return timingSafeEqual(provided, target);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!session) return false;

  try {
    const expected = getAdminSessionToken();
    const provided = Buffer.from(session);
    const target = Buffer.from(expected);
    if (provided.length !== target.length) return false;
    return timingSafeEqual(provided, target);
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}
