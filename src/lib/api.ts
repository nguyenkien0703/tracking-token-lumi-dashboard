import { UserCostSummary, HistoryData, SessionMessagesResponse, MessageCostDetail, SessionMessageEntry } from "@/types";

// Tất cả API calls đi qua proxy — token được quản lý hoàn toàn server-side
const PROXY = "/api/proxy";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PROXY}/${path}`, { cache: "no-store" });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? `API ${res.status}: request failed`);
  }
  const json = await res.json();
  return json.data as T;
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
  return apiFetch(`api/v1/normal-mode/costs/user/${userId}${qs ? `?${qs}` : ""}`);
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
  return apiFetch(`api/v1/normal-mode/costs/history?${sp.toString()}`);
}

export async function getSessionCost(sessionId: string): Promise<UserCostSummary> {
  return apiFetch(`api/v1/normal-mode/costs/session/${sessionId}`);
}

export async function getMessageCostDetail(
  sessionId: string,
  messageId: number
): Promise<MessageCostDetail> {
  return apiFetch(
    `api/v1/normal-mode/costs/session/${sessionId}/message/${messageId}`
  );
}

export async function getSessionMessages(
  sessionId: string,
  offset = 0,
  limit = 20,
  order: "asc" | "desc" = "asc"
): Promise<SessionMessagesResponse> {
  const sp = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    order,
  });
  const res = await fetch(
    `${PROXY}/api/v1/normal-mode/costs/session/${sessionId}/messages?${sp.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? `API ${res.status}: request failed`);
  }
  const json = await res.json();
  // API returns: { success, data: { entries: [...], total, limit, offset } }
  const payload = json.data as { entries: SessionMessagesResponse["data"]; total: number; limit: number; offset: number };
  const pagination: SessionMessagesResponse["pagination"] = {
    total: payload.total,
    limit: payload.limit,
    offset: payload.offset,
    hasNext: payload.offset + payload.limit < payload.total,
    hasPrev: payload.offset > 0,
  };
  return { data: payload.entries, pagination };
}
