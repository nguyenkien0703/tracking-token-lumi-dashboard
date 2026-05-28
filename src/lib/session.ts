import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "lumipulse_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type SessionPayload = {
  email: string;
  name: string;
  picture?: string;
  isAdmin: boolean;
};

type VerifiedSession = SessionPayload & { iat: number; exp: number };

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined): Promise<VerifiedSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.isAdmin !== "boolean"
    ) {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      isAdmin: payload.isAdmin,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<VerifiedSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export function getSessionFromRequest(req: NextRequest): Promise<VerifiedSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
