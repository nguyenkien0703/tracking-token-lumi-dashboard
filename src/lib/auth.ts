/**
 * Auto-login token manager.
 * - Tự login bằng credentials khi khởi động hoặc token hết hạn
 * - Cache token trong memory (per-process)
 * - Singleton promise để tránh nhiều request login đồng thời
 */

const API_BASE_URL = process.env.API_BASE_URL ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

// Refresh token trước 5 phút khi hết hạn
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface TokenCache {
  token: string;
  expiresAt: number; // ms
  userId: number;
  role: string;
}

let cache: TokenCache | null = null;
let loginPromise: Promise<string> | null = null; // Prevent concurrent logins

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1];
  return JSON.parse(Buffer.from(base64, "base64url").toString("utf-8"));
}

async function login(): Promise<string> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not configured in env.");
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auto-login failed [${res.status}]: ${text}`);
  }

  const json = await res.json();
  const token: string = json?.data?.token;
  if (!token) throw new Error("Login response missing token field.");

  const payload = decodeJwtPayload(token);
  const expiresAt = (payload.exp as number) * 1000;

  cache = {
    token,
    expiresAt,
    userId: payload.userId as number,
    role: payload.role as string,
  };

  console.log(
    `[auth] Token refreshed. role=${cache.role} userId=${cache.userId} expires=${new Date(expiresAt).toISOString()}`
  );

  return token;
}

/** Lấy token hợp lệ, tự login nếu chưa có hoặc sắp hết hạn */
export async function getAdminToken(): Promise<string> {
  const needsRefresh = !cache || Date.now() >= cache.expiresAt - REFRESH_BUFFER_MS;

  if (needsRefresh) {
    if (!loginPromise) {
      loginPromise = login().finally(() => {
        loginPromise = null;
      });
    }
    return loginPromise;
  }

  return cache!.token;
}

/** Force re-login ngay lập tức (dùng khi nhận 401 từ API) */
export async function forceRefresh(): Promise<string> {
  cache = null;
  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null;
    });
  }
  return loginPromise;
}

/** Thông tin cache hiện tại (dùng cho status page) */
export function getTokenInfo(): {
  hasToken: boolean;
  expiresAt?: string;
  expiresInMinutes?: number;
  userId?: number;
  role?: string;
} {
  if (!cache) return { hasToken: false };
  const expiresInMs = cache.expiresAt - Date.now();
  return {
    hasToken: true,
    expiresAt: new Date(cache.expiresAt).toISOString(),
    expiresInMinutes: Math.round(expiresInMs / 60000),
    userId: cache.userId,
    role: cache.role,
  };
}
