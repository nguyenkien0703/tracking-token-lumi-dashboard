import { UserCostSummary, HistoryData } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function getUserCost(
  userId: number,
  from?: string,
  to?: string
): Promise<UserCostSummary> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const url = `${BASE_URL}/api/v1/normal-mode/costs/user/${userId}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: failed to fetch user cost`);
  const json = await res.json();
  return json.data as UserCostSummary;
}

export async function getHistory(params: {
  userId?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
  model?: string;
}): Promise<HistoryData> {
  const sp = new URLSearchParams();
  if (params.userId !== undefined) sp.set("userId", String(params.userId));
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  if (params.offset !== undefined) sp.set("offset", String(params.offset));
  if (params.model) sp.set("model", params.model);
  const url = `${BASE_URL}/api/v1/normal-mode/costs/history?${sp.toString()}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: failed to fetch history`);
  const json = await res.json();
  return json.data as HistoryData;
}

export async function getSessionCost(sessionId: string): Promise<UserCostSummary> {
  const url = `${BASE_URL}/api/v1/normal-mode/costs/session/${sessionId}`;
  const res = await fetch(url, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: failed to fetch session cost`);
  const json = await res.json();
  return json.data as UserCostSummary;
}
