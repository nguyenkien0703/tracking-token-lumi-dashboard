import { createRemoteJWKSet, jwtVerify } from "jose";

export const ALLOWED_HD = "savameta.com";
export const SEED_ADMINS = ["kiennv@savameta.com"];

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const GOOGLE_ISSUER = "https://accounts.google.com";
const SCOPES = ["openid", "email", "profile"];

const JWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

export type GoogleProfile = {
  email: string;
  name: string;
  picture?: string;
};

export function buildGoogleAuthUrl(params: {
  state: string;
  nonce: string;
}): string {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("hd", ALLOWED_HD);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeCodeForTokens(code: string): Promise<{ id_token: string }> {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token_exchange_failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error("token_exchange_no_id_token");
  return { id_token: data.id_token };
}

export async function verifyGoogleIdToken(
  idToken: string,
  expectedNonce: string,
): Promise<GoogleProfile> {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: GOOGLE_ISSUER,
    audience: clientId,
  });

  if (payload.hd !== ALLOWED_HD) throw new Error("domain_not_allowed");
  if (payload.email_verified !== true) throw new Error("email_not_verified");
  if (payload.nonce !== expectedNonce) throw new Error("nonce_mismatch");

  const email = payload.email;
  const name = payload.name;
  if (typeof email !== "string" || typeof name !== "string") {
    throw new Error("missing_profile_claims");
  }

  return {
    email,
    name,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}

export function computeIsAdmin(email: string): boolean {
  const envAdmins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = new Set([
    ...SEED_ADMINS.map((s) => s.toLowerCase()),
    ...envAdmins,
  ]);
  return all.has(email.toLowerCase());
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}
