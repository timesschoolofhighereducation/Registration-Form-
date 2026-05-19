import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MESSAGE,
} from "@/lib/adminConstants";

export { ADMIN_COOKIE_NAME };

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function createAdminSessionToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(ADMIN_SESSION_MESSAGE)
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

export async function verifyAdminSessionCookie(
  cookieValue: string | undefined
): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  if (!secret || !cookieValue) return false;

  try {
    const expected = await createAdminSessionToken(secret);
    return timingSafeEqualString(cookieValue, expected);
  } catch {
    return false;
  }
}
