import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "simuceo_session";

const DEFAULT_MAX_AGE_DAYS = 30;

type RawSession = {
  founderId: string;
  email: string;
  issuedAt: number;
};

export type AuthSession = RawSession;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Please configure a strong secret for signing session cookies.",
    );
  }
  return secret;
}

function signPayload(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("hex");
}

export function createSessionCookie(session: RawSession): string {
  const payload = JSON.stringify(session);
  const signature = signPayload(payload);
  const value = Buffer.from(`${payload}.${signature}`).toString("base64url");
  return value;
}

export function parseSessionCookie(
  cookieValue: string | undefined,
): AuthSession | null {
  if (!cookieValue) return null;
  try {
    const decoded = Buffer.from(cookieValue, "base64url").toString("utf8");
    const [payload, signature] = decoded.split(".");
    if (!payload || !signature) return null;
    const expected = signPayload(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const parsed = JSON.parse(payload) as RawSession;
    if (!parsed.founderId || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionCookie(raw);
}

export async function setSessionCookie(session: AuthSession): Promise<void> {
  const store = await cookies();
  const value = createSessionCookie(session);
  const maxAgeSeconds = DEFAULT_MAX_AGE_DAYS * 24 * 60 * 60;
  store.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

